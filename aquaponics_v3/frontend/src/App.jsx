import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/dashboard/Navbar';
import NotificationStack from './components/dashboard/NotificationStack';
import Dashboard from './pages/Dashboard';
import AlertsPage from './pages/AlertsPage';
import HistoryPage from './pages/HistoryPage';
import CameraPage from './pages/CameraPage';
import SettingsPage from './pages/SettingsPage';
import SystemHealthPage from './pages/SystemHealthPage';
import AuthPage from './pages/AuthPage';
import {
  LayoutDashboard, Bell, Table2, Settings, Activity, Video,
  LogOut, ChevronRight, User,
} from 'lucide-react';

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'camera',    label: 'Camera',    icon: Video },
  { id: 'history',   label: 'History',   icon: Table2 },
  { id: 'alerts',    label: 'Alerts',    icon: Bell },
  { id: 'health',    label: 'System',    icon: Activity },
  { id: 'settings',  label: 'Settings',  icon: Settings },
];

const AppContent = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (authLoading) return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-aqua-500/30 border-t-aqua-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading AquaMonitor...</p>
      </div>
    </div>
  );

  if (!user) return <AuthPage />;

  return (
    <AppProvider>
      <div className="min-h-screen gradient-bg">
        <Navbar />
        <div className="max-w-screen-2xl mx-auto flex">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col w-16 lg:w-56 sticky top-14 h-[calc(100vh-3.5rem)] border-r border-gray-800/50 p-3 gap-1 flex-shrink-0">
            {PAGES.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActivePage(id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full ${
                  activePage === id
                    ? 'bg-aqua-500/10 text-aqua-400 border border-aqua-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden lg:block">{label}</span>
                {activePage === id && <ChevronRight className="w-3 h-3 ml-auto hidden lg:block text-aqua-400/60" />}
              </button>
            ))}
            <div className="mt-auto hidden lg:block space-y-2">
              <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-aqua-500/20 flex items-center justify-center">
                    <User className="w-3 h-3 text-aqua-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-300 truncate">{user.name}</span>
                </div>
                <p className="text-[10px] text-gray-500 capitalize">{user.role} · {user.email?.split('@')[0]}</p>
              </div>
              <button onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </aside>
          {/* Main */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 pb-24 md:pb-6">
            {activePage === 'dashboard' && <Dashboard />}
            {activePage === 'camera'    && <CameraPage />}
            {activePage === 'history'   && <HistoryPage />}
            {activePage === 'alerts'    && <AlertsPage />}
            {activePage === 'health'    && <SystemHealthPage />}
            {activePage === 'settings'  && <SettingsPage />}
          </main>
        </div>
        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-xl border-t border-gray-800 flex z-50">
          {PAGES.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActivePage(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${activePage === id ? 'text-aqua-400' : 'text-gray-500'}`}>
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>
        <NotificationStack />
      </div>
    </AppProvider>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
