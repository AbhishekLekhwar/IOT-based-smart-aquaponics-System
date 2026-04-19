import React from 'react';
import { statusColors } from '../../utils/formatters';

const SensorCard = ({ icon: Icon, label, value, unit, status, subLabel, trend, sparkData }) => {
  const colors = statusColors[status] || statusColors.unknown;

  return (
    <div className={`card border ${colors.border} ${colors.glow} transition-all duration-500 hover:scale-[1.02] animate-slide-up relative overflow-hidden`}>
      {/* Background accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 ${colors.dot}`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`status-dot ${colors.dot} ${status === 'critical' ? 'animate-pulse' : ''}`} />
            <span className={`text-xs font-medium ${colors.text} capitalize`}>{status}</span>
          </div>
        </div>

        {/* Value */}
        <div className="mb-1">
          <span className={`stat-value ${colors.text}`}>{value}</span>
          {unit && <span className="text-gray-500 text-sm ml-1">{unit}</span>}
        </div>

        {/* Label */}
        <p className="stat-label">{label}</p>

        {/* Sub info / trend */}
        {subLabel && (
          <p className="text-xs text-gray-500 mt-2">{subLabel}</p>
        )}
        {trend !== undefined && (
          <p className={`text-xs mt-1 font-medium ${trend > 0 ? 'text-red-400' : trend < 0 ? 'text-aqua-400' : 'text-gray-500'}`}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '—'} {Math.abs(trend).toFixed(1)} from avg
          </p>
        )}

        {/* Mini sparkline */}
        {sparkData && sparkData.length > 1 && (
          <div className="mt-3 h-8">
            <MiniSparkline data={sparkData} color={colors.dot} status={status} />
          </div>
        )}
      </div>
    </div>
  );
};

const MiniSparkline = ({ data, status }) => {
  const vals = data.map(Number).filter((v) => !isNaN(v));
  if (vals.length < 2) return null;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const w = 200, h = 32;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  const strokeColor = status === 'ok' ? '#10b98a' : status === 'warning' ? '#f59e0b' : '#f87171';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full opacity-60">
      <polyline points={pts} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default SensorCard;
