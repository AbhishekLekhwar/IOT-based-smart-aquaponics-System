const express = require('express');
const router = express.Router();
const cameraController = require('../controllers/cameraController');

// Receive snapshot from Raspberry Pi
router.post('/snapshot', cameraController.receiveSnapshot);

// Get latest snapshot from Pi
router.get('/snapshot/:piName', cameraController.getLatestSnapshot);
router.get('/snapshot/:piName/base64', cameraController.getLatestSnapshotBase64);

// Get image history
router.get('/history/:piName', cameraController.getImageHistory);

// Get all cameras
router.get('/list', cameraController.getCameraList);

// Get stats
router.get('/stats', cameraController.getCameraStats);

// Delete image
router.delete('/image/:imageId', cameraController.deleteImage);

// Cleanup old images
router.delete('/pi/:piName/old', cameraController.deleteOldImages);

module.exports = router;
