const mongoose = require('mongoose');

const alertSettingsSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      default: 'aquaponics-unit-01'
    },
    
    // SMS Alert Configuration
    smsAlerts: {
      enabled: { type: Boolean, default: false },
      phoneNumber: { type: String, default: null }, // +1-country-area-number format
      recipients: [
        {
          name: String,
          phoneNumber: String,
          alertTypes: [String] // Critical, Warning, Info
        }
      ]
    },

    // Alert Severity Filters
    alertFilters: {
      critical: { enabled: { type: Boolean, default: true } },
      warning: { enabled: { type: Boolean, default: true } },
      info: { enabled: { type: Boolean, default: false } }
    },

    // Alert Cooldown (to prevent spam)
    cooldownMinutes: { type: Number, default: 15 }, // Minimum minutes between alerts of same type
    lastAlertTimes: {
      waterTemperature: Date,
      roomTemperature: Date,
      humidity: Date,
      waterLevel: Date,
      ph: Date
    },

    // Daily alert limits
    dailyAlertLimit: { type: Number, default: 50 },
    alertsSentToday: { type: Number, default: 0 },
    alertLimitResetTime: Date,

    // Email alerts (for future)
    emailAlerts: {
      enabled: { type: Boolean, default: false },
      recipients: [String]
    },

    // Push notifications (for future)
    pushNotifications: {
      enabled: { type: Boolean, default: false }
    },

    // Notification preferences
    notifyAt: {
      morningAlert: { type: String, default: '08:00' }, // HH:MM format
      eveningAlert: { type: String, default: '18:00' }
    },

    // Logging
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastAlertSent: Date,
    lastAlertMessage: String
  },
  { timestamps: true }
);

// Reset daily alert count at midnight
alertSettingsSchema.pre('save', async function (next) {
  const now = new Date();
  const lastReset = this.alertLimitResetTime || new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastResetDate = new Date(lastReset.getFullYear(), lastReset.getMonth(), lastReset.getDate());
  const todayStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (lastResetDate < todayStartDate) {
    this.alertsSentToday = 0;
    this.alertLimitResetTime = todayStartDate;
  }

  next();
});

// Check if can send alert based on cooldown
alertSettingsSchema.methods.canSendAlert = function (alertType) {
  if (!this.lastAlertTimes[alertType]) return true;

  const lastAlert = new Date(this.lastAlertTimes[alertType]);
  const now = new Date();
  const minutesPassed = (now - lastAlert) / (1000 * 60);

  return minutesPassed >= this.cooldownMinutes;
};

// Check if reached daily limit
alertSettingsSchema.methods.hasReachedDailyLimit = function () {
  return this.alertsSentToday >= this.dailyAlertLimit;
};

// Record alert sent
alertSettingsSchema.methods.recordAlertSent = function (alertType, message) {
  this.lastAlertTimes[alertType] = new Date();
  this.alertsSentToday += 1;
  this.lastAlertSent = new Date();
  this.lastAlertMessage = message;
};

module.exports = mongoose.model('AlertSettings', alertSettingsSchema);
