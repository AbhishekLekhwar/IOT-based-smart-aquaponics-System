const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      default: 'aquaponics-unit-01',
    },
    waterTemperature: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    roomTemperature: {
      type: Number,
      required: true,
      min: -10,
      max: 60,
    },
    humidity: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    waterLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 100, // percentage
    },
    gasSensor: {
      type: Number,
      min: 0,
      max: 5000,
      unit: 'ppm',
      default: null,
    },
    alerts: [
      {
        type: { type: String },
        message: String,
        severity: { type: String, enum: ['info', 'warning', 'critical'] },
      },
    ],
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient time-range queries
sensorReadingSchema.index({ timestamp: -1 });
sensorReadingSchema.index({ deviceId: 1, timestamp: -1 });

const SensorReading = mongoose.model('SensorReading', sensorReadingSchema);

module.exports = SensorReading;
