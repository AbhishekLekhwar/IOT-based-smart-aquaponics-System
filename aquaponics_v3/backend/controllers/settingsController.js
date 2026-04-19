const Threshold = require('../models/Threshold');
const Schedule = require('../models/Schedule');
const schedulerService = require('../services/schedulerService');

// GET /api/settings/thresholds
const getThresholds = async (req, res) => {
  try {
    const { deviceId = 'aquaponics-unit-01' } = req.query;
    let thresholds = await Threshold.findOne({ deviceId });
    if (!thresholds) thresholds = await Threshold.create({ deviceId });
    res.json({ success: true, data: thresholds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/settings/thresholds
const updateThresholds = async (req, res) => {
  try {
    const { deviceId = 'aquaponics-unit-01', ...fields } = req.body;
    const thresholds = await Threshold.findOneAndUpdate(
      { deviceId },
      { ...fields, updatedBy: req.user._id },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: thresholds, message: 'Thresholds updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/settings/schedules
const getSchedules = async (req, res) => {
  try {
    const { deviceId = 'aquaponics-unit-01' } = req.query;
    const schedules = await Schedule.find({ deviceId }).sort({ createdAt: -1 });
    res.json({ success: true, data: schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/settings/schedules
const createSchedule = async (req, res, wsClients) => {
  try {
    const { deviceId = 'aquaponics-unit-01', deviceKey, label, cronExpr, action } = req.body;
    if (!deviceKey || !cronExpr || !action || !label)
      return res.status(400).json({ success: false, message: 'deviceKey, label, cronExpr and action are required.' });

    const schedule = await Schedule.create({ deviceId, deviceKey, label, cronExpr, action, createdBy: req.user._id });
    schedulerService.register(schedule, wsClients);
    res.status(201).json({ success: true, data: schedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/settings/schedules/:id
const updateSchedule = async (req, res, wsClients) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found.' });
    schedulerService.reregister(schedule, wsClients);
    res.json({ success: true, data: schedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/settings/schedules/:id
const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found.' });
    schedulerService.unregister(schedule._id.toString());
    res.json({ success: true, message: 'Schedule deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getThresholds, updateThresholds, getSchedules, createSchedule, updateSchedule, deleteSchedule };
