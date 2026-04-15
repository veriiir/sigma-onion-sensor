import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import SensorGauge from './SensorGauge';
import { SensorConfig, SensorReading } from '../../types';

interface SensorCardProps {
  config: SensorConfig;
  value: number;
  prevValue?: number;
  index: number;
}

function getStatusLabel(value: number, goodMin: number, goodMax: number): { label: string; color: string; bg: string } {
  if (value < goodMin) return { label: 'Rendah', color: 'text-amber-600', bg: 'bg-amber-50' };
  if (value > goodMax) return { label: 'Tinggi', color: 'text-red-600', bg: 'bg-red-50' };
  return { label: 'Optimal', color: 'text-teal-600', bg: 'bg-teal-50' };
}

export default function SensorCard({ config, value, prevValue, index }: SensorCardProps) {
  const { label, unit, min, max, goodMin, goodMax } = config;
  const status = getStatusLabel(value, goodMin, goodMax);
  const diff = prevValue !== undefined ? value - prevValue : 0;

  const TrendIcon = diff > 0.5 ? TrendingUp : diff < -0.5 ? TrendingDown : Minus;
  const trendColor = diff > 0.5 ? 'text-green-500' : diff < -0.5 ? 'text-red-400' : 'text-gray-400';

  const displayValue = config.key === 'conductivity'
    ? value.toFixed(3)
    : config.key === 'ph'
    ? value.toFixed(2)
    : value.toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${status.color.replace('text-', 'bg-')}`} />
          {status.label}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <SensorGauge value={value} min={min} max={max} goodMin={goodMin} goodMax={goodMax} size={110} />
        <div className="text-center -mt-1">
          <div className="flex items-baseline gap-1 justify-center">
            <span className="text-2xl font-bold text-gray-900" style={{ transition: 'all 1s ease' }}>
              {displayValue}
            </span>
            <span className="text-sm text-gray-400 font-medium">{unit}</span>
          </div>
          <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${trendColor}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>{Math.abs(diff).toFixed(1)} dari siklus sebelumnya</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-50">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Rentang: {goodMin}–{goodMax} {unit}</span>
          <span>{min}–{max} {unit}</span>
        </div>
        <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100)}%`,
              backgroundColor:
                value >= goodMin && value <= goodMax ? '#38b2ac' :
                value < goodMin ? '#f59e0b' : '#ef4444',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
