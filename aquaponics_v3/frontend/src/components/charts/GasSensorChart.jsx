import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts';
import { formatTime } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  const status = val === null ? 'unknown' : val > 2000 ? 'Critical 🔴' : val > 1000 ? 'Warning ⚠️' : 'Optimal ✓';
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs shadow-2xl">
      <p className="text-gray-400 mb-1 font-mono">{label}</p>
      <p className="font-mono font-bold text-cyan-400">Gas {val?.toFixed(0) ?? '—'} ppm</p>
      <p className="text-gray-500 mt-0.5">{status}</p>
    </div>
  );
};

const GasSensorChart = ({ history }) => {
  const chartData = [...history]
    .reverse()
    .slice(-60)
    .map((r) => ({ time: formatTime(r.timestamp), gasSensor: r.gasSensor ?? null }))
    .filter((r) => r.gasSensor !== null);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">Gas Level Trend</h3>
          <p className="text-xs text-gray-500">Warning: >1000 ppm | Critical: >2000 ppm</p>
        </div>
        <span className="badge bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Gas</span>
      </div>

      {chartData.length < 2 ? (
        <div className="h-40 flex items-center justify-center text-gray-500 text-sm">Waiting for gas sensor data…</div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            {/* Safe zone shading */}
            <ReferenceArea y1={0} y2={1000} fill="#06b6d4" fillOpacity={0.04} />
            <ReferenceLine y={1000} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} />
            <ReferenceLine y={2000} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} />
            <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis domain={[0, 'auto']} tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="gasSensor"
              stroke="#06b6d4"
              dot={false}
              isAnimationActive={false}
              strokeWidth={2}
              name="Gas Level"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GasSensorChart;
