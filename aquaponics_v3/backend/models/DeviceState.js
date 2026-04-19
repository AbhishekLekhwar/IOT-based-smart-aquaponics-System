const mongoose = require('mongoose');

const deviceStateSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      default: 'aquaponics-unit-01',
    },
    controls: {
      buzzer: { type: Boolean, default: false },
      led: { type: Boolean, default: true },
      waterPump: { type: Boolean, default: true },
      aerator: { type: Boolean, default: true },
      feeder: { type: Boolean, default: false },
    },
    autoMode: {
      type: Boolean,
      default: false,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: String,
      default: 'system',
    },
  },
  { timestamps: true }
);

const DeviceState = mongoose.model('DeviceState', deviceStateSchema);

module.exports = DeviceState;
