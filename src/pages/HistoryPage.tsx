import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Thermometer, BrainCircuit, Calendar, Search, X } from 'lucide-react';
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

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

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
          <p className="text-sm text-gray-400">Mode {activeMode === 'portable' ? 'Portable' : 'Panel'} — Maks. 100 catatan</p>
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
                  </tr>
                </thead>
                <tbody>
                  {sensorHistory.map((row, i) => (
                    <motion.tr
                      key={row.id ?? i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Waktu</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lahan</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Penyakit</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kepercayaan</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rekomendasi</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {aiHistory.map((row, i) => {
                    const isHealthy = row.disease_name === 'Sehat';
                    return (
                      <motion.tr
                        key={row.id ?? i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{formatDate(row.created_at!)}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 font-medium capitalize">{row.land_id}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{row.disease_name}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isHealthy ? 'bg-teal-500' : 'bg-amber-500'}`}
                                style={{ width: `${row.confidence}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-gray-700 text-xs w-12 text-right">{row.confidence.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-xs">
                          <p className="truncate">{row.recommendation}</p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${isHealthy ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'}`}>
                            {isHealthy ? 'Sehat' : 'Terdeteksi'}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
