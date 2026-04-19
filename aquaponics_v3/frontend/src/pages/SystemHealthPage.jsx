import React, { useState, useEffect } from 'react';
import { Server, Wifi, Database, Clock, RefreshCw, CheckCircle, XCircle, Activity } from 'lucide-react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { formatTimeAgo } from '../utils/formatters';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StatusRow = ({ icon: Icon, label, value, status, sub }) => {
  const color = status === 'ok' ? 'text-aqua-400' : status === 'warn' ? 'text-amber-400' : 'text-red-400';
  const StatusIcon = status === 'ok' ? CheckCircle : XCircle;
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-800/60 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 font-medium">{label}</p>
        {sub && <p className="text-xs text-gray-500 truncate">{sub}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs font-mono ${color}`}>{value}</span>
        <StatusIcon className={`w-4 h-4 ${color}`} />
      </div>
    </div>
  );
};

const SystemHealthPage = () => {
  const { wsStatus, latestReading, history } = useApp();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/health`);
      setHealth(res.data);
      setLastFetch(new Date());
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHealth(); const t = setInterval(fetchHealth, 15000); return () => clearInterval(t); }, []);

  const uptimeHuman = (sec) => {
    if (!sec) return '—';
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const dataFrequency = (() => {
    if (history.length < 2) return '—';
    const diffs = [];
    for (let i = 0; i < Math.min(history.length - 1, 10); i++) {
      diffs.push(new Date(history[i].timestamp) - new Date(history[i + 1].timestamp));
    }
    const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    return `~${(avg / 1000).toFixed(0)}s interval`;
  })();

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">System Health</h2>
          <p className="text-sm text-gray-400">Real-time infrastructure status</p>
        </div>
        <button onClick={fetchHealth} className="btn-secondary text-xs gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overall banner */}
      <div className={`card border flex items-center gap-4 ${health ? 'border-aqua-500/20 bg-aqua-500/5' : 'border-red-800/30 bg-red-950/20'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${health ? 'bg-aqua-500/15' : 'bg-red-500/15'}`}>
          <Activity className={`w-5 h-5 ${health ? 'text-aqua-400' : 'text-red-400'}`} />
        </div>
        <div>
          <p className={`font-semibold text-sm ${health ? 'text-aqua-400' : 'text-red-400'}`}>
            {health ? 'All Systems Operational' : 'Server Unreachable'}
          </p>
          <p className="text-xs text-gray-500">{lastFetch ? `Checked ${formatTimeAgo(lastFetch)}` : 'Checking…'}</p>
        </div>
      </div>

      {/* Backend */}
      <div className="card">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">Backend Server</h3>
        <StatusRow icon={Server} label="API Server" value={health ? 'Online' : 'Offline'} status={health ? 'ok' : 'error'}
          sub={`http://localhost:5000 · Node.js + Express`} />
        <StatusRow icon={Clock} label="Uptime" value={uptimeHuman(health?.uptime)} status={health ? 'ok' : 'error'}
          sub="Time since last restart" />
        <StatusRow icon={Wifi} label="WebSocket" value={wsStatus} status={wsStatus === 'connected' ? 'ok' : wsStatus === 'connecting' ? 'warn' : 'error'}
          sub={`${health?.wsClients ?? '—'} active client(s)`} />
      </div>

      {/* Database */}
      <div className="card">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">Database</h3>
        <StatusRow icon={Database} label="MongoDB" value={health ? 'Connected' : 'Unknown'} status={health ? 'ok' : 'warn'}
          sub="localhost:27017 / aquaponics" />
        <StatusRow icon={Activity} label="Total Readings" value={history.length > 0 ? `${history.length}+ in memory` : '0'}
          status="ok" sub="Loaded in current session" />
        <StatusRow icon={Clock} label="Data Frequency" value={dataFrequency}
          status={dataFrequency !== '—' ? 'ok' : 'warn'} sub="Average sensor push interval" />
      </div>

      {/* Sensor device */}
      <div className="card">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">IoT Device</h3>
        <StatusRow icon={Wifi} label="Last Reading" value={latestReading ? formatTimeAgo(latestReading.timestamp) : 'No data'}
          status={latestReading ? 'ok' : 'warn'} sub="From Arduino / simulator" />
        <StatusRow icon={Server} label="Device ID" value={latestReading?.deviceId || '—'}
          status={latestReading ? 'ok' : 'warn'} sub="Registered sensor unit" />
        <StatusRow icon={Activity} label="Sensor Push" value={latestReading ? 'Active' : 'No signal'}
          status={latestReading ? 'ok' : 'warn'} sub="POST /api/sensors/data" />
      </div>

      {/* Raw health JSON */}
      {health && (
        <div className="card">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">Raw Health Response</h3>
          <pre className="text-[11px] font-mono text-aqua-400 bg-gray-800/60 rounded-lg p-3 overflow-x-auto">
            {JSON.stringify(health, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SystemHealthPage;
