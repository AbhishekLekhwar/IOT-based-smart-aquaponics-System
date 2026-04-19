const AlertSettings = require('../models/AlertSettings');
const { testTwilioConnection } = require('../services/twilioService');

/**
 * GET /api/alerts/settings
 * Get alert settings for device
 */
const getAlertSettings = async (req, res) => {
  try {
    const { deviceId = 'aquaponics-unit-01' } = req.query;

    let settings = await AlertSettings.findOne({ deviceId });
    
    if (!settings) {
      settings = await AlertSettings.create({ deviceId });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * PUT /api/alerts/settings
 * Update alert settings
 */
const updateAlertSettings = async (req, res) => {
  try {
    const { deviceId = 'aquaponics-unit-01' } = req.query;
    const {
      smsAlerts,
      alertFilters,
      cooldownMinutes,
      dailyAlertLimit,
      notifyAt,
      emailAlerts
    } = req.body;

    let settings = await AlertSettings.findOne({ deviceId });
    
    if (!settings) {
      settings = new AlertSettings({ deviceId });
    }

    // Update fields
    if (smsAlerts) {
      settings.smsAlerts = { ...settings.smsAlerts, ...smsAlerts };
    }
    if (alertFilters) {
      settings.alertFilters = { ...settings.alertFilters, ...alertFilters };
    }
    if (cooldownMinutes !== undefined) {
      settings.cooldownMinutes = cooldownMinutes;
    }
    if (dailyAlertLimit !== undefined) {
      settings.dailyAlertLimit = dailyAlertLimit;
    }
    if (notifyAt) {
      settings.notifyAt = { ...settings.notifyAt, ...notifyAt };
    }
    if (emailAlerts) {
      settings.emailAlerts = { ...settings.emailAlerts, ...emailAlerts };
    }

    settings.updatedBy = req.user?._id;
    await settings.save();

    res.json({
      success: true,
      message: 'Alert settings updated',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * POST /api/alerts/phone-number
 * Set/Update primary SMS phone number
 */
const setPhoneNumber = async (req, res) => {
  try {
    const { deviceId = 'aquaponics-unit-01' } = req.query;
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Validate phone number format (basic check)
    if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Use format: +1234567890'
      });
    }

    let settings = await AlertSettings.findOne({ deviceId });
    
    if (!settings) {
      settings = new AlertSettings({ deviceId });
    }

    settings.smsAlerts.phoneNumber = phoneNumber;
    settings.updatedBy = req.user?._id;
    await settings.save();

    res.json({
      success: true,
      message: 'Phone number updated',
      data: {
        phoneNumber: settings.smsAlerts.phoneNumber,
        enabled: settings.smsAlerts.enabled
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * POST /api/alerts/enable-sms
 * Enable SMS alerts
 */
const enableSMSAlerts = async (req, res) => {
  try {
    const { deviceId = 'aquaponics-unit-01' } = req.query;
    const { phoneNumber, enabled = true } = req.body;

    if (enabled && !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number required to enable SMS alerts'
      });
    }

    let settings = await AlertSettings.findOne({ deviceId });
    
    if (!settings) {
      settings = new AlertSettings({ deviceId });
    }

    if (phoneNumber) {
      settings.smsAlerts.phoneNumber = phoneNumber;
    }

    settings.smsAlerts.enabled = enabled;
    settings.updatedBy = req.user?._id;
    await settings.save();

    res.json({
      success: true,
      message: `SMS alerts ${enabled ? 'enabled' : 'disabled'}`,
      data: {
        smsEnabled: settings.smsAlerts.enabled,
        phoneNumber: settings.smsAlerts.phoneNumber
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * POST /api/alerts/add-recipient
 * Add additional SMS recipient
 */
const addRecipient = async (req, res) => {
  try {
    const { deviceId = 'aquaponics-unit-01' } = req.query;
    const { name, phoneNumber, alertTypes = ['critical', 'warning'] } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    let settings = await AlertSettings.findOne({ deviceId });
    
    if (!settings) {
      settings = new AlertSettings({ deviceId });
    }

    // Check if recipient already exists
    const existingRecipient = settings.smsAlerts.recipients.find(
      r => r.phoneNumber === phoneNumber
    );

    if (existingRecipient) {
      return res.status(400).json({
        success: false,
        error: 'Recipient already added'
      });
    }

    settings.smsAlerts.recipients.push({
      name: name || 'Recipient',
      phoneNumber,
      alertTypes
    });

    settings.updatedBy = req.user?._id;
    await settings.save();

    res.json({
      success: true,
      message: 'Recipient added',
      data: settings.smsAlerts.recipients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * DELETE /api/alerts/recipient/:phoneNumber
 * Remove SMS recipient
 */
const removeRecipient = async (req, res) => {
  try {
    const { deviceId = 'aquaponics-unit-01' } = req.query;
    const { phoneNumber } = req.params;

    const settings = await AlertSettings.findOne({ deviceId });
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        error: 'Settings not found'
      });
    }

    settings.smsAlerts.recipients = settings.smsAlerts.recipients.filter(
      r => r.phoneNumber !== phoneNumber
    );

    settings.updatedBy = req.user?._id;
    await settings.save();

    res.json({
      success: true,
      message: 'Recipient removed',
      data: settings.smsAlerts.recipients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * POST /api/alerts/test-sms
 * Send test SMS to configured phone number
 */
const testSMS = async (req, res) => {
  try {
    const { deviceId = 'aquaponics-unit-01' } = req.query;
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required for test'
      });
    }

    const result = await testTwilioConnection(phoneNumber);

    res.json({
      success: result.success,
      message: result.success 
        ? 'Test SMS sent successfully! Check your phone.' 
        : 'Failed to send test SMS',
      details: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/alerts/recipients
 * Get all configured SMS recipients
 */
const getRecipients = async (req, res) => {
  try {
    const { deviceId = 'aquaponics-unit-01' } = req.query;

    const settings = await AlertSettings.findOne({ deviceId });
    
    if (!settings) {
      return res.json({
        success: true,
        data: {
          primaryPhone: null,
          recipients: []
        }
      });
    }

    res.json({
      success: true,
      data: {
        primaryPhone: settings.smsAlerts.phoneNumber,
        recipients: settings.smsAlerts.recipients,
        enabled: settings.smsAlerts.enabled
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getAlertSettings,
  updateAlertSettings,
  setPhoneNumber,
  enableSMSAlerts,
  addRecipient,
  removeRecipient,
  testSMS,
  getRecipients
};
