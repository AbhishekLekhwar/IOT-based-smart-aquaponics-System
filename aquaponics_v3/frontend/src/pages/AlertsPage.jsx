import React from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateTime, formatTemp, formatPercent } from '../utils/formatters';

const severityConfig = {
  critical: { Icon: AlertOctagon, color: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-800/40' },
  warning: { Icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-800/40' },
};

const AlertsPage = () => {
  const { alerts } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Alert History</h2>
        <p className="text-sm text-gray-400">Sensor threshold violations and system alerts</p>
      </div>

      {!alerts || alerts.length === 0 ? (
        <div className="card text-center py-16">
          <CheckCircle className="w-12 h-12 text-aqua-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-200 mb-1">No alerts found</h3>
          <p className="text-gray-500 text-sm">All systems operating within normal parameters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const config = severityConfig[alert.severity] || severityConfig.warning;
            const { Icon } = config;
            return (
              <div key={i} className={`card border ${config.border} ${config.bg} flex items-start gap-4`}>
                <div className={`w-9 h-9 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${config.color}`}>{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{alert.type} threshold exceeded</p>
                  {alert.readings && (
                    <div className="flex gap-4 mt-2 text-xs text-gray-400 font-mono">
                      {alert.readings.waterTemperature !== undefined && (
                        <span>💧 {formatTemp(alert.readings.waterTemperature)}</span>
                      )}
                      {alert.readings.roomTemperature !== undefined && (
                        <span>🌡️ {formatTemp(alert.readings.roomTemperature)}</span>
                      )}
                      {alert.readings.humidity !== undefined && (
                        <span>💦 {formatPercent(alert.readings.humidity)}</span>
                      )}
                      {alert.readings.waterLevel !== undefined && (
                        <span>🪣 {formatPercent(alert.readings.waterLevel)}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`badge ${config.bg} ${config.color} capitalize`}>{alert.severity}</span>
                  {alert.timestamp && (
                    <p className="text-[10px] text-gray-500 mt-1.5 font-mono">{formatDateTime(alert.timestamp)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
