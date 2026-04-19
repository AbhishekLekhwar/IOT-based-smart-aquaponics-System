import React from 'react';
import { Fish, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatTimeAgo } from '../../utils/formatters';
import { RANGES } from '../../utils/formatters';

const Navbar = () => {
  const { wsStatus, latestReading, timeRange, handleRangeChange, refetch } = useApp();

  const wsColors = {
    connected: 'text-aqua-400',
    connecting: 'text-amber-400',
    disconnected: 'text-red-400',
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-aqua-500/15 border border-aqua-500/30 flex items-center justify-center">
            <Fish className="w-4 h-4 text-aqua-400" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-white tracking-tight">AquaMonitor</h1>
            <p className="text-[10px] text-gray-500 leading-none">Smart Aquaponics</p>
          </div>
        </div>

        {/* Center: Time range */}
        <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => handleRangeChange(r.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                timeRange === r.value
                  ? 'bg-aqua-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Right: Status */}
        <div className="flex items-center gap-3">
          {latestReading && (
            <span className="hidden md:block text-[10px] text-gray-500 font-mono">
              {formatTimeAgo(latestReading.timestamp)}
            </span>
          )}

          {/* WS status */}
          <div className={`flex items-center gap-1.5 text-xs ${wsColors[wsStatus]}`}>
            {wsStatus === 'connected' ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="ping-slow absolute inline-flex h-full w-full rounded-full bg-aqua-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-aqua-400" />
                </span>
                <span className="hidden sm:inline">Live</span>
              </>
            ) : wsStatus === 'connecting' ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span className="hidden sm:inline">Connecting</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </div>

          <button
            onClick={refetch}
            className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-aqua-400 hover:border-aqua-500/30 transition-all"
            title="Refresh data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
