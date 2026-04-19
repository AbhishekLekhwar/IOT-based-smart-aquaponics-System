import { format, formatDistanceToNow } from 'date-fns';

export const formatTemp = (val) => (val !== null && val !== undefined ? `${val.toFixed(1)}°C` : '—');
export const formatPercent = (val) => (val !== null && val !== undefined ? `${val.toFixed(1)}%` : '—');
export const formatGasSensor = (val) => (val !== null && val !== undefined ? `${val.toFixed(0)} ppm` : '—');

export const formatTime = (date) => format(new Date(date), 'HH:mm:ss');
export const formatDateTime = (date) => format(new Date(date), 'MMM d, HH:mm');
export const formatTimeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

export const getWaterTempStatus = (val) => {
  if (val === null || val === undefined) return 'unknown';
  if (val < 18 || val > 28) return val < 15 || val > 31 ? 'critical' : 'warning';
  return 'ok';
};

export const getRoomTempStatus = (val) => {
  if (val === null || val === undefined) return 'unknown';
  if (val < 15 || val > 35) return 'warning';
  return 'ok';
};

export const getHumidityStatus = (val) => {
  if (val === null || val === undefined) return 'unknown';
  if (val < 40 || val > 80) return 'warning';
  return 'ok';
};

export const getWaterLevelStatus = (val) => {
  if (val === null || val === undefined) return 'unknown';
  if (val < 20) return 'critical';
  if (val < 35) return 'warning';
  return 'ok';
};

export const getGasSensorStatus = (val) => {
  if (val === null || val === undefined) return 'unknown';
  if (val > 2000) return 'critical';
  if (val > 1000) return 'warning';
  return 'ok';
};

export const statusColors = {
  ok: { text: 'text-aqua-400', bg: 'bg-aqua-400/10', border: 'border-aqua-500/30', dot: 'bg-aqua-400', glow: 'glow-aqua' },
  warning: { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-500/30', dot: 'bg-amber-400', glow: 'glow-yellow' },
  critical: { text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-500/30', dot: 'bg-red-400', glow: 'glow-red' },
  unknown: { text: 'text-gray-400', bg: 'bg-gray-700/30', border: 'border-gray-700', dot: 'bg-gray-500', glow: '' },
};

export const RANGES = [
  { label: '1H', value: '1h' },
  { label: '6H', value: '6h' },
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
];
