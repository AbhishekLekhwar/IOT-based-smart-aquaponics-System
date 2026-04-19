import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { formatTime } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-gray-400 mb-1 font-mono">{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400" />
        <span className="text-gray-300">Water Level:</span>
        <span className="font-mono font-bold text-cyan-400">{Number(payload[0].value).toFixed(1)}%</span>
      </div>
    </div>
  );
};

const WaterLevelChart = ({ history }) => {
  const chartData = [...history].reverse().slice(-60).map((r) => ({
    time: formatTime(r.timestamp),
    waterLevel: r.waterLevel,
  }));

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">Water Level History</h3>
          <p className="text-xs text-gray-500">Last {chartData.length} readings</p>
        </div>
        <span className="badge bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">%</span>
      </div>

      {chartData.length < 2 ? (
        <div className="h-40 flex items-center justify-center text-gray-500 text-sm">Waiting for data...</div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
            <defs>
              <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={20} stroke="#f87171" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'Critical', fill: '#f87171', fontSize: 9 }} />
            <Area type="monotone" dataKey="waterLevel" stroke="#22d3ee" strokeWidth={2} fill="url(#waterGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default WaterLevelChart;
