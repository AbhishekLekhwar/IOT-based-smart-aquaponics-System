import React from 'react';
import { AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';
import { formatTimeAgo } from '../../utils/formatters';

const severityConfig = {
  critical: { Icon: AlertOctagon, color: 'text-red-400', bg: 'bg-red-950/60', border: 'border-red-800/50', label: 'Critical' },
  warning: { Icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-950/60', border: 'border-amber-800/50', label: 'Warning' },
  info: { Icon: Info, color: 'text-blue-400', bg: 'bg-blue-950/60', border: 'border-blue-800/50', label: 'Info' },
};

const AlertBanner = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return (
    <div className="card border-aqua-500/20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-aqua-500/10 flex items-center justify-center">
          <span className="text-aqua-400 text-sm">✓</span>
        </div>
        <div>
          <p className="text-sm font-medium text-aqua-400">All systems normal</p>
          <p className="text-xs text-gray-500">No active alerts</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      {alerts.slice(0, 5).map((alert, i) => {
        const config = severityConfig[alert.severity] || severityConfig.info;
        const { Icon } = config;
        return (
          <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${config.bg} ${config.border} animate-slide-up`}>
            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.color}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${config.color}`}>{alert.message}</p>
              {alert.timestamp && (
                <p className="text-xs text-gray-500 mt-0.5">{formatTimeAgo(alert.timestamp)}</p>
              )}
            </div>
            <span className={`badge ${config.bg} ${config.color} text-[10px] capitalize flex-shrink-0`}>
              {config.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default AlertBanner;
