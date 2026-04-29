import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BrainCircuit, AlertTriangle, ShieldAlert, CheckCircle,
  ChevronRight, MapPin, MapPinOff, Clock,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { AIAnalysisRecord, SystemType, LandId } from '../../types';

const DISEASE_SEVERITY: Record<string, 'high' | 'medium' | 'none'> = {
  'Alternaria Porri': 'high',
  'Botrytis Leaf Blight': 'high',
  'Purple Blotch': 'medium',
  'Stemphylium Leaf Blight': 'medium',
  'Sehat': 'none',
};

const severityCfg = {
  high: {
    label: 'Risiko Tinggi',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
    bar: 'bg-red-500',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  medium: {
    label: 'Risiko Sedang',
    color: 'text-tertiary',
    bg: 'bg-tertiary/10',
    border: 'border-tertiary/20',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
    icon: <ShieldAlert className="w-3.5 h-3.5" />,
  },
  none: {
    label: 'Sehat',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    dot: 'bg-primary',
    bar: 'bg-primary',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  return `${days} hari lalu`;
}

export default function AIAnalysisSummary({
  systemType,
  landId,
}: {
  systemType: SystemType;
  landId: LandId;
}) {
  const { user } = useAuth();
  const { setActivePage } = useApp();
  const [records, setRecords] = useState<AIAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from('ai_analysis')
      .select('*')
      .eq('user_id', user.id)
      .eq('system_type', systemType)
      .eq('land_id', landId)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setRecords(data ?? []);
        setLoading(false);
      });
  }, [user, systemType, landId]);

  const latest = records[0];
  const severity = latest ? (DISEASE_SEVERITY[latest.disease_name] ?? 'none') : 'none';
  const sev = severityCfg[severity];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-tighter">Deteksi Penyakit</h3>
        </div>
        <button
          onClick={() => setActivePage('ai-analysis')}
          className="flex items-center gap-1 text-xs text-primary font-semibold hover:opacity-70 transition-opacity"
        >
          Analisis baru
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-black/5 p-5 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin shrink-0" />
          <p className="text-sm text-gray-400">Memuat data analisis...</p>
        </div>
      ) : !latest ? (
        <div className="bg-white rounded-2xl border border-dashed border-black/10 p-5 flex flex-col items-center gap-2 text-center">
          <BrainCircuit className="w-8 h-8 text-gray-200" />
          <p className="text-sm font-medium text-gray-500">Belum ada analisis untuk lahan ini</p>
          <button
            onClick={() => setActivePage('ai-analysis')}
            className="mt-1 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-xl hover:bg-primary/20 transition-colors"
          >
            Mulai Analisis Foto
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {/* Card terbaru — menonjol */}
          <div
            onClick={() => setActivePage('ai-analysis')}
            className={`bg-white rounded-2xl border ${sev.border} p-4 cursor-pointer hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${sev.bg} ${sev.color}`}>
                {React.cloneElement(sev.icon as React.ReactElement, { className: 'w-4 h-4' })}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-sm font-bold text-gray-900">{latest.disease_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${sev.bg} ${sev.color}`}>
                    {sev.label}
                  </span>
                </div>

                {/* Confidence bar */}
                <div className="mt-2.5">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Kepercayaan Model</span>
                    <span className="font-bold text-gray-700">{latest.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${latest.confidence}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className={`h-full rounded-full ${sev.bar}`}
                    />
                  </div>
                </div>

                {/* Metadata baris */}
                <div className="mt-2.5 flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3 shrink-0" />
                    {latest.created_at ? timeAgo(latest.created_at) : '—'}
                  </div>
                  {latest.latitude != null && latest.longitude != null ? (
                    <div className="flex items-center gap-1 text-xs text-teal-600">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="font-mono">
                        {latest.latitude.toFixed(4)}, {latest.longitude.toFixed(4)}
                      </span>
                      {latest.location_source && (
                        <span className="bg-teal-50 px-1.5 rounded text-teal-600 font-medium">
                          {latest.location_source === 'gps' ? 'GPS' : latest.location_source === 'exif' ? 'EXIF' : 'Manual'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-gray-300">
                      <MapPinOff className="w-3 h-3 shrink-0" />
                      <span>Tanpa lokasi</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rekomendasi ringkas */}
            <div className="mt-3 pt-3 border-t border-gray-50">
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{latest.recommendation}</p>
            </div>
          </div>

          {/* Riwayat sebelumnya — compact */}
          {records.slice(1).map((r, i) => {
            const rsev = severityCfg[DISEASE_SEVERITY[r.disease_name] ?? 'none'];
            return (
              <div
                key={r.id ?? i}
                onClick={() => setActivePage('history')}
                className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${rsev.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">{r.disease_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.created_at ? timeAgo(r.created_at) : '—'}</p>
                </div>
                <span className={`text-xs font-bold ${rsev.color}`}>{r.confidence.toFixed(0)}%</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
