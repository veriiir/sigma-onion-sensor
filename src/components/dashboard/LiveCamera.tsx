import React, { useState, useEffect } from 'react';
import { Camera, Wifi, WifiOff, Maximize2, RefreshCw } from 'lucide-react';

const CAMERA_FRAMES = [
  'https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/5748300/pexels-photo-5748300.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=600',
];

export default function LiveCamera() {
  const [connected, setConnected] = useState(true);
  const [frameIdx, setFrameIdx] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const now = new Date();

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIdx(i => (i + 1) % CAMERA_FRAMES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setFrameIdx(i => (i + 1) % CAMERA_FRAMES.length);
    setRefreshing(false);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-teal-500" />
          <span className="text-sm font-semibold text-gray-700">Kamera Live Monitoring</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${connected ? 'bg-teal-50 text-teal-600' : 'bg-red-50 text-red-500'}`}>
            {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {connected ? 'Terhubung' : 'Terputus'}
          </div>
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="relative bg-gray-900 aspect-video overflow-hidden">
        <img
          src={CAMERA_FRAMES[frameIdx]}
          alt="Live camera feed"
          className="w-full h-full object-cover transition-opacity duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </div>

        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white/80 text-xs font-mono px-2.5 py-1 rounded-lg">
          {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="bg-black/50 backdrop-blur-sm text-white/80 text-xs px-2.5 py-1 rounded-lg">
            SIGMA CAM — Lapangan
          </div>
          <button className="p-1.5 bg-black/50 backdrop-blur-sm text-white/80 rounded-lg hover:bg-black/70 transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
