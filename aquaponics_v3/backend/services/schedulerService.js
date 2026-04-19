const cron = require('node-cron');
const DeviceState = require('../models/DeviceState');
const Schedule = require('../models/Schedule');

const jobs = new Map(); // scheduleId -> cron task

const executeSchedule = async (schedule, wsClients) => {
  try {
    const state = await DeviceState.findOneAndUpdate(
      { deviceId: schedule.deviceId },
      { [`controls.${schedule.deviceKey}`]: schedule.action === 'on', lastUpdated: new Date(), updatedBy: 'scheduler' },
      { new: true, upsert: true }
    );

    await Schedule.findByIdAndUpdate(schedule._id, { lastRun: new Date() });

    console.log(`⏰ Schedule "${schedule.label}": ${schedule.deviceKey} turned ${schedule.action.toUpperCase()}`);

    if (wsClients) {
      const payload = JSON.stringify({ type: 'DEVICE_UPDATE', data: state, source: 'scheduler' });
      wsClients.forEach((client) => { if (client.readyState === 1) client.send(payload); });
    }
  } catch (err) {
    console.error('Scheduler execution error:', err.message);
  }
};

const register = (schedule, wsClients) => {
  if (!schedule.enabled) return;
  if (!cron.validate(schedule.cronExpr)) {
    console.warn(`⚠️  Invalid cron expression for schedule "${schedule.label}": ${schedule.cronExpr}`);
    return;
  }
  const task = cron.schedule(schedule.cronExpr, () => executeSchedule(schedule, wsClients), { timezone: 'UTC' });
  jobs.set(schedule._id.toString(), task);
  console.log(`✅ Schedule registered: "${schedule.label}" [${schedule.cronExpr}] → ${schedule.deviceKey} ${schedule.action}`);
};

const unregister = (scheduleId) => {
  const task = jobs.get(scheduleId);
  if (task) { task.destroy(); jobs.delete(scheduleId); }
};

const reregister = (schedule, wsClients) => {
  unregister(schedule._id.toString());
  register(schedule, wsClients);
};

const loadAll = async (wsClients) => {
  try {
    const schedules = await Schedule.find({ enabled: true });
    schedules.forEach((s) => register(s, wsClients));
    console.log(`⏰ Loaded ${schedules.length} scheduled tasks`);
  } catch (err) {
    console.error('Failed to load schedules:', err.message);
  }
};

module.exports = { register, unregister, reregister, loadAll };
