import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone, MonitorSpeaker, Thermometer, Droplets, Zap, FlaskConical,
  BrainCircuit, Camera, AlertTriangle, ShieldAlert, CheckCircle, Clock, MapPin,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useSensorData } from '../hooks/useSensorData';
import SensorCard from '../components/dashboard/SensorCard';
import UpdateTimer from '../components/dashboard/UpdateTimer';
import LandSelector from '../components/dashboard/LandSelector';
import { SENSOR_CONFIGS } from '../constants/sensors';
import { SensorReading, Land, AIAnalysisRecord, SystemType, LandId } from '../types';
import { supabase } from '../lib/supabase';

const INITIAL_LANDS: Land[] = [
  { id: 'lahan1', label: 'Lahan 1', area: '0.5 Ha', crop: 'Bawang Merah', system_type: 'panel', user_id: '' },
  { id: 'lahan2', label: 'Lahan 2', area: '0.8 Ha', crop: 'Bawang Putih', system_type: 'panel', user_id: '' },
];

const DISEASE_SEVERITY: Record<string, 'high' | 'medium' | 'none'> = {
  'Alternaria Porri': 'high',
  'Botrytis Leaf Blight': 'high',
  'Purple Blotch': 'medium',
  'Stemphylium Leaf Blight': 'medium',
  'Sehat': 'none',
};

const severityCfg = {
  high: { label: 'Risiko Tinggi', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  medium: { label: 'Risiko Sedang', color: 'text-tertiary', bg: 'bg-tertiary/10', border: 'border-tertiary/20', dot: 'bg-amber-400', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
  none: { label: 'Sehat', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', dot: 'bg-primary', icon: <CheckCircle className="w-3.5 h-3.5" /> },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} mnt lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

function useLatestAI(systemType: SystemType, landId: LandId) {
  const { user } = useAuth();
  const [latest, setLatest] = useState<AIAnalysisRecord | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('ai_analysis')
      .select('*')
      .eq('user_id', user.id)
      .eq('system_type', systemType)
      .eq('land_id', landId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setLatest(data));
  }, [user, systemType, landId]);

  return latest;
}

function AIStatusBanner({ systemType, landId }: { systemType: SystemType; landId: LandId }) {
  const { setActivePage } = useApp();
  const latest = useLatestAI(systemType, landId);
  const severity = latest ? (DISEASE_SEVERITY[latest.disease_name] ?? 'none') : null;
  const sev = severity ? severityCfg[severity] : null;

  return (
    <div className={`rounded-2xl border px-4 py-3 flex items-center gap-3 ${sev ? `${sev.border} ${sev.bg}` : 'border-black/5 bg-white'}`}>
      {sev ? (
        <>
          <div className={`w-2 h-2 rounded-full shrink-0 ${sev.dot}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-xs font-bold ${sev.color}`}>{latest!.disease_name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${sev.bg} ${sev.color} border ${sev.border}`}>
                {sev.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3 shrink-0" />
                {latest!.created_at ? timeAgo(latest!.created_at) : '—'}
              </span>
              {latest!.confidence != null && (
                <span className="text-xs text-gray-400">{latest!.confidence.toFixed(0)}% kepercayaan</span>
              )}
              {latest!.latitude != null && (
                <span className="flex items-center gap-0.5 text-xs text-teal-500">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {latest!.latitude.toFixed(4)}, {latest!.longitude!.toFixed(4)}
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <BrainCircuit className="w-4 h-4 text-gray-300 shrink-0" />
          <p className="text-xs text-gray-400 flex-1">Belum ada analisis penyakit untuk lahan ini</p>
        </>
      )}
      <button
        onClick={() => setActivePage('ai-analysis')}
        className="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-xl transition-colors shrink-0 shadow-sm shadow-primary/20"
      >
        <Camera className="w-3.5 h-3.5" />
        Analisis Foto
      </button>
    </div>
  );
}

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

        <AIStatusBanner systemType={activeMode} landId={selectedLand} />

        <div>
          <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-2">
            <h3 className="text-base font-black text-gray-800 tracking-tighter uppercase leading-none">
              Data Sensor <span className="text-primary">{currentLandName}</span>
            </h3>
            <span className="text-[10px] font-black text-neutral-muted bg-gray-50 border px-3 py-1 rounded-full uppercase italic">7 Parameter Detect</span>
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

        <AIStatusBanner systemType={activeMode} landId={selectedLand} />

        <div>
          <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-2">
            <h3 className="text-base font-black text-gray-800 tracking-tighter uppercase leading-none">
              Data Sensor <span className="text-primary">{currentLand.label}</span>
            </h3>
            <span className="text-[10px] font-black text-neutral-muted bg-gray-50 border px-3 py-1 rounded-full uppercase italic">7 Parameter Detect</span>
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
