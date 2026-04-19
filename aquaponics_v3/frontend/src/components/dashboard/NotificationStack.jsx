import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const icons = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle,
};

const colors = {
  info: 'bg-blue-950/90 border-blue-800/50 text-blue-300',
  warning: 'bg-amber-950/90 border-amber-800/50 text-amber-300',
  error: 'bg-red-950/90 border-red-800/50 text-red-300',
  success: 'bg-aqua-950/90 border-aqua-800/50 text-aqua-300',
};

const Toast = ({ msg, type }) => {
  const Icon = icons[type] || Info;
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl text-sm font-medium animate-slide-up ${colors[type] || colors.info}`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span>{msg}</span>
    </div>
  );
};

const NotificationStack = () => {
  const { notifications } = useApp();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-xs">
      {notifications.map((n) => (
        <Toast key={n.id} msg={n.msg} type={n.type} />
      ))}
    </div>
  );
};

export default NotificationStack;
