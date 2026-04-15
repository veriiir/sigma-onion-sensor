import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History, Thermometer, BrainCircuit, Calendar, Search, X,
  AlertTriangle, ShieldAlert, CheckCircle, ChevronRight,
  Droplets, Leaf, Zap, Flame, FlaskConical, Activity,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { SensorReading, AIAnalysisRecord } from '../types';
import { SENSOR_CONFIGS } from '../constants/sensors';

type TabType = 'sensor' | 'ai';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function monthAgoStr() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const SENSOR_ICONS: Record<string, React.ReactNode> = {
  moisture: <Droplets className="w-4 h-4" />,
  nitrogen: <Leaf className="w-4 h-4" />,
  phosphorus: <FlaskConical className="w-4 h-4" />,
  potassium: <Zap className="w-4 h-4" />,
  temperature: <Flame className="w-4 h-4" />,
  ph: <Activity className="w-4 h-4" />,
  conductivity: <Zap className="w-4 h-4" />,
};

const DISEASE_SEVERITY: Record<string, 'high' | 'medium' | 'none'> = {
  'Alternaria Porri': 'high',
  'Botrytis Leaf Blight': 'high',
  'Purple Blotch': 'medium',
  'Stemphylium Leaf Blight': 'medium',
  'Sehat': 'none',
};

const severityCfg = {
  high: { label: 'Risiko Tinggi', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', icon: <AlertTriangle className="w-4 h-4" /> },
  medium: { label: 'Risiko Sedang', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', icon: <ShieldAlert className="w-4 h-4" /> },
  none: { label: 'Sehat', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', dot: 'bg-teal-500', icon: <CheckCircle className="w-4 h-4" /> },
};

function SensorDetailModal({ record, onClose }: { record: SensorReading; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center">
              <Thermometer className="w-4.5 h-4.5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Detail Pembacaan Sensor</h3>
              <p className="text-xs text-gray-400">{record.created_at ? formatDate(record.created_at) : '—'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-2 bg-gray-50 border-b border-gray-100">
          <div className="flex gap-4 text-xs text-gray-500">
            <span>Mode: <span className="font-medium text-gray-700 capitalize">{record.system_type}</span></span>
            <span>Lahan: <span className="font-medium text-gray-700 capitalize">{record.land_id ?? 'default'}</span></span>
          </div>
        </div>

        <div className="px-6 py-5 grid grid-cols-2 gap-3">
          {SENSOR_CONFIGS.map(c => {
            const val = record[c.key] as number;
            const isGood = val >= c.goodMin && val <= c.goodMax;
            const pct = Math.min(100, Math.max(0, ((val - c.min) / (c.max - c.min)) * 100));
            return (
              <div key={c.key} className={`rounded-xl border p-3.5 ${isGood ? 'border-teal-100 bg-teal-50/40' : 'border-amber-100 bg-amber-50/40'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={isGood ? 'text-teal-500' : 'text-amber-500'}>{SENSOR_ICONS[c.key]}</span>
                  <span className="text-xs text-gray-500 font-medium">{c.label}</span>
                </div>
                <p className={`text-xl font-bold ${isGood ? 'text-teal-700' : 'text-amber-700'}`}>
                  {c.key === 'conductivity' ? val.toFixed(3) : c.key === 'ph' ? val.toFixed(2) : val.toFixed(1)}
                  <span className="text-xs font-normal text-gray-400 ml-1">{c.unit}</span>
                </p>
                <div className="mt-2 h-1.5 bg-white rounded-full overflow-hidden border border-gray-100">
                  <div
                    className={`h-full rounded-full transition-all ${isGood ? 'bg-teal-500' : 'bg-amber-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className={`text-xs mt-1.5 font-medium ${isGood ? 'text-teal-500' : 'text-amber-500'}`}>
                  {isGood ? 'Normal' : 'Di luar batas'}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function AIDetailModal({ record, onClose }: { record: AIAnalysisRecord; onClose: () => void }) {
  const severity = DISEASE_SEVERITY[record.disease_name] ?? 'none';
  const sev = severityCfg[severity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center">
              <BrainCircuit className="w-4.5 h-4.5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Detail Analisis AI</h3>
              <p className="text-xs text-gray-400">{record.created_at ? formatDate(record.created_at) : '—'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className={`mx-6 mt-5 rounded-xl border p-4 ${sev.border} ${sev.bg}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500">Patogen Terdeteksi</p>
            <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${sev.bg} ${sev.color}`}>
              {sev.icon}
              {sev.label}
            </div>
          </div>
          <p className={`text-2xl font-bold ${sev.color}`}>{record.disease_name}</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Kepercayaan Model</span>
              <span className="font-bold text-gray-700">{record.confidence.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-white/60 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${record.confidence}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full rounded-full ${sev.dot}`}
              />
            </div>
          </div>
        </div>

        <div className="px-6 mt-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Rekomendasi Tindakan</p>
          <p className="text-sm text-gray-500 leading-relaxed">{record.recommendation}</p>
        </div>

        <div className="px-6 mt-4 pb-5">
          <p className="text-xs font-semibold text-gray-700 mb-2">Info Deteksi</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Mode', value: record.system_type },
              { label: 'Lahan', value: record.land_id },
              { label: 'Bbox X', value: record.bbox_x?.toFixed(3) ?? '—' },
              { label: 'Bbox Y', value: record.bbox_y?.toFixed(3) ?? '—' },
              { label: 'Lebar', value: record.bbox_width?.toFixed(3) ?? '—' },
              { label: 'Tinggi', value: record.bbox_height?.toFixed(3) ?? '—' },
            ].map(item => (
              <div key={item.label} className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-400">{item.label}</span>
                <span className="font-medium text-gray-700 capitalize">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function HistoryPage() {
  const { user } = useAuth();
  const { activeMode } = useApp();
  const [tab, setTab] = useState<TabType>('sensor');
  const [sensorHistory, setSensorHistory] = useState<SensorReading[]>([]);
  const [aiHistory, setAiHistory] = useState<AIAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(monthAgoStr());
  const [endDate, setEndDate] = useState(todayStr());
  const [dateError, setDateError] = useState('');
  const [selectedSensor, setSelectedSensor] = useState<SensorReading | null>(null);
  const [selectedAI, setSelectedAI] = useState<AIAnalysisRecord | null>(null);

  useEffect(() => {
    if (!user) return;
    if (startDate > endDate) {
      setDateError('Tanggal mulai tidak boleh lebih besar dari tanggal akhir.');
      return;
    }
    setDateError('');
    setLoading(true);

    const startIso = `${startDate}T00:00:00.000Z`;
    const endIso = `${endDate}T23:59:59.999Z`;

    if (tab === 'sensor') {
      supabase
        .from('sensor_readings')
        .select('*')
        .eq('user_id', user.id)
        .eq('system_type', activeMode)
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .order('created_at', { ascending: false })
        .limit(100)
        .then(({ data }) => {
          setSensorHistory(data ?? []);
          setLoading(false);
        });
    } else {
      supabase
        .from('ai_analysis')
        .select('*')
        .eq('user_id', user.id)
        .eq('system_type', activeMode)
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .order('created_at', { ascending: false })
        .limit(100)
        .then(({ data }) => {
          setAiHistory(data ?? []);
          setLoading(false);
        });
    }
  }, [user, activeMode, tab, startDate, endDate]);

  function resetDates() {
    setStartDate(monthAgoStr());
    setEndDate(todayStr());
  }

  const hasCustomRange = startDate !== monthAgoStr() || endDate !== todayStr();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
          <History className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Riwayat Data</h2>
          <p className="text-sm text-gray-400">Mode {activeMode === 'portable' ? 'Portable' : 'Panel'} — klik baris untuk detail</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
            <Calendar className="w-4 h-4 text-teal-500" />
            <span className="font-medium text-gray-700">Rentang Tanggal</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-gray-400 whitespace-nowrap">Dari</span>
              <input
                type="date"
                value={startDate}
                max={endDate}
                onChange={e => setStartDate(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-teal-400 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-gray-400 whitespace-nowrap">Hingga</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                max={todayStr()}
                onChange={e => setEndDate(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-teal-400 transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasCustomRange && (
              <button
                onClick={resetDates}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 px-3 py-2 rounded-xl transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
            <div className="flex items-center gap-1.5 text-xs text-teal-600 bg-teal-50 px-3 py-2 rounded-xl">
              <Search className="w-3.5 h-3.5" />
              {loading ? 'Memuat...' : 'Hasil diperbarui'}
            </div>
          </div>
        </div>
        {dateError && <p className="text-xs text-red-500 mt-2">{dateError}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab('sensor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === 'sensor' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Thermometer className="w-4 h-4" />
            Data Sensor
            {tab === 'sensor' && !loading && (
              <span className="bg-teal-100 text-teal-600 text-xs px-1.5 py-0.5 rounded-full">{sensorHistory.length}</span>
            )}
          </button>
          <button
            onClick={() => setTab('ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === 'ai' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            Analisis AI
            {tab === 'ai' && !loading && (
              <span className="bg-teal-100 text-teal-600 text-xs px-1.5 py-0.5 rounded-full">{aiHistory.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
          </div>
        ) : tab === 'sensor' ? (
          sensorHistory.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Thermometer className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Tidak ada data sensor</p>
              <p className="text-sm mt-1">Coba ubah rentang tanggal atau tunggu siklus pembaruan berikutnya</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Waktu</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lahan</th>
                    {SENSOR_CONFIGS.map(c => (
                      <th key={c.key} className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {c.label}
                      </th>
                    ))}
                    <th className="px-3 py-3 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {sensorHistory.map((row, i) => (
                    <motion.tr
                      key={row.id ?? i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => setSelectedSensor(row)}
                      className="border-b border-gray-50 hover:bg-teal-50/40 cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{formatDate(row.created_at!)}</td>
                      <td className="px-3 py-3 text-xs text-gray-600 font-medium capitalize">{row.land_id ?? 'default'}</td>
                      {SENSOR_CONFIGS.map(c => {
                        const val = row[c.key] as number;
                        const isGood = val >= c.goodMin && val <= c.goodMax;
                        return (
                          <td key={c.key} className="px-3 py-3 text-right">
                            <span className={`font-medium ${isGood ? 'text-teal-600' : 'text-amber-600'}`}>
                              {c.key === 'conductivity' ? val.toFixed(3) : c.key === 'ph' ? val.toFixed(2) : val.toFixed(1)}
                              <span className="text-gray-400 font-normal ml-0.5 text-xs">{c.unit}</span>
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-3 py-3 text-gray-300 group-hover:text-teal-400 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          aiHistory.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <BrainCircuit className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Tidak ada analisis AI tersimpan</p>
              <p className="text-sm mt-1">Simpan hasil analisis dari halaman Analisis AI untuk melihat riwayat</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {aiHistory.map((row, i) => {
                const severity = DISEASE_SEVERITY[row.disease_name] ?? 'none';
                const sev = severityCfg[severity];
                return (
                  <motion.div
                    key={row.id ?? i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedAI(row)}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-teal-50/40 cursor-pointer transition-colors group"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${sev.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-800">{row.disease_name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sev.bg} ${sev.color}`}>
                          {sev.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-gray-400">{row.created_at ? formatDate(row.created_at) : '—'}</p>
                        <span className="text-gray-300">·</span>
                        <p className="text-xs text-gray-400 capitalize">{row.land_id}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-sm font-bold ${sev.color}`}>{row.confidence.toFixed(1)}%</p>
                      <p className="text-xs text-gray-400">kepercayaan</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-400 transition-colors shrink-0" />
                  </motion.div>
                );
              })}
            </div>
          )
        )}
      </div>

      <AnimatePresence>
        {selectedSensor && (
          <SensorDetailModal record={selectedSensor} onClose={() => setSelectedSensor(null)} />
        )}
        {selectedAI && (
          <AIDetailModal record={selectedAI} onClose={() => setSelectedAI(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
