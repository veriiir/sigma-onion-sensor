import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, MonitorSpeaker, Thermometer, Droplets, Zap, FlaskConical, LayoutGrid } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useSensorData } from '../hooks/useSensorData';
import SensorCard from '../components/dashboard/SensorCard';
import UpdateTimer from '../components/dashboard/UpdateTimer';
import LandSelector from '../components/dashboard/LandSelector';
import { SENSOR_CONFIGS } from '../constants/sensors';
import { SensorReading, Land } from '../types';

const INITIAL_LANDS: Land[] = [
  { id: 'lahan1', label: 'Lahan 1', area: '0.5 Ha', crop: 'Bawang Merah', system_type: 'panel', user_id: '' },
  { id: 'lahan2', label: 'Lahan 2', area: '0.8 Ha', crop: 'Bawang Putih', system_type: 'panel', user_id: '' },
];

function StatBadge({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-neutral-muted font-bold uppercase tracking-tight">{label}</p>
        <p className="text-sm font-black text-gray-800 mt-0.5 tracking-tight">{value}</p>
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

  const [lands, setLands] = useState<Land[]>(INITIAL_LANDS);
  useEffect(() => {
    const saved = localStorage.getItem('sigma_lands_data');
    if (saved) setLands(JSON.parse(saved));
  }, [selectedLand]);

  // FIX: Mengambil label untuk ditampilkan di Header Data Sensor
  const currentLandName = lands.find(l => l.id === selectedLand)?.label || 'Titik Lapangan';

  const healthyCount = SENSOR_CONFIGS.filter(c => {
    const val = sensorData[c.key] as number;
    return val >= c.goodMin && val <= c.goodMax;
  }).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tighter">Sensor Genggam Portable</h2>
            <p className="text-sm text-neutral-muted font-medium">Pembacaan real-time dari sensor lapangan</p>
          </div>
        </div>
        <LandSelector selectedLand={selectedLand} onSelect={setSelectedLand} systemType={activeMode} />
      </div>

      <UpdateTimer nextUpdateIn={nextUpdateIn} lastUpdated={lastUpdated} />

      {/* ANIMASI TRANSISI SAAT GANTI LOKASI */}
      <motion.div 
        key={selectedLand} 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBadge icon={<Thermometer className="w-5 h-5 text-tertiary" />} label="Temp" value={`${sensorData.temperature.toFixed(1)}°C`} color="bg-tertiary/10" />
          <StatBadge icon={<Droplets className="w-5 h-5 text-secondary" />} label="Kelembaban" value={`${sensorData.moisture.toFixed(1)}%`} color="bg-secondary/10" />
          <StatBadge icon={<FlaskConical className="w-5 h-5 text-[#829D45]" />} label="Kadar pH" value={sensorData.ph.toFixed(2)} color="bg-[#829D45]/10" />
          <StatBadge icon={<Zap className="w-5 h-5 text-primary" />} label="Sensor Optimal" value={`${healthyCount} / 7 OK`} color="bg-primary/10" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-2">
            <h3 className="text-base font-black text-gray-800 tracking-tighter uppercase leading-none">
              Data Sensor <span className="text-primary">{currentLandName}</span>
            </h3>
            <span className="text-[10px] font-black text-neutral-muted bg-gray-50 border px-3 py-1 rounded-full uppercase italic font-black">7 Parameter Detect</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {SENSOR_CONFIGS.map((config, i) => (
              <SensorCard key={`${selectedLand}-${config.key}`} config={config} value={sensorData[config.key] as number} prevValue={prevData ? (prevData[config.key] as number) : undefined} index={i} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PanelDashboard() {
  const { activeMode, selectedLand, setSelectedLand } = useApp();
  const { sensorData, nextUpdateIn, lastUpdated } = useSensorData(activeMode, selectedLand);
  const prevDataRef = useRef<SensorReading | null>(null);
  const prevData = prevDataRef.current;
  prevDataRef.current = sensorData;

  const [lands, setLands] = useState<Land[]>(INITIAL_LANDS);
  useEffect(() => {
    const saved = localStorage.getItem('sigma_lands_data');
    if (saved) setLands(JSON.parse(saved));
  }, [selectedLand]);

  // FIX: Mengambil label lahan, bukan ID (selectedLand)
  const currentLand = lands.find(l => l.id === selectedLand) || lands[0];

  const healthyCount = SENSOR_CONFIGS.filter(c => {
    const val = sensorData[c.key] as number;
    return val >= c.goodMin && val <= c.goodMax;
  }).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shadow-inner">
            <MonitorSpeaker className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tighter">Stasiun Panel Tetap</h2>
            <p className="text-sm text-neutral-muted font-medium">Pemantauan otomatis multi-lahan</p>
          </div>
        </div>
        <LandSelector selectedLand={selectedLand} onSelect={setSelectedLand} systemType={activeMode} />
      </div>

      <UpdateTimer nextUpdateIn={nextUpdateIn} lastUpdated={lastUpdated} />

      {/* FIX: Tambahkan Animasi transisi saat ganti lahan di Panel juga */}
      <motion.div 
        key={selectedLand} 
        initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBadge icon={<Thermometer className="w-5 h-5 text-tertiary" />} label="Suhu" value={`${sensorData.temperature.toFixed(1)}°C`} color="bg-tertiary/10" />
          <StatBadge icon={<Droplets className="w-5 h-5 text-secondary" />} label="Kelembaban" value={`${sensorData.moisture.toFixed(1)}%`} color="bg-secondary/10" />
          <StatBadge icon={<FlaskConical className="w-5 h-5 text-[#829D45]" />} label="pH Tanah" value={sensorData.ph.toFixed(2)} color="bg-[#829D45]/10" />
          <StatBadge icon={<Zap className="w-5 h-5 text-primary" />} label="Sensor Optimal" value={`${healthyCount} / 7`} color="bg-primary/10" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-2">
            {/* FIX: Sekarang menampilkan currentLand.label (Bukan ID Teknis) */}
            <h3 className="text-base font-black text-gray-800 tracking-tighter uppercase leading-none">
              Data Sensor  <span className="text-primary">{currentLand.label}</span>
            </h3>
            <span className="text-[10px] font-black text-neutral-muted bg-gray-50 border px-3 py-1 rounded-full uppercase italic font-black">7 Parameter Detect</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {SENSOR_CONFIGS.map((config, i) => (
              <SensorCard key={`${selectedLand}-${config.key}`} config={config} value={sensorData[config.key] as number} prevValue={prevData ? (prevData[config.key] as number) : undefined} index={i} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  const { activeMode } = useApp();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeMode}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}
        className="p-1 min-h-full"
      >
        {activeMode === 'portable' ? <PortableDashboard /> : <PanelDashboard />}
      </motion.div>
    </AnimatePresence>
  );
}