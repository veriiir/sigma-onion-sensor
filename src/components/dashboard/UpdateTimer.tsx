import React from 'react';
import { RefreshCw, Clock } from 'lucide-react';

interface UpdateTimerProps {
  nextUpdateIn: number;
  lastUpdated: Date;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatDate(date: Date): string {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function UpdateTimer({ nextUpdateIn, lastUpdated }: UpdateTimerProps) {
  const progress = ((600000 - nextUpdateIn) / 600000) * 100;

  return (
    <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center w-8 h-8">
          <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-pulse" />
          <div className="absolute w-5 h-5 border-2 border-teal-200 rounded-full animate-ping opacity-40" />
        </div>
        <div>
          <p className="text-xs text-gray-400 leading-none">Status</p>
          <p className="text-sm font-semibold text-teal-600 mt-0.5">Live</p>
        </div>
      </div>

      <div className="w-px h-8 bg-gray-100" />

      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-400" />
        <div>
          <p className="text-xs text-gray-400 leading-none">Pembaruan berikutnya</p>
          <p className="text-sm font-bold text-gray-800 mt-0.5 font-mono">{formatTime(nextUpdateIn)}</p>
        </div>
      </div>

      <div className="flex-1 hidden sm:block">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Siklus pembaruan 10 menit</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-400 shrink-0">
        <RefreshCw className="w-3.5 h-3.5" />
        <span className="text-xs hidden md:inline">Terakhir: {formatDate(lastUpdated)}</span>
      </div>
    </div>
  );
}
