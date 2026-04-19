import React, { useState, useEffect, useCallback } from 'react';
import { Download, RefreshCw, ChevronLeft, ChevronRight, FileJson, FileText } from 'lucide-react';
import { sensorsAPI } from '../utils/api';
import { formatDateTime, formatTemp, formatPercent, formatGasSensor, getWaterTempStatus, getWaterLevelStatus, statusColors } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const LIMIT = 20;

const StatusPill = ({ status }) => {
  const c = statusColors[status] || statusColors.unknown;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${c.bg} ${c.text} border ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
};

const HistoryPage = () => {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [range, setRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sensorsAPI.getHistory({ range, page, limit: LIMIT });
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [range, page]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [range]);

  const handleExport = async (fmt) => {
    setExporting(fmt);
    try {
      const url = `${API_BASE}/export/${fmt}?range=${range}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `aquaponics_${range}.${fmt}`;
      a.click();
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setExporting('');
    }
  };

  const RANGES = [
    { label: '1H', value: '1h' }, { label: '6H', value: '6h' },
    { label: '24H', value: '24h' }, { label: '7D', value: '7d' }, { label: '30D', value: '30d' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Sensor History</h2>
          <p className="text-sm text-gray-400">{pagination.total.toLocaleString()} total readings</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Range tabs */}
          <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1">
            {RANGES.map((r) => (
              <button key={r.value} onClick={() => setRange(r.value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${range === r.value ? 'bg-aqua-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
                {r.label}
              </button>
            ))}
          </div>
          {/* Export */}
          <button onClick={() => handleExport('csv')} disabled={!!exporting}
            className="btn-secondary text-xs gap-1.5 disabled:opacity-50">
            {exporting === 'csv' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            CSV
          </button>
          <button onClick={() => handleExport('json')} disabled={!!exporting}
            className="btn-secondary text-xs gap-1.5 disabled:opacity-50">
            {exporting === 'json' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileJson className="w-3.5 h-3.5" />}
            JSON
          </button>
          <button onClick={fetchData} className="btn-secondary text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Timestamp', 'Water Temp', 'Room Temp', 'Humidity', 'Water Level', 'Gas Level', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-gray-500 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-gray-800 rounded animate-pulse w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">No data for selected range</td></tr>
              ) : (
                data.map((r) => {
                  const wtStatus = getWaterTempStatus(r.waterTemperature);
                  const wlStatus = getWaterLevelStatus(r.waterLevel);
                  const overallStatus = [wtStatus, wlStatus].includes('critical') ? 'critical'
                    : [wtStatus, wlStatus].includes('warning') ? 'warning' : 'ok';
                  return (
                    <tr key={r._id} className="border-b border-gray-800/40 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs whitespace-nowrap">{formatDateTime(r.timestamp)}</td>
                      <td className="px-4 py-3 font-mono text-gray-200">{formatTemp(r.waterTemperature)}</td>
                      <td className="px-4 py-3 font-mono text-gray-200">{formatTemp(r.roomTemperature)}</td>
                      <td className="px-4 py-3 font-mono text-gray-200">{formatPercent(r.humidity)}</td>
                      <td className="px-4 py-3 font-mono text-gray-200">{formatPercent(r.waterLevel)}</td>
                      <td className="px-4 py-3 font-mono text-gray-200">{formatGasSensor(r.gasSensor)}</td>
                      <td className="px-4 py-3"><StatusPill status={overallStatus} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              Page {pagination.page} of {pagination.pages} · {pagination.total} records
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary p-1.5 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-400 font-mono px-1">{page}</span>
              <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                className="btn-secondary p-1.5 disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
