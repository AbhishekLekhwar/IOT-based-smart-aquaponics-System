import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts';
import { formatTime } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  const status = val === null ? 'unknown' : val < 6.0 ? 'Acidic ⚠️' : val > 8.0 ? 'Alkaline ⚠️' : 'Optimal ✓';
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs shadow-2xl">
      <p className="text-gray-400 mb-1 font-mono">{label}</p>
      <p className="font-mono font-bold text-purple-400">pH {val?.toFixed(2) ?? '—'}</p>
      <p className="text-gray-500 mt-0.5">{status}</p>
    </div>
  );
};

const PHChart = ({ history }) => {
  const chartData = [...history]
    .reverse()
    .slice(-60)
    .map((r) => ({ time: formatTime(r.timestamp), ph: r.ph ?? null }))
    .filter((r) => r.ph !== null);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">pH Level Trend</h3>
          <p className="text-xs text-gray-500">Optimal range: 6.0 – 8.0</p>
        </div>
        <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20">pH</span>
      </div>

      {chartData.length < 2 ? (
        <div className="h-40 flex items-center justify-center text-gray-500 text-sm">Waiting for pH data…</div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            {/* Optimal zone shading */}
            <ReferenceArea y1={6.0} y2={8.0} fill="#a855f7" fillOpacity={0.04} />
            <ReferenceLine y={6.0} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} />
            <ReferenceLine y={8.0} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} />
            <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis domain={[4, 10]} tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="ph" stroke="#a855f7" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#a855f7' }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PHChart;
