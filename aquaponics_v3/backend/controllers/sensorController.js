const SensorReading = require('../models/SensorReading');
const AlertSettings = require('../models/AlertSettings');
const { checkThresholds } = require('../middleware/alertChecker');
const { sendAlertSMS, sendBulkAlertSMS } = require('../services/twilioService');

// POST /api/sensors/data — receives data from Arduino/RPi
const ingestSensorData = async (req, res, wsClients) => {
  try {
    const { deviceId, waterTemperature, roomTemperature, humidity, waterLevel, gasSensor } = req.body;

    if (waterTemperature === undefined || roomTemperature === undefined ||
        humidity === undefined || waterLevel === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required sensor fields' });
    }

    const alerts = checkThresholds({ waterTemperature, roomTemperature, humidity, waterLevel, gasSensor });

    const reading = new SensorReading({
      deviceId: deviceId || 'aquaponics-unit-01',
      waterTemperature,
      roomTemperature,
      humidity,
      waterLevel,
      gasSensor: gasSensor ?? null,
      alerts,
      timestamp: new Date(),
    });

    await reading.save();

    // Handle SMS alerts asynchronously
    if (alerts && alerts.length > 0) {
      setImmediate(() => {
        handleAlerts(
          alerts,
          deviceId || 'aquaponics-unit-01',
          { waterTemperature, roomTemperature, humidity, waterLevel, gasSensor }
        ).catch(err => console.error('Alert handling error:', err));
      });
    }

    // Broadcast to all WebSocket clients
    const payload = JSON.stringify({ type: 'SENSOR_UPDATE', data: reading });
    wsClients.forEach((client) => {
      if (client.readyState === 1) client.send(payload);
    });

    res.status(201).json({ success: true, data: reading });
  } catch (error) {
    console.error('Sensor ingest error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Handle alerts and send SMS notifications
 */
const handleAlerts = async (alerts, deviceId, sensorData) => {
  try {
    const settings = await AlertSettings.findOne({ deviceId });
    
    if (!settings || !settings.smsAlerts.enabled) {
      return;
    }

    // Check daily alert limit
    if (settings.hasReachedDailyLimit()) {
      console.warn(`⚠️ Daily alert limit reached for ${deviceId}`);
      return;
    }

    // Process each alert
    for (const alert of alerts) {
      // Check if alert type is enabled in filters
      const filterKey = alert.severity; // 'critical', 'warning'
      if (!settings.alertFilters[filterKey]?.enabled) {
        continue;
      }

      // Check cooldown period
      if (!settings.canSendAlert(alert.type)) {
        console.log(`⏱️ Alert cooldown active for ${alert.type}`);
        continue;
      }

      // Prepare phone numbers to notify
      const phoneNumbers = [];
      
      // Add primary phone
      if (settings.smsAlerts.phoneNumber) {
        phoneNumbers.push(settings.smsAlerts.phoneNumber);
      }

      // Add recipients based on alert type
      settings.smsAlerts.recipients.forEach(recipient => {
        if (recipient.alertTypes.includes(filterKey)) {
          phoneNumbers.push(recipient.phoneNumber);
        }
      });

      // Remove duplicates
      const uniquePhones = [...new Set(phoneNumbers)];

      if (uniquePhones.length > 0) {
        // Send SMS alerts
        const smsResults = await sendBulkAlertSMS(uniquePhones, alert, sensorData);
        
        // Record alert
        if (smsResults.success && smsResults.totalSent > 0) {
          settings.recordAlertSent(alert.type, alert.message);
          await settings.save();
          
          console.log(`✅ SMS alerts sent: ${smsResults.totalSent} succeeded, ${smsResults.totalFailed} failed`);
        }
      }
    }

  } catch (error) {
    console.error('Error handling alerts:', error);
  }
};

// GET /api/sensors/latest — most recent reading
const getLatestReading = async (req, res) => {
  try {
    const { deviceId = 'aquaponics-unit-01' } = req.query;
    const reading = await SensorReading.findOne({ deviceId }).sort({ timestamp: -1 });
    if (!reading) return res.status(404).json({ success: false, message: 'No data found' });
    res.json({ success: true, data: reading });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/sensors/history — paginated historical data
const getHistory = async (req, res) => {
  try {
    const {
      deviceId = 'aquaponics-unit-01',
      limit = 50,
      page = 1,
      from,
      to,
      range, // '1h', '6h', '24h', '7d'
    } = req.query;

    const query = { deviceId };

    if (range) {
      const now = new Date();
      const ranges = { '1h': 3600000, '6h': 21600000, '24h': 86400000, '7d': 604800000 };
      if (ranges[range]) {
        query.timestamp = { $gte: new Date(now - ranges[range]) };
      }
    } else if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await SensorReading.countDocuments(query);
    const readings = await SensorReading.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: readings,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/sensors/stats — aggregated stats
const getStats = async (req, res) => {
  try {
    const { deviceId = 'aquaponics-unit-01', range = '24h' } = req.query;
    const ranges = { '1h': 3600000, '6h': 21600000, '24h': 86400000, '7d': 604800000 };
    const since = new Date(Date.now() - (ranges[range] || ranges['24h']));

    const stats = await SensorReading.aggregate([
      { $match: { deviceId, timestamp: { $gte: since } } },
      {
        $group: {
          _id: null,
          avgWaterTemp: { $avg: '$waterTemperature' },
          minWaterTemp: { $min: '$waterTemperature' },
          maxWaterTemp: { $max: '$waterTemperature' },
          avgRoomTemp: { $avg: '$roomTemperature' },
          avgHumidity: { $avg: '$humidity' },
          avgWaterLevel: { $avg: '$waterLevel' },
          totalReadings: { $sum: 1 },
        },
      },
    ]);

    res.json({ success: true, data: stats[0] || {}, range });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/sensors/alerts — recent alerts
const getAlerts = async (req, res) => {
  try {
    const { deviceId = 'aquaponics-unit-01', limit = 20 } = req.query;
    const readings = await SensorReading.find({
      deviceId,
      'alerts.0': { $exists: true },
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .select('alerts timestamp waterTemperature roomTemperature humidity waterLevel');

    const alerts = readings.flatMap((r) =>
      r.alerts.map((a) => ({ ...a.toObject(), timestamp: r.timestamp, readings: r }))
    );

    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { ingestSensorData, getLatestReading, getHistory, getStats, getAlerts };
