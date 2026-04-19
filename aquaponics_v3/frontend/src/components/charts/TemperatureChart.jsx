import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { formatTime } from '../../utils/formatters';

const METRICS = [
  { key: 'waterTemperature', label: 'Water Temp (°C)', color: '#10b98a', refMin: 18, refMax: 28 },
  { key: 'roomTemperature', label: 'Room Temp (°C)', color: '#f97316', refMin: 15, refMax: 35 },
  { key: 'humidity', label: 'Humidity (%)', color: '#60a5fa', refMin: 40, refMax: 80 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-gray-400 mb-2 font-mono">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="font-mono font-bold" style={{ color: p.color }}>{Number(p.value).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};

const TemperatureChart = ({ history, activeMetrics: externalActive }) => {
  const [activeMetrics, setActiveMetrics] = useState(['waterTemperature', 'roomTemperature']);

  const toggleMetric = (key) => {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const chartData = [...history]
    .reverse()
    .slice(-60)
    .map((r) => ({
      time: formatTime(r.timestamp),
      waterTemperature: r.waterTemperature,
      roomTemperature: r.roomTemperature,
      humidity: r.humidity,
    }));

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">Sensor Trends</h3>
          <p className="text-xs text-gray-500">Last {chartData.length} readings</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => toggleMetric(m.key)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                activeMetrics.includes(m.key)
                  ? 'border-transparent text-white'
                  : 'border-gray-700 text-gray-500 bg-transparent'
              }`}
              style={activeMetrics.includes(m.key) ? { background: m.color + '33', borderColor: m.color + '66', color: m.color } : {}}
            >
              {m.label.split(' ')[0]} {m.label.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {chartData.length < 2 ? (
        <div className="h-56 flex items-center justify-center text-gray-500 text-sm">
          Waiting for data... (run the simulator)
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {METRICS.filter((m) => activeMetrics.includes(m.key)).map((m) => (
              <Line
                key={m.key}
                type="monotone"
                dataKey={m.key}
                name={m.label}
                stroke={m.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: m.color }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TemperatureChart;
