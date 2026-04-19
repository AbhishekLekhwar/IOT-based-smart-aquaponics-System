const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/auth');

module.exports = (wsClients) => {
  router.get('/thresholds', protect, ctrl.getThresholds);
  router.put('/thresholds', protect, adminOnly, ctrl.updateThresholds);

  router.get('/schedules', protect, ctrl.getSchedules);
  router.post('/schedules', protect, adminOnly, (req, res) => ctrl.createSchedule(req, res, wsClients));
  router.put('/schedules/:id', protect, adminOnly, (req, res) => ctrl.updateSchedule(req, res, wsClients));
  router.delete('/schedules/:id', protect, adminOnly, ctrl.deleteSchedule);

  return router;
};
