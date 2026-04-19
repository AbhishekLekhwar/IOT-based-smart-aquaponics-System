import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Sensors
export const sensorsAPI = {
  getLatest: () => api.get('/sensors/latest'),
  getHistory: (params) => api.get('/sensors/history', { params }),
  getStats: (params) => api.get('/sensors/stats', { params }),
  getAlerts: (params) => api.get('/sensors/alerts', { params }),
  postData: (data) => api.post('/sensors/data', data),
};

// Devices
export const devicesAPI = {
  getState: () => api.get('/devices/state'),
  toggleControl: (control, value) => api.put('/devices/control', { control, value }),
  toggleAutoMode: (autoMode) => api.put('/devices/automode', { autoMode }),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

// Camera
export const cameraAPI = {
  getCameras: () => api.get('/camera/list'),
  getLatestSnapshot: (piName, format = 'base64') => 
    api.get(`/camera/snapshot/${piName}${format === 'base64' ? '/base64' : ''}`),
  getHistory: (piName, limit = 10, skip = 0) => 
    api.get(`/camera/history/${piName}`, { params: { limit, skip } }),
  getStats: () => api.get('/camera/stats'),
  deleteImage: (imageId) => api.delete(`/camera/image/${imageId}`),
  cleanupOldImages: (piName, keep = 5) => 
    api.delete(`/camera/pi/${piName}/old`, { params: { keep } }),
};

export default api;
