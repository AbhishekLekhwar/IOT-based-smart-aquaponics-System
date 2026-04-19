import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { sensorsAPI, devicesAPI } from '../utils/api';
import { useWebSocket } from '../hooks/useWebSocket';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [latestReading, setLatestReading] = useState(null);
  const [deviceState, setDeviceState] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [timeRange, setTimeRange] = useState('1h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const notifId = useRef(0);

  const addNotification = useCallback((msg, type = 'info') => {
    const id = ++notifId.current;
    setNotifications((n) => [...n, { id, msg, type }]);
    setTimeout(() => setNotifications((n) => n.filter((x) => x.id !== id)), 4000);
  }, []);

  // Handle WebSocket messages
  const handleWsMessage = useCallback((data) => {
    if (data.type === 'SENSOR_UPDATE') {
      setLatestReading(data.data);
      setHistory((prev) => {
        const updated = [data.data, ...prev].slice(0, 300);
        return updated;
      });
      if (data.data.alerts?.length > 0) {
        data.data.alerts.forEach((a) => addNotification(a.message, a.severity === 'critical' ? 'error' : 'warning'));
      }
    } else if (data.type === 'DEVICE_UPDATE') {
      setDeviceState(data.data);
    }
  }, [addNotification]);

  const { status: wsStatus } = useWebSocket(handleWsMessage);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [latestRes, historyRes, statsRes, alertsRes, devicesRes] = await Promise.allSettled([
        sensorsAPI.getLatest(),
        sensorsAPI.getHistory({ range: timeRange, limit: 100 }),
        sensorsAPI.getStats({ range: timeRange }),
        sensorsAPI.getAlerts({ limit: 30 }),
        devicesAPI.getState(),
      ]);

      if (latestRes.status === 'fulfilled') setLatestReading(latestRes.value.data.data);
      if (historyRes.status === 'fulfilled') setHistory(historyRes.value.data.data);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
      if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.data.data);
      if (devicesRes.status === 'fulfilled') setDeviceState(devicesRes.value.data.data);
      setError(null);
    } catch (e) {
      setError('Failed to connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  const fetchHistory = useCallback(async (range) => {
    try {
      const res = await sensorsAPI.getHistory({ range, limit: 100 });
      setHistory(res.data.data);
      const sRes = await sensorsAPI.getStats({ range });
      setStats(sRes.data.data);
    } catch (e) { /* silent */ }
  }, []);

  const handleRangeChange = useCallback((range) => {
    setTimeRange(range);
    fetchHistory(range);
  }, [fetchHistory]);

  const toggleDevice = useCallback(async (control, value) => {
    try {
      const res = await devicesAPI.toggleControl(control, value);
      setDeviceState(res.data.data);
      addNotification(`${control} turned ${value ? 'ON' : 'OFF'}`, 'info');
    } catch (e) {
      addNotification(`Failed to toggle ${control}`, 'error');
    }
  }, [addNotification]);

  const toggleAutoMode = useCallback(async (value) => {
    try {
      const res = await devicesAPI.toggleAutoMode(value);
      setDeviceState(res.data.data);
      addNotification(`Auto mode ${value ? 'enabled' : 'disabled'}`, 'info');
    } catch (e) {
      addNotification('Failed to toggle auto mode', 'error');
    }
  }, [addNotification]);

  return (
    <AppContext.Provider value={{
      latestReading, deviceState, history, stats, alerts,
      timeRange, loading, error, wsStatus, notifications,
      handleRangeChange, toggleDevice, toggleAutoMode,
      refetch: fetchInitialData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
