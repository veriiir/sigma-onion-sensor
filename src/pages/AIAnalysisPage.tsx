import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Play, Save, CheckCircle, AlertTriangle, ShieldAlert, Scan, Info } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useAIDetection } from '../hooks/useAIDetection';
import { useNotification } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';
import { AIAnalysisRecord } from '../types';
import LandSelector from '../components/dashboard/LandSelector';

const DISEASE_DATA: Record<string, { severity: 'high' | 'medium' | 'none'; recommendation: string }> = {
  'Alternaria Porri': {
    severity: 'high',
    recommendation: 'Semprot fungisida berbahan aktif iprodione atau mancozeb. Kurangi kelembaban, perbaiki drainase, dan musnahkan daun terinfeksi segera.',
  },
  'Botrytis Leaf Blight': {
    severity: 'high',
    recommendation: 'Gunakan fungisida sistemik (chlorothalonil atau tebuconazole). Hindari irigasi berlebih, tingkatkan sirkulasi udara di lahan.',
  },
  'Purple Blotch': {
    severity: 'medium',
    recommendation: 'Aplikasikan fungisida protektif saat gejala awal. Lakukan rotasi tanaman dan hindari penanaman pada musim hujan berlebih.',
  },
  'Stemphylium Leaf Blight': {
    severity: 'medium',
    recommendation: 'Semprot dengan fungisida difenokonazol. Pantau kelembaban relatif dan hindari pemupukan nitrogen berlebihan.',
  },
  'Sehat': {
    severity: 'none',
    recommendation: 'Tanaman dalam kondisi sehat. Pertahankan praktik budidaya yang baik, pantau secara rutin, dan jaga kebersihan lahan.',
  },
};

const severityCfg = {
  high: { label: 'Risiko Tinggi', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: <AlertTriangle className="w-4 h-4" /> },
  medium: { label: 'Risiko Sedang', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: <ShieldAlert className="w-4 h-4" /> },
  none: { label: 'Sehat', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', icon: <CheckCircle className="w-4 h-4" /> },
};

export default function AIAnalysisPage() {
  const { activeMode, selectedLand, setSelectedLand } = useApp();
  const { user } = useAuth();
  const { push } = useNotification();
  const { detection, analyzing, lastAnalyzed, runDetection } = useAIDetection(activeMode, selectedLand);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  const diseaseInfo = detection ? (DISEASE_DATA[detection.label] ?? DISEASE_DATA['Sehat']) : null;
  const severity = diseaseInfo?.severity ?? 'none';
  const sevCfg = severityCfg[severity];

  const bboxStyle = detection && imgLoaded && imgRef.current ? {
    left: `${detection.bbox_x * 100}%`,
    top: `${detection.bbox_y * 100}%`,
    width: `${detection.bbox_width * 100}%`,
    height: `${detection.bbox_height * 100}%`,
  } : null;

  async function handleSaveToHistory() {
    if (!user || !detection || !diseaseInfo) return;
    setSaving(true);
    const record: Omit<AIAnalysisRecord, 'id' | 'created_at'> = {
      user_id: user.id,
      system_type: activeMode,
      land_id: selectedLand,
      disease_name: detection.label,
      confidence: detection.confidence,
      recommendation: diseaseInfo.recommendation,
      image_url: detection.image_url,
      bbox_x: detection.bbox_x,
      bbox_y: detection.bbox_y,
      bbox_width: detection.bbox_width,
      bbox_height: detection.bbox_height,
    };
    await supabase.from('ai_analysis').insert(record);
    setSaving(false);
    setSaved(true);
    push({ type: 'success', title: 'Analisis Disimpan', message: `Hasil deteksi "${detection.label}" berhasil disimpan ke riwayat.` });
    if (severity === 'high') {
      push({ type: 'error', title: 'Penyakit Berat Terdeteksi!', message: `${detection.label} terdeteksi (${detection.confidence.toFixed(1)}%). Segera ambil tindakan.`, duration: 8000 });
    }
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleRunDetection() {
    setSaved(false);
    setImgLoaded(false);
    await runDetection();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Analisis Patogen SIGMA AI</h2>
            <p className="text-sm text-gray-400">Model: penyakit-bawang/1 — Klik tombol untuk memulai</p>
          </div>
        </div>
        {activeMode === 'panel' && (
          <LandSelector selectedLand={selectedLand} onSelect={setSelectedLand} />
        )}
      </div>

      {!detection && !analyzing && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center gap-5 text-center">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center">
            <Scan className="w-10 h-10 text-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Siap Menganalisis</h3>
            <p className="text-gray-400 text-sm mt-1 max-w-xs">
              Klik tombol di bawah untuk memulai analisis AI pada gambar tanaman bawang dari kamera lapangan.
            </p>
          </div>
          <button
            onClick={handleRunDetection}
            className="flex items-center gap-2.5 bg-teal-500 hover:bg-teal-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-teal-200"
          >
            <Play className="w-5 h-5" />
            Mulai Analisis AI
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-xl">
            <Info className="w-3.5 h-3.5" />
            Menggunakan model Roboflow penyakit-bawang/1
          </div>
        </div>
      )}

      {(detection || analyzing) && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Scan className="w-4 h-4 text-teal-500" />
                  <span className="text-sm font-semibold text-gray-700">Gambar Capture Lapangan</span>
                </div>
                <button
                  onClick={handleRunDetection}
                  disabled={analyzing}
                  className="flex items-center gap-2 text-xs bg-teal-500 hover:bg-teal-400 disabled:bg-gray-200 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  <Play className="w-3.5 h-3.5" />
                  {analyzing ? 'Menganalisis...' : 'Analisis Ulang'}
                </button>
              </div>

              <div className="relative bg-gray-900 aspect-video overflow-hidden">
                <img
                  ref={imgRef}
                  src="https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Tangkapan kamera lapangan"
                  onLoad={() => setImgLoaded(true)}
                  className="w-full h-full object-cover"
                />

                {analyzing && (
                  <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center gap-4">
                    <div className="w-14 h-14 border-4 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
                    <div className="text-center">
                      <p className="text-white font-semibold">Menganalisis Citra...</p>
                      <p className="text-teal-300 text-xs mt-1">Model penyakit-bawang/1 sedang berjalan</p>
                    </div>
                    <div className="flex gap-3">
                      {['Pra-proses', 'Inferensi', 'Post-process'].map((s, i) => (
                        <div key={s} className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          <span className="text-teal-300/70 text-xs">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!analyzing && detection && imgLoaded && bboxStyle && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute"
                      style={bboxStyle}
                    >
                      <div className={`w-full h-full border-2 rounded-sm relative ${severity === 'none' ? 'border-teal-400' : severity === 'high' ? 'border-red-400' : 'border-amber-400'}`}>
                        <div className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-xs font-bold text-white whitespace-nowrap ${severity === 'none' ? 'bg-teal-500' : severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}`}>
                          {detection.label} — {detection.confidence.toFixed(1)}%
                        </div>
                      </div>
                      <div className={`absolute inset-0 opacity-10 ${severity === 'none' ? 'bg-teal-400' : severity === 'high' ? 'bg-red-400' : 'bg-amber-400'}`} />
                    </motion.div>
                  </AnimatePresence>
                )}

                <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                  <span className="text-white text-xs font-medium">SIGMA CAM</span>
                </div>
              </div>
            </div>

            {!analyzing && detection && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex items-center gap-4">
                {lastAnalyzed && (
                  <p className="text-xs text-gray-400 flex-1">
                    Dianalisis: {lastAnalyzed.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                )}
                <button
                  onClick={handleSaveToHistory}
                  disabled={saving || saved}
                  className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                    saved
                      ? 'bg-teal-100 text-teal-600 cursor-default'
                      : 'bg-teal-500 hover:bg-teal-400 disabled:bg-gray-200 text-white shadow-sm shadow-teal-200'
                  }`}
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : saved ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan ke Riwayat'}
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="wait">
              {analyzing ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center gap-4 text-center"
                >
                  <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin" />
                  <p className="text-gray-500 font-medium">Memproses gambar tanaman...</p>
                </motion.div>
              ) : detection && (
                <motion.div key={detection.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }} className="space-y-4"
                >
                  <div className={`bg-white rounded-2xl shadow-sm border p-5 ${sevCfg.border}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-700">Hasil Deteksi</h3>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sevCfg.bg} ${sevCfg.color}`}>
                        {sevCfg.icon}
                        {sevCfg.label}
                      </div>
                    </div>
                    <div className="text-center py-2">
                      <p className="text-2xl font-bold text-gray-900">{detection.label}</p>
                      <p className="text-gray-400 text-sm mt-1">Patogen Terdeteksi</p>
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                          <span>Kepercayaan Model</span>
                          <span className="font-bold text-gray-700">{detection.confidence.toFixed(1)}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${detection.confidence}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={`h-full rounded-full ${severity === 'none' ? 'bg-teal-500' : severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Rekomendasi Tindakan</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{diseaseInfo?.recommendation}</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Info Model & Deteksi</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Model', value: 'penyakit-bawang/1' },
                        { label: 'Lahan', value: activeMode === 'panel' ? selectedLand.replace('lahan', 'Lahan ') : 'Portable' },
                        { label: 'Bbox X', value: detection.bbox_x.toFixed(3) },
                        { label: 'Bbox Y', value: detection.bbox_y.toFixed(3) },
                        { label: 'Lebar', value: detection.bbox_width.toFixed(3) },
                        { label: 'Tinggi', value: detection.bbox_height.toFixed(3) },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between text-sm">
                          <span className="text-gray-400">{item.label}</span>
                          <span className="font-medium text-gray-700">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
