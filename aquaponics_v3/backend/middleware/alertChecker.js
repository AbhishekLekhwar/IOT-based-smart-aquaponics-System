const checkThresholds = (data) => {
  const alerts = [];

  const {
    WATER_TEMP_MIN = 18, WATER_TEMP_MAX = 28,
    ROOM_TEMP_MIN = 15, ROOM_TEMP_MAX = 35,
    HUMIDITY_MIN = 40, HUMIDITY_MAX = 80,
    WATER_LEVEL_MIN = 20,
  } = process.env;

  if (data.waterTemperature < parseFloat(WATER_TEMP_MIN)) {
    alerts.push({ type: 'waterTemperature', message: `Water temp too low: ${data.waterTemperature}°C`, severity: 'warning' });
  } else if (data.waterTemperature > parseFloat(WATER_TEMP_MAX)) {
    alerts.push({ type: 'waterTemperature', message: `Water temp too high: ${data.waterTemperature}°C`, severity: 'critical' });
  }

  if (data.roomTemperature < parseFloat(ROOM_TEMP_MIN)) {
    alerts.push({ type: 'roomTemperature', message: `Room temp too low: ${data.roomTemperature}°C`, severity: 'warning' });
  } else if (data.roomTemperature > parseFloat(ROOM_TEMP_MAX)) {
    alerts.push({ type: 'roomTemperature', message: `Room temp too high: ${data.roomTemperature}°C`, severity: 'critical' });
  }

  if (data.humidity < parseFloat(HUMIDITY_MIN)) {
    alerts.push({ type: 'humidity', message: `Humidity too low: ${data.humidity}%`, severity: 'warning' });
  } else if (data.humidity > parseFloat(HUMIDITY_MAX)) {
    alerts.push({ type: 'humidity', message: `Humidity too high: ${data.humidity}%`, severity: 'warning' });
  }

  if (data.waterLevel < parseFloat(WATER_LEVEL_MIN)) {
    alerts.push({ type: 'waterLevel', message: `Water level critical: ${data.waterLevel}%`, severity: 'critical' });
  }

  if (data.gasSensor !== null && data.gasSensor !== undefined) {
    if (data.gasSensor > 1000) alerts.push({ type: 'gasSensor', message: `Gas level high: ${data.gasSensor} ppm`, severity: 'warning' });
    if (data.gasSensor > 2000) alerts.push({ type: 'gasSensor', message: `Gas level critical: ${data.gasSensor} ppm`, severity: 'critical' });
  }

  return alerts;
};

module.exports = { checkThresholds };
