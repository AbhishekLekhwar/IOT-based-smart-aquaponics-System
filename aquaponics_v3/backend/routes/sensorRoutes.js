const express = require('express');
const router = express.Router();
const {
  ingestSensorData,
  getLatestReading,
  getHistory,
  getStats,
  getAlerts,
} = require('../controllers/sensorController');

module.exports = (wsClients) => {
  // POST - Arduino/RPi sends data here
  router.post('/data', (req, res) => ingestSensorData(req, res, wsClients));

  // GET - latest reading
  router.get('/latest', getLatestReading);

  // GET - historical data with range filtering
  router.get('/history', getHistory);

  // GET - aggregated statistics
  router.get('/stats', getStats);

  // GET - alert history
  router.get('/alerts', getAlerts);

  return router;
};
