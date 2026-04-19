const express = require('express');
const router = express.Router();
const {
  getDeviceState,
  updateControl,
  toggleAutoMode,
} = require('../controllers/deviceController');

module.exports = (wsClients) => {
  // GET current device states
  router.get('/state', getDeviceState);

  // PUT toggle a device
  router.put('/control', (req, res) => updateControl(req, res, wsClients));

  // PUT toggle auto mode
  router.put('/automode', (req, res) => toggleAutoMode(req, res, wsClients));

  return router;
};
