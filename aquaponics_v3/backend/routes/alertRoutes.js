const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/alertSettingsController');
const { protect, adminOnly } = require('../middleware/auth');

// Get alert settings
router.get('/settings', protect, ctrl.getAlertSettings);

// Update alert settings
router.put('/settings', protect, adminOnly, ctrl.updateAlertSettings);

// Set/update primary phone number for SMS alerts
router.post('/phone-number', protect, adminOnly, ctrl.setPhoneNumber);

// Enable/Disable SMS alerts
router.post('/enable-sms', protect, adminOnly, ctrl.enableSMSAlerts);

// Add additional SMS recipient
router.post('/add-recipient', protect, adminOnly, ctrl.addRecipient);

// Remove SMS recipient
router.delete('/recipient/:phoneNumber', protect, adminOnly, ctrl.removeRecipient);

// Get all configured recipients
router.get('/recipients', protect, ctrl.getRecipients);

// Send test SMS
router.post('/test-sms', protect, adminOnly, ctrl.testSMS);

module.exports = router;
