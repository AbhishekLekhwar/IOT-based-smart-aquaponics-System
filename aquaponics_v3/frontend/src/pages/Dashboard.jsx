import React from 'react';
import {
  Thermometer, Wind, Fish, FlaskConical,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import SensorCard from '../components/dashboard/SensorCard';
import StatsPanel from '../components/dashboard/StatsPanel';
import AlertBanner from '../components/dashboard/AlertBanner';
import WaterLevelGauge from '../components/dashboard/WaterLevelGauge';
import TemperatureChart from '../components/charts/TemperatureChart';
import WaterLevelChart from '../components/charts/WaterLevelChart';
import GasSensorChart from '../components/charts/GasSensorChart';
import ControlPanel from '../components/controls/ControlPanel';
import {
  formatTemp, formatPercent, formatGasSensor,
  getWaterTempStatus, getRoomTempStatus, getHumidityStatus, getWaterLevelStatus, getGasSensorStatus,
} from '../utils/formatters';

const Dashboard = () => {
  const { latestReading, history, stats, alerts, timeRange, loading, error } = useApp();

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-aqua-500/30 border-t-aqua-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Connecting to AquaMonitor...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="card max-w-md text-center border-red-800/30">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <Fish className="w-6 h-6 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-red-400 mb-2">Connection Failed</h2>
        <p className="text-gray-400 text-sm mb-4">{error}</p>
        <p className="text-xs text-gray-500 font-mono bg-gray-800 rounded-lg p-2">npm run dev → backend/server.js</p>
      </div>
    </div>
  );

  const reading = latestReading || {};

  // Compute sparkline data from history
  const sparkFor = (key) => history.slice(0, 20).map((r) => r[key]).reverse();

  const sensorCards = [
    {
      icon: Thermometer,
      label: 'Water Temperature',
      value: formatTemp(reading.waterTemperature),
      status: getWaterTempStatus(reading.waterTemperature),
      subLabel: 'Optimal: 18°C – 28°C',
      sparkData: sparkFor('waterTemperature'),
    },
    {
      icon: Thermometer,
      label: 'Room Temperature',
      value: formatTemp(reading.roomTemperature),
      status: getRoomTempStatus(reading.roomTemperature),
      subLabel: 'Optimal: 15°C – 35°C',
      sparkData: sparkFor('roomTemperature'),
    },
    {
      icon: Wind,
      label: 'Humidity',
      value: formatPercent(reading.humidity),
      status: getHumidityStatus(reading.humidity),
      subLabel: 'Optimal: 40% – 80%',
      sparkData: sparkFor('humidity'),
    },
    {
      icon: FlaskConical,
      label: 'Gas Level',
      value: formatGasSensor(reading.gasSensor),
      status: getGasSensorStatus(reading.gasSensor),
      subLabel: 'Warning: >1000 ppm',
      sparkData: sparkFor('gasSensor'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Active alerts */}
      {alerts && alerts.length > 0 && (
        <section>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Active Alerts</h2>
          <AlertBanner alerts={alerts.slice(0, 3)} />
        </section>
      )}

      {/* Sensor cards */}
      <section>
        <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Live Sensors</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {sensorCards.map((card) => (
            <SensorCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Charts column - takes 2/3 */}
        <div className="xl:col-span-2 space-y-6">
          <TemperatureChart history={history} />
          <WaterLevelChart history={history} />
          <GasSensorChart history={history} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Water level gauge */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-200 mb-4">Tank Status</h3>
            <div className="flex items-center justify-around">
              <WaterLevelGauge value={reading.waterLevel} />
              <div className="space-y-4">
                <div>
                  <p className="stat-label">Current Level</p>
                  <p className="text-2xl font-bold font-mono text-cyan-400">{formatPercent(reading.waterLevel)}</p>
                </div>
                <div>
                  <p className="stat-label">Status</p>
                  <p className={`text-sm font-semibold capitalize ${
                    getWaterLevelStatus(reading.waterLevel) === 'ok' ? 'text-aqua-400'
                    : getWaterLevelStatus(reading.waterLevel) === 'warning' ? 'text-amber-400'
                    : 'text-red-400'
                  }`}>
                    {getWaterLevelStatus(reading.waterLevel)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <StatsPanel stats={stats} timeRange={timeRange} />

          {/* Controls */}
          <ControlPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
