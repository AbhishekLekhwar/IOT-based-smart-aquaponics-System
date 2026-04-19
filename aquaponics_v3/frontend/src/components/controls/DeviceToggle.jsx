import React, { useState } from 'react';

const Toggle = ({ isOn, onChange, disabled }) => {
  return (
    <button
      onClick={() => !disabled && onChange(!isOn)}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
        isOn ? 'bg-aqua-500 focus:ring-aqua-500' : 'bg-gray-700 focus:ring-gray-600'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
          isOn ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

const DeviceToggle = ({ deviceKey, label, icon: Icon, isOn, onChange, color, description, autoMode }) => {
  const [loading, setLoading] = useState(false);

  const handleChange = async (val) => {
    setLoading(true);
    await onChange(val);
    setLoading(false);
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
      isOn
        ? `bg-${color}-500/5 border-${color}-500/20`
        : 'bg-gray-800/50 border-gray-800'
    }`}>
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
        isOn ? `bg-${color}-500/15` : 'bg-gray-800'
      }`}>
        {loading ? (
          <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${isOn ? `border-${color}-400` : 'border-gray-500'}`} />
        ) : (
          <Icon className={`w-5 h-5 transition-colors ${isOn ? `text-${color}-400` : 'text-gray-500'}`} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold transition-colors ${isOn ? 'text-gray-100' : 'text-gray-400'}`}>{label}</p>
        {description && <p className="text-xs text-gray-500 truncate">{description}</p>}
        <span className={`text-[10px] font-medium uppercase tracking-wider ${isOn ? `text-${color}-400` : 'text-gray-600'}`}>
          {isOn ? 'ON' : 'OFF'}
        </span>
      </div>

      {/* Toggle */}
      <Toggle isOn={isOn} onChange={handleChange} disabled={autoMode && deviceKey !== 'buzzer'} />
    </div>
  );
};

export default DeviceToggle;
