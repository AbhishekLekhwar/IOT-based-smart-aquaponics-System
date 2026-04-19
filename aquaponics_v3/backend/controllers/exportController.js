const SensorReading = require('../models/SensorReading');

// GET /api/export/csv?range=24h&deviceId=...
const exportCSV = async (req, res) => {
  try {
    const { deviceId = 'aquaponics-unit-01', range = '24h', from, to } = req.query;

    const ranges = { '1h': 3600000, '6h': 21600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
    const query = { deviceId };

    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    } else {
      query.timestamp = { $gte: new Date(Date.now() - (ranges[range] || ranges['24h'])) };
    }

    const readings = await SensorReading.find(query)
      .sort({ timestamp: 1 })
      .select('timestamp waterTemperature roomTemperature humidity waterLevel ph deviceId -_id')
      .lean();

    if (!readings.length) {
      return res.status(404).json({ success: false, message: 'No data found for the selected range.' });
    }

    // Build CSV manually (no extra deps needed beyond json)
    const headers = ['timestamp', 'deviceId', 'waterTemperature', 'roomTemperature', 'humidity', 'waterLevel', 'ph'];
    const rows = readings.map((r) =>
      headers.map((h) => {
        const v = r[h];
        if (h === 'timestamp') return new Date(v).toISOString();
        return v !== null && v !== undefined ? v : '';
      }).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const filename = `aquaponics_${deviceId}_${range}_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/export/json
const exportJSON = async (req, res) => {
  try {
    const { deviceId = 'aquaponics-unit-01', range = '24h' } = req.query;
    const ranges = { '1h': 3600000, '6h': 21600000, '24h': 86400000, '7d': 604800000 };
    const since = new Date(Date.now() - (ranges[range] || ranges['24h']));

    const readings = await SensorReading.find({ deviceId, timestamp: { $gte: since } })
      .sort({ timestamp: 1 })
      .lean();

    const filename = `aquaponics_${deviceId}_${range}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json({ exportedAt: new Date(), deviceId, range, count: readings.length, data: readings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { exportCSV, exportJSON };
