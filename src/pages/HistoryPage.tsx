import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Thermometer, Droplets, RefreshCw, Download, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { SensorReading, AIDetection } from '../types';
import { SENSOR_CONFIGS } from '../constants/sensors';

type TabType = 'sensor' | 'ai';

export default function HistoryPage() {
  const { user } = useAuth();
  const { activeMode } = useApp();
  const [tab, setTab] = useState<TabType>('sensor');
  const [sensorHistory, setSensorHistory] = useState<SensorReading[]>([]);
  const [aiHistory, setAiHistory] = useState<AIDetection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    if (tab === 'sensor') {
      supabase
        .from('sensor_readings')
        .select('*')
        .eq('user_id', user.id)
        .eq('system_type', activeMode)
        .order('created_at', { ascending: false })
        .limit(50)
        .then(({ data }) => {
          setSensorHistory(data ?? []);
          setLoading(false);
        });
    } else {
      supabase
        .from('ai_detections')
        .select('*')
        .eq('user_id', user.id)
        .eq('system_type', activeMode)
        .order('created_at', { ascending: false })
        .limit(50)
        .then(({ data }) => {
          setAiHistory(data ?? []);
          setLoading(false);
        });
    }
  }, [user, activeMode, tab]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
          <History className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Riwayat Data</h2>
          <p className="text-sm text-gray-400">50 catatan terbaru — Mode {activeMode === 'portable' ? 'Portable' : 'Panel'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab('sensor')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === 'sensor' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Data Sensor
          </button>
          <button
            onClick={() => setTab('ai')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === 'ai' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Deteksi AI
          </button>
        </div>
        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-xl transition-colors ml-auto">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
          </div>
        ) : tab === 'sensor' ? (
          sensorHistory.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Thermometer className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Belum ada data sensor</p>
              <p className="text-sm mt-1">Data akan muncul setelah siklus pembaruan pertama</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Waktu</th>
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
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {formatDate(row.created_at!)}
                      </td>
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
              <Droplets className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Belum ada deteksi AI</p>
              <p className="text-sm mt-1">Data akan muncul setelah analisis pertama dilakukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Waktu</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hasil Deteksi</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kepercayaan</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {aiHistory.map((row, i) => {
                    const isHealthy = row.label === 'Sehat';
                    return (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                          {formatDate(row.created_at!)}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">{row.label}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isHealthy ? 'bg-teal-500' : 'bg-amber-500'}`}
                                style={{ width: `${row.confidence}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-gray-700 text-xs w-12 text-right">
                              {row.confidence.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            isHealthy ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'
                          }`}>
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
