import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, MonitorSpeaker, Thermometer, Droplets, Zap, FlaskConical } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useSensorData } from '../hooks/useSensorData';
import SensorCard from '../components/dashboard/SensorCard';
import UpdateTimer from '../components/dashboard/UpdateTimer';
import LiveCamera from '../components/dashboard/LiveCamera';
import LandSelector from '../components/dashboard/LandSelector';
import { SENSOR_CONFIGS } from '../constants/sensors';
import { SensorReading } from '../types';

function StatBadge({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-bold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function PortableDashboard() {
  const { activeMode, selectedLand, setSelectedLand } = useApp();
  const { sensorData, nextUpdateIn, lastUpdated } = useSensorData(activeMode, selectedLand);
  const prevDataRef = useRef<SensorReading | null>(null);
  const prevData = prevDataRef.current;
  prevDataRef.current = sensorData;

  const healthyCount = SENSOR_CONFIGS.filter(c => {
    const val = sensorData[c.key] as number;
    return val >= c.goodMin && val <= c.goodMax;
  }).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Sensor Genggam Portable</h2>
          <p className="text-sm text-gray-400">Pembacaan real-time dari sensor lapangan</p>
        </div>
      </div>
      <LandSelector 
          selectedLand={selectedLand} 
          onSelect={setSelectedLand} 
          systemType={activeMode} 
        />
      </div>

      <UpdateTimer nextUpdateIn={nextUpdateIn} lastUpdated={lastUpdated} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBadge icon={<Thermometer className="w-5 h-5 text-red-500" />} label="Suhu" value={`${sensorData.temperature.toFixed(1)}°C`} color="bg-red-50" />
        <StatBadge icon={<Droplets className="w-5 h-5 text-blue-500" />} label="Kelembaban" value={`${sensorData.moisture.toFixed(1)}%`} color="bg-blue-50" />
        <StatBadge icon={<FlaskConical className="w-5 h-5 text-teal-500" />} label="pH Tanah" value={sensorData.ph.toFixed(2)} color="bg-teal-50" />
        <StatBadge icon={<Zap className="w-5 h-5 text-amber-500" />} label="Sensor Optimal" value={`${healthyCount} / ${SENSOR_CONFIGS.length}`} color="bg-amber-50" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-800">Data Sensor Real-time</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">7 Parameter</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SENSOR_CONFIGS.map((config, i) => (
            <SensorCard
              key={config.key}
              config={config}
              value={sensorData[config.key] as number}
              prevValue={prevData ? (prevData[config.key] as number) : undefined}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PanelDashboard() {
  const { activeMode, selectedLand, setSelectedLand } = useApp();
  const { sensorData, nextUpdateIn, lastUpdated } = useSensorData(activeMode, selectedLand);
  const prevDataRef = useRef<SensorReading | null>(null);
  const prevData = prevDataRef.current;
  prevDataRef.current = sensorData;

  const healthyCount = SENSOR_CONFIGS.filter(c => {
    const val = sensorData[c.key] as number;
    return val >= c.goodMin && val <= c.goodMax;
  }).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <MonitorSpeaker className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Stasiun Panel Tetap</h2>
            <p className="text-sm text-gray-400">Pemantauan otomatis multi-lahan</p>
          </div>
        </div>
        <LandSelector 
          selectedLand={selectedLand} 
          onSelect={setSelectedLand} 
          systemType={activeMode} 
        />
      </div>

      <UpdateTimer nextUpdateIn={nextUpdateIn} lastUpdated={lastUpdated} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <LiveCamera />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatBadge icon={<Thermometer className="w-5 h-5 text-red-500" />} label="Suhu" value={`${sensorData.temperature.toFixed(1)}°C`} color="bg-red-50" />
            <StatBadge icon={<Droplets className="w-5 h-5 text-blue-500" />} label="Kelembaban" value={`${sensorData.moisture.toFixed(1)}%`} color="bg-blue-50" />
            <StatBadge icon={<FlaskConical className="w-5 h-5 text-teal-500" />} label="pH Tanah" value={sensorData.ph.toFixed(2)} color="bg-teal-50" />
            <StatBadge icon={<Zap className="w-5 h-5 text-amber-500" />} label="Sensor Optimal" value={`${healthyCount} / ${SENSOR_CONFIGS.length}`} color="bg-amber-50" />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-800">
            Data Sensor — <span className="text-teal-600 capitalize">{selectedLand}</span>
          </h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">7 Parameter</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SENSOR_CONFIGS.map((config, i) => (
            <SensorCard
              key={`${selectedLand}-${config.key}`}
              config={config}
              value={sensorData[config.key] as number}
              prevValue={prevData ? (prevData[config.key] as number) : undefined}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { activeMode } = useApp();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeMode}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
      >
        {activeMode === 'portable' ? <PortableDashboard /> : <PanelDashboard />}
      </motion.div>
    </AnimatePresence>
  );
}
