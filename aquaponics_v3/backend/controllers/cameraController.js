const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/camera');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Camera Image Schema
const CameraImageSchema = new mongoose.Schema({
    pi_name: {
        type: String,
        required: true,
        index: true
    },
    image_id: {
        type: String,
        default: uuidv4,
        unique: true,
        index: true
    },
    image_data: Buffer,  // Store as binary data
    image_type: {
        type: String,
        default: 'jpeg'  // jpeg, png, etc
    },
    resolution: String,
    file_size: Number,
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    is_recent: {
        type: Boolean,
        default: false  // True if latest from that Pi
    }
}, { 
    timestamps: true,
    collection: 'camera_images'
});

const CameraImage = mongoose.model('CameraImage', CameraImageSchema);

/**
 * POST /api/camera/snapshot
 * Receive snapshot from Raspberry Pi
 */
exports.receiveSnapshot = async (req, res) => {
    try {
        const { pi_name, image_data, image_type, resolution, timestamp } = req.body;

        if (!pi_name || !image_data) {
            return res.status(400).json({ error: 'Missing pi_name or image_data' });
        }

        // Decode base64 image
        const imageBuffer = Buffer.from(image_data, 'base64');

        // Mark all previous images from this Pi as not recent
        await CameraImage.updateMany({ pi_name }, { is_recent: false });

        // Save new image
        const cameraImage = new CameraImage({
            pi_name,
            image_data: imageBuffer,
            image_type: image_type || 'jpeg',
            resolution,
            file_size: imageBuffer.length,
            timestamp: new Date(timestamp),
            is_recent: true
        });

        await cameraImage.save();

        // Get total images from this Pi
        const count = await CameraImage.countDocuments({ pi_name });

        res.json({
            status: 'success',
            image_id: cameraImage.image_id,
            file_size: imageBuffer.length,
            total_images: count,
            message: `Snapshot received from ${pi_name}`
        });

    } catch (error) {
        console.error('Camera snapshot error:', error);
        res.status(500).json({ error: 'Failed to save snapshot', details: error.message });
    }
};

/**
 * GET /api/camera/snapshot/:piName
 * Get latest snapshot from specific Pi
 */
exports.getLatestSnapshot = async (req, res) => {
    try {
        const { piName } = req.params;

        const image = await CameraImage.findOne({ pi_name: piName, is_recent: true });

        if (!image) {
            return res.status(404).json({ error: `No snapshot found for ${piName}` });
        }

        res.setHeader('Content-Type', `image/${image.image_type}`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.send(image.image_data);

    } catch (error) {
        console.error('Get snapshot error:', error);
        res.status(500).json({ error: 'Failed to retrieve snapshot' });
    }
};

/**
 * GET /api/camera/snapshot/:piName/base64
 * Get latest snapshot as base64
 */
exports.getLatestSnapshotBase64 = async (req, res) => {
    try {
        const { piName } = req.params;

        const image = await CameraImage.findOne({ pi_name: piName, is_recent: true });

        if (!image) {
            return res.status(404).json({ error: `No snapshot found for ${piName}` });
        }

        const base64 = image.image_data.toString('base64');
        res.json({
            image_id: image.image_id,
            pi_name: image.pi_name,
            image_data: base64,
            image_type: image.image_type,
            resolution: image.resolution,
            timestamp: image.timestamp,
            file_size: image.file_size
        });

    } catch (error) {
        console.error('Get snapshot error:', error);
        res.status(500).json({ error: 'Failed to retrieve snapshot' });
    }
};

/**
 * GET /api/camera/history/:piName
 * Get image history for a Pi (paginated)
 */
exports.getImageHistory = async (req, res) => {
    try {
        const { piName } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;

        const images = await CameraImage.find({ pi_name: piName })
            .sort({ timestamp: -1 })
            .limit(limit)
            .skip(skip)
            .select('-image_data');  // Don't send large binary data

        const total = await CameraImage.countDocuments({ pi_name: piName });

        res.json({
            pi_name: piName,
            total: total,
            images: images.map(img => ({
                image_id: img.image_id,
                timestamp: img.timestamp,
                resolution: img.resolution,
                file_size: img.file_size,
                is_recent: img.is_recent
            }))
        });

    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to retrieve history' });
    }
};

/**
 * GET /api/camera/list
 * Get all Pi cameras with latest snapshot info
 */
exports.getCameraList = async (req, res) => {
    try {
        // Get latest image from each Pi
        const cameras = await CameraImage.aggregate([
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: '$pi_name',
                    latest_image_id: { $first: '$image_id' },
                    latest_timestamp: { $first: '$timestamp' },
                    resolution: { $first: '$resolution' },
                    total_images: { $sum: 1 },
                    total_size: { $sum: '$file_size' }
                }
            },
            { $sort: { latest_timestamp: -1 } }
        ]);

        res.json({
            cameras: cameras,
            total_cameras: cameras.length
        });

    } catch (error) {
        console.error('Get camera list error:', error);
        res.status(500).json({ error: 'Failed to retrieve camera list' });
    }
};

/**
 * DELETE /api/camera/image/:imageId
 * Delete a specific image
 */
exports.deleteImage = async (req, res) => {
    try {
        const { imageId } = req.params;

        const result = await CameraImage.findOneAndDelete({ image_id: imageId });

        if (!result) {
            return res.status(404).json({ error: 'Image not found' });
        }

        res.json({ status: 'success', message: 'Image deleted' });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
};

/**
 * DELETE /api/camera/pi/:piName/old
 * Delete old images from Pi (keep latest N)
 */
exports.deleteOldImages = async (req, res) => {
    try {
        const { piName } = req.params;
        const keepCount = parseInt(req.query.keep) || 10;

        // Find images to delete (older than N most recent)
        const imagesToKeep = await CameraImage.find({ pi_name: piName })
            .sort({ timestamp: -1 })
            .limit(keepCount)
            .select('_id');

        const keepIds = imagesToKeep.map(img => img._id);

        const result = await CameraImage.deleteMany({
            pi_name: piName,
            _id: { $nin: keepIds }
        });

        res.json({
            status: 'success',
            deleted_count: result.deletedCount,
            kept_count: keepCount,
            message: `Kept ${keepCount} latest images`
        });

    } catch (error) {
        console.error('Delete old images error:', error);
        res.status(500).json({ error: 'Failed to clean up images' });
    }
};

/**
 * GET /api/camera/stats
 * Get camera storage statistics
 */
exports.getCameraStats = async (req, res) => {
    try {
        const stats = await CameraImage.aggregate([
            {
                $group: {
                    _id: '$pi_name',
                    count: { $sum: 1 },
                    total_size_bytes: { $sum: '$file_size' },
                    latest: { $max: '$timestamp' }
                }
            },
            {
                $addFields: {
                    total_size_mb: { $divide: ['$total_size_bytes', 1048576] }
                }
            },
            { $sort: { latest: -1 } }
        ]);

        const totalImages = await CameraImage.countDocuments();
        const totalSize = await CameraImage.aggregate([
            { $group: { _id: null, total: { $sum: '$file_size' } } }
        ]);

        res.json({
            total_images: totalImages,
            total_size_mb: totalSize[0]?.total ? (totalSize[0].total / 1048576).toFixed(2) : 0,
            by_camera: stats
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to retrieve stats' });
    }
};

exports.CameraImage = CameraImage;
