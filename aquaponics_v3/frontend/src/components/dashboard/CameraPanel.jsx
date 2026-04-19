import React, { useState, useEffect } from 'react';
import { cameraAPI } from '../../utils/api';

/**
 * Displays live camera feed from Raspberry Pi
 * Shows latest snapshot or MJPEG stream
 */
export default function CameraPanel() {
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [historyImages, setHistoryImages] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    // Fetch available cameras
    useEffect(() => {
        fetchCameras();
        const interval = setInterval(fetchCameras, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    // Fetch current image
    useEffect(() => {
        if (selectedCamera && autoRefresh) {
            fetchCurrentImage();
            const interval = setInterval(fetchCurrentImage, 5000); // Refresh every 5s
            return () => clearInterval(interval);
        }
    }, [selectedCamera, autoRefresh]);

    const fetchCameras = async () => {
        try {
            const response = await cameraAPI.getCameras();
            setCameras(response.data.cameras);
            
            // Auto-select first camera
            if (response.data.cameras.length > 0 && !selectedCamera) {
                setSelectedCamera(response.data.cameras[0]._id);
            }

            // Fetch stats
            const statsResponse = await cameraAPI.getStats();
            setStats(statsResponse.data);
        } catch (err) {
            console.error('Failed to fetch cameras:', err);
            setError('Failed to load cameras');
        }
    };

    const fetchCurrentImage = async () => {
        if (!selectedCamera) return;

        try {
            setLoading(true);
            const response = await cameraAPI.getLatestSnapshot(selectedCamera, 'base64');
            setCurrentImage(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch image:', err);
            setError('Failed to load image');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        if (!selectedCamera) return;

        try {
            const response = await cameraAPI.getHistory(selectedCamera, 12);
            setHistoryImages(response.data.images);
            setShowHistory(true);
        } catch (err) {
            console.error('Failed to fetch history:', err);
        }
    };

    const deleteImage = async (imageId) => {
        try {
            await cameraAPI.deleteImage(imageId);
            fetchHistory();
            if (currentImage?.image_id === imageId) {
                fetchCurrentImage();
            }
        } catch (err) {
            console.error('Failed to delete image:', err);
        }
    };

    const cleanupOldImages = async () => {
        if (!selectedCamera) return;

        if (window.confirm('Delete all images except the 5 most recent?')) {
            try {
                await cameraAPI.cleanupOldImages(selectedCamera, 5);
                fetchHistory();
                fetchCurrentImage();
            } catch (err) {
                console.error('Failed to cleanup images:', err);
            }
        }
    };

    const handleFormatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="bg-gray-50 rounded-lg shadow-md p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span>🎥</span> Raspberry Pi Cameras
                </h2>
                <button
                    onClick={fetchCameras}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* No Cameras */}
            {cameras.length === 0 ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    <p>📡 No cameras connected. Start the Raspberry Pi camera service to begin.</p>
                </div>
            ) : (
                <>
                    {/* Camera Selector */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {cameras.map((camera) => (
                            <button
                                key={camera._id}
                                onClick={() => setSelectedCamera(camera._id)}
                                className={`px-4 py-2 rounded font-medium whitespace-nowrap transition ${
                                    selectedCamera === camera._id
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {camera._id}
                                <br />
                                <span className="text-xs">({camera.count} images)</span>
                            </button>
                        ))}
                    </div>

                    {/* Image Display */}
                    {currentImage && (
                        <div className="space-y-4">
                            {/* Current Image */}
                            <div className="bg-black rounded-lg overflow-hidden">
                                <img
                                    src={`data:image/${currentImage.image_type};base64,${currentImage.image_data}`}
                                    alt="Current snapshot"
                                    className="w-full h-auto max-h-96 object-contain"
                                />
                            </div>

                            {/* Image Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-white p-3 rounded border border-gray-200">
                                    <p className="text-gray-600">Resolution</p>
                                    <p className="font-semibold text-gray-900">{currentImage.resolution}</p>
                                </div>
                                <div className="bg-white p-3 rounded border border-gray-200">
                                    <p className="text-gray-600">File Size</p>
                                    <p className="font-semibold text-gray-900">{handleFormatBytes(currentImage.file_size)}</p>
                                </div>
                                <div className="bg-white p-3 rounded border border-gray-200">
                                    <p className="text-gray-600">Time</p>
                                    <p className="font-semibold text-gray-900">
                                        {new Date(currentImage.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded border border-gray-200">
                                    <p className="text-gray-600">Type</p>
                                    <p className="font-semibold text-gray-900 uppercase">{currentImage.image_type}</p>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={fetchCurrentImage}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                    disabled={loading}
                                >
                                    📷 Fetch Latest
                                </button>
                                <button
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                    className={`px-4 py-2 rounded text-white font-medium ${
                                        autoRefresh ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'
                                    }`}
                                >
                                    {autoRefresh ? '⏸️ Auto-Refresh ON' : '▶️ Auto-Refresh OFF'}
                                </button>
                                <button
                                    onClick={fetchHistory}
                                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                                >
                                    📜 History
                                </button>
                                <button
                                    onClick={cleanupOldImages}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    🗑️ Cleanup
                                </button>
                            </div>
                        </div>
                    )}

                    {/* History Modal */}
                    {showHistory && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg max-w-2xl max-h-96 overflow-auto p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold">Image History</h3>
                                    <button
                                        onClick={() => setShowHistory(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {historyImages.length === 0 ? (
                                    <p className="text-gray-500">No images in history</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        {historyImages.map((img) => (
                                            <div key={img.image_id} className="border rounded p-2 text-sm">
                                                <p className="font-mono text-xs break-all text-gray-600">
                                                    {img.image_id}
                                                </p>
                                                <p className="text-gray-700">{new Date(img.timestamp).toLocaleString()}</p>
                                                <p className="text-gray-600">{handleFormatBytes(img.file_size)}</p>
                                                {img.is_recent && <p className="text-green-600 font-bold">Latest</p>}
                                                <button
                                                    onClick={() => deleteImage(img.image_id)}
                                                    className="mt-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Storage Stats */}
                    {stats && (
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="font-bold text-gray-800 mb-3">📊 Storage Stats</h3>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Total Images</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.total_images}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Total Size</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.total_size_mb} MB</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Cameras</p>
                                    <p className="text-2xl font-bold text-blue-600">{cameras.length}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}


