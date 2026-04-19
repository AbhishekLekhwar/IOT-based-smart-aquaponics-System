const twilio = require('twilio');

// Initialize Twilio client only if credentials are provided
let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio client initialized successfully');
  } catch (error) {
    console.warn('⚠️ Failed to initialize Twilio client:', error.message);
  }
} else {
  console.warn('⚠️ Twilio credentials not configured - SMS alerts will be disabled');
}

/**
 * Send SMS alert notification
 * @param {string} toPhoneNumber - Recipient phone number (with country code, e.g., +1234567890)
 * @param {object} alert - Alert object containing {type, message, severity}
 * @param {object} sensorData - Current sensor data
 * @returns {Promise<object>} Response from Twilio API
 */
const sendAlertSMS = async (toPhoneNumber, alert, sensorData = null) => {
  try {
    // Check if Twilio is configured
    if (!twilioClient) {
      console.warn('⚠️ Twilio not configured - SMS alert skipped');
      return { success: false, error: 'Twilio not configured' };
    }

    // Validate phone number and credentials
    if (!toPhoneNumber) {
      console.warn('⚠️ No phone number configured for SMS alerts');
      return { success: false, error: 'No phone number configured' };
    }

    if (!process.env.TWILIO_PHONE_NUMBER) {
      console.warn('⚠️ TWILIO_PHONE_NUMBER not configured');
      return { success: false, error: 'Twilio phone number not configured' };
    }

    // Build message
    const severityEmoji = alert.severity === 'critical' ? '🚨' : '⚠️';
    let messageText = `${severityEmoji} AQUAPONICS ALERT

Type: ${alert.type}
Severity: ${alert.severity.toUpperCase()}
Message: ${alert.message}

Time: ${new Date().toLocaleString()}`;

    // Add sensor data if available
    if (sensorData) {
      messageText += `

Current Status:
• Water Temp: ${sensorData.waterTemperature}°C
• pH: ${sensorData.ph}
• Water Level: ${sensorData.waterLevel}%
• Humidity: ${sensorData.humidity}%`;
    }

    // Send SMS via Twilio
    const response = await twilioClient.messages.create({
      body: messageText,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhoneNumber
    });

    console.log(`✅ SMS Alert sent (SID: ${response.sid})`);
    
    return {
      success: true,
      messageSid: response.sid,
      status: response.status
    };

  } catch (error) {
    console.error('❌ Twilio SMS Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send bulk SMS to multiple alert recipients
 * @param {array} phoneNumbers - Array of phone numbers
 * @param {object} alert - Alert object
 * @param {object} sensorData - Sensor data
 * @returns {Promise<array>} Array of responses
 */
const sendBulkAlertSMS = async (phoneNumbers, alert, sensorData = null) => {
  if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
    return { success: false, error: 'No phone numbers provided' };
  }

  const results = await Promise.all(
    phoneNumbers.map(phone => sendAlertSMS(phone, alert, sensorData))
  );

  return {
    success: true,
    totalSent: results.filter(r => r.success).length,
    totalFailed: results.filter(r => !r.success).length,
    results
  };
};

/**
 * Send critical system alert
 * @param {string} toPhoneNumber - Recipient phone number
 * @param {string} title - Alert title
 * @param {string} description - Alert description
 * @param {string} actionRequired - Required action
 * @returns {Promise<object>} Response
 */
const sendCriticalAlert = async (toPhoneNumber, title, description, actionRequired = null) => {
  try {
    // Check if Twilio is configured
    if (!twilioClient) {
      console.warn('⚠️ Twilio not configured - Critical SMS alert skipped');
      return { success: false, error: 'Twilio not configured' };
    }

    let messageText = `🚨 CRITICAL SYSTEM ALERT

${title}

${description}`;

    if (actionRequired) {
      messageText += `

ACTION REQUIRED:
${actionRequired}`;
    }

    messageText += `

Time: ${new Date().toLocaleString()}
Dashboard: http://localhost:3000`;

    const response = await twilioClient.messages.create({
      body: messageText,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhoneNumber
    });

    console.log(`✅ Critical SMS Alert sent (SID: ${response.sid})`);
    
    return {
      success: true,
      messageSid: response.sid,
      status: response.status
    };

  } catch (error) {
    console.error('❌ Twilio Critical Alert Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Test Twilio connection
 * @param {string} toPhoneNumber - Test phone number
 * @returns {Promise<object>} Test result
 */
const testTwilioConnection = async (toPhoneNumber) => {
  try {
    // Check if Twilio is configured
    if (!twilioClient) {
      return { success: false, error: 'Twilio not configured' };
    }

    if (!toPhoneNumber) {
      return { success: false, error: 'Phone number required for test' };
    }

    const response = await twilioClient.messages.create({
      body: '✅ Aquaponics System SMS Alert Test - Connection successful!',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhoneNumber
    });

    console.log(`✅ Twilio test successful (SID: ${response.sid})`);
    
    return {
      success: true,
      messageSid: response.sid,
      message: 'Test SMS sent successfully'
    };

  } catch (error) {
    console.error('❌ Twilio test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendAlertSMS,
  sendBulkAlertSMS,
  sendCriticalAlert,
  testTwilioConnection
};
