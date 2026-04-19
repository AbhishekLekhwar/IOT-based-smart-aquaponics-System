const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    deviceId:   { type: String, required: true, default: 'aquaponics-unit-01' },
    deviceKey:  { type: String, required: true }, // buzzer | led | waterPump | aerator | feeder
    label:      { type: String, required: true },
    cronExpr:   { type: String, required: true }, // standard cron: "0 8 * * *"
    action:     { type: String, enum: ['on', 'off'], required: true },
    enabled:    { type: Boolean, default: true },
    lastRun:    { type: Date },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
