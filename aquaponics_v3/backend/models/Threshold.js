const mongoose = require('mongoose');

const thresholdSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true, default: 'aquaponics-unit-01' },
    waterTemperature: { min: { type: Number, default: 18 }, max: { type: Number, default: 28 } },
    roomTemperature:  { min: { type: Number, default: 15 }, max: { type: Number, default: 35 } },
    humidity:         { min: { type: Number, default: 40 }, max: { type: Number, default: 80 } },
    waterLevel:       { min: { type: Number, default: 20 } },
    ph:               { min: { type: Number, default: 6.0 }, max: { type: Number, default: 8.0 } },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Threshold', thresholdSchema);
