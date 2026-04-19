const DeviceState = require('../models/DeviceState');

const DEFAULT_DEVICE_ID = 'aquaponics-unit-01';

// GET /api/devices/state
const getDeviceState = async (req, res) => {
  try {
    const { deviceId = DEFAULT_DEVICE_ID } = req.query;
    let state = await DeviceState.findOne({ deviceId });

    if (!state) {
      state = await DeviceState.create({ deviceId });
    }

    res.json({ success: true, data: state });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/devices/control — toggle a device on/off
const updateControl = async (req, res, wsClients) => {
  try {
    const { deviceId = DEFAULT_DEVICE_ID, control, value } = req.body;

    const allowedControls = ['buzzer', 'led', 'waterPump', 'aerator', 'feeder'];
    if (!allowedControls.includes(control)) {
      return res.status(400).json({ success: false, message: `Invalid control. Must be one of: ${allowedControls.join(', ')}` });
    }

    if (typeof value !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Value must be a boolean' });
    }

    let state = await DeviceState.findOne({ deviceId });
    if (!state) {
      state = new DeviceState({ deviceId });
    }

    state.controls[control] = value;
    state.lastUpdated = new Date();
    state.updatedBy = req.headers['x-user'] || 'web-dashboard';
    await state.save();

    // Broadcast device state change to WebSocket clients
    const payload = JSON.stringify({ type: 'DEVICE_UPDATE', data: state });
    wsClients.forEach((client) => {
      if (client.readyState === 1) client.send(payload);
    });

    res.json({ success: true, data: state, message: `${control} turned ${value ? 'ON' : 'OFF'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/devices/automode
const toggleAutoMode = async (req, res, wsClients) => {
  try {
    const { deviceId = DEFAULT_DEVICE_ID, autoMode } = req.body;

    let state = await DeviceState.findOne({ deviceId });
    if (!state) state = new DeviceState({ deviceId });

    state.autoMode = autoMode;
    state.lastUpdated = new Date();
    await state.save();

    const payload = JSON.stringify({ type: 'DEVICE_UPDATE', data: state });
    wsClients.forEach((client) => {
      if (client.readyState === 1) client.send(payload);
    });

    res.json({ success: true, data: state, message: `Auto mode ${autoMode ? 'enabled' : 'disabled'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDeviceState, updateControl, toggleAutoMode };
