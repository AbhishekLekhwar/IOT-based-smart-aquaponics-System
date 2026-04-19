import React from 'react';
import CameraPanel from '../components/dashboard/CameraPanel';

export default function CameraPage() {
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <span className="text-xl">🎥</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Camera Monitoring</h1>
          <p className="text-gray-400 text-sm">Live video feeds from Raspberry Pi cameras</p>
        </div>
      </div>

      {/* Camera Panel */}
      <CameraPanel />
    </div>
  );
}
