import React from 'react';
import { getWaterLevelStatus, statusColors } from '../../utils/formatters';

const WaterLevelGauge = ({ value }) => {
  const status = getWaterLevelStatus(value);
  const colors = statusColors[status];
  const pct = Math.min(Math.max(value || 0, 0), 100);

  const fillColor = status === 'ok' ? '#10b98a' : status === 'warning' ? '#f59e0b' : '#f87171';
  const glowColor = status === 'ok' ? 'rgba(16,185,138,0.3)' : status === 'warning' ? 'rgba(245,158,11,0.3)' : 'rgba(248,113,113,0.3)';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Tank SVG */}
      <div className="relative">
        <svg width="80" height="120" viewBox="0 0 80 120">
          {/* Tank outline */}
          <rect x="10" y="8" width="60" height="104" rx="8" ry="8" fill="none" stroke="#374151" strokeWidth="2" />
          {/* Water fill */}
          <clipPath id="tank-clip">
            <rect x="12" y="10" width="56" height="100" rx="6" ry="6" />
          </clipPath>
          {/* Background */}
          <rect x="12" y="10" width="56" height="100" rx="6" ry="6" fill="#111827" />
          {/* Water */}
          <rect
            x="12"
            y={10 + 100 * (1 - pct / 100)}
            width="56"
            height={100 * (pct / 100)}
            fill={fillColor}
            fillOpacity="0.3"
            clipPath="url(#tank-clip)"
          />
          {/* Wave top */}
          <path
            d={`M12,${10 + 100 * (1 - pct / 100)} Q28,${10 + 100 * (1 - pct / 100) - 4} 40,${10 + 100 * (1 - pct / 100)} Q52,${10 + 100 * (1 - pct / 100) + 4} 68,${10 + 100 * (1 - pct / 100)}`}
            fill="none"
            stroke={fillColor}
            strokeWidth="1.5"
            strokeOpacity="0.8"
            clipPath="url(#tank-clip)"
          />
          {/* Tick marks */}
          {[25, 50, 75].map((tick) => (
            <g key={tick}>
              <line x1="66" y1={10 + 100 * (1 - tick / 100)} x2="72" y2={10 + 100 * (1 - tick / 100)} stroke="#4b5563" strokeWidth="1" />
              <text x="74" y={10 + 100 * (1 - tick / 100) + 4} fill="#6b7280" fontSize="8" fontFamily="monospace">{tick}</text>
            </g>
          ))}
          {/* Percentage text */}
          <text x="40" y="65" textAnchor="middle" fill={fillColor} fontSize="16" fontWeight="bold" fontFamily="monospace">
            {pct.toFixed(0)}%
          </text>
        </svg>
      </div>
      <div className="text-center">
        <p className={`text-sm font-semibold ${colors.text}`}>{pct.toFixed(1)}%</p>
        <p className="stat-label">Water Level</p>
      </div>
    </div>
  );
};

export default WaterLevelGauge;
