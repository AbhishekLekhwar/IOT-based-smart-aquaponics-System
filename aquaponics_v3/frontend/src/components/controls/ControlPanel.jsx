import React from 'react';
import { Zap, Lightbulb, Droplets, Bot } from 'lucide-react';
import DeviceToggle from './DeviceToggle';
import { useApp } from '../../context/AppContext';

const DEVICES = [
  { key: 'buzzer', label: 'Buzzer', icon: Zap, color: 'red', description: 'Audio alarm system' },
  { key: 'led', label: 'LED Grow Light', icon: Lightbulb, color: 'yellow', description: 'Plant growth lighting' },
  { key: 'waterPump', label: 'Water Pump', icon: Droplets, color: 'aqua', description: 'Main circulation pump' },
];

const ControlPanel = () => {
  const { deviceState, toggleDevice, toggleAutoMode } = useApp();

  if (!deviceState) {
    return (
      <div className="card">
        <div className="h-48 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-8 h-8 border-2 border-aqua-500/30 border-t-aqua-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading controls...</p>
          </div>
        </div>
      </div>
    );
  }

  const { controls, autoMode } = deviceState;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">Device Controls</h3>
          <p className="text-xs text-gray-500">Manage connected hardware</p>
        </div>
        {/* Auto mode toggle */}
        <button
          onClick={() => toggleAutoMode(!autoMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            autoMode
              ? 'bg-aqua-500/15 border-aqua-500/30 text-aqua-400'
              : 'bg-gray-800 border-gray-700 text-gray-400'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          {autoMode ? 'Auto' : 'Manual'}
        </button>
      </div>

      {autoMode && (
        <div className="mb-4 p-3 rounded-xl bg-aqua-500/5 border border-aqua-500/15 text-xs text-aqua-400">
          <Bot className="w-3.5 h-3.5 inline mr-1.5" />
          Auto mode active — devices are controlled automatically by sensor thresholds
        </div>
      )}

      <div className="space-y-2.5">
        {DEVICES.map(({ key, label, icon, color, description }) => (
          <DeviceToggle
            key={key}
            deviceKey={key}
            label={label}
            icon={icon}
            isOn={controls?.[key] ?? false}
            onChange={(val) => toggleDevice(key, val)}
            color={color}
            description={description}
            autoMode={autoMode}
          />
        ))}
      </div>

      {deviceState.lastUpdated && (
        <p className="text-[10px] text-gray-600 mt-4 text-right font-mono">
          Last updated: {new Date(deviceState.lastUpdated).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default ControlPanel;
