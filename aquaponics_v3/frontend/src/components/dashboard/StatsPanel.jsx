import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatItem = ({ label, value, unit }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-mono font-semibold text-gray-200">
      {value !== null && value !== undefined ? `${Number(value).toFixed(1)}${unit}` : '—'}
    </span>
  </div>
);

const StatsPanel = ({ stats, timeRange }) => {
  if (!stats) return null;

  const rangeLabels = { '1h': 'Last Hour', '6h': 'Last 6 Hours', '24h': 'Last 24 Hours', '7d': 'Last 7 Days' };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">Statistics</h3>
          <p className="text-xs text-gray-500">{rangeLabels[timeRange] || timeRange}</p>
        </div>
        <span className="badge bg-gray-800 text-gray-400">{stats.totalReadings ?? 0} readings</span>
      </div>

      <div className="space-y-4">
        {/* Water Temp */}
        <div>
          <p className="text-xs text-aqua-400 font-medium mb-2">💧 Water Temperature</p>
          <div className="grid grid-cols-3 gap-2">
            <StatItem label="Avg" value={stats.avgWaterTemp} unit="°C" />
            <StatItem label="Min" value={stats.minWaterTemp} unit="°C" />
            <StatItem label="Max" value={stats.maxWaterTemp} unit="°C" />
          </div>
        </div>

        <div className="border-t border-gray-800" />

        {/* Room Temp */}
        <div>
          <p className="text-xs text-orange-400 font-medium mb-2">🌡️ Room Temperature</p>
          <div className="grid grid-cols-1 gap-2">
            <StatItem label="Avg" value={stats.avgRoomTemp} unit="°C" />
          </div>
        </div>

        <div className="border-t border-gray-800" />

        {/* Other */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-blue-400 font-medium mb-2">💦 Humidity</p>
            <StatItem label="Avg" value={stats.avgHumidity} unit="%" />
          </div>
          <div>
            <p className="text-xs text-cyan-400 font-medium mb-2">🪣 Water Level</p>
            <StatItem label="Avg" value={stats.avgWaterLevel} unit="%" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
