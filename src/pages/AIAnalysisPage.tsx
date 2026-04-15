import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, RefreshCw, Clock, AlertTriangle, CheckCircle, Scan, ShieldAlert, Activity } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAIDetection } from '../hooks/useAIDetection';

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const DISEASE_INFO: Record<string, { desc: string; severity: 'high' | 'medium' | 'low' | 'none' }> = {
  'Alternaria Porri': { desc: 'Bercak ungu pada daun bawang. Disebabkan jamur Alternaria porri.', severity: 'high' },
  'Botrytis Leaf Blight': { desc: 'Busuk abu-abu pada daun. Rentan saat kelembaban tinggi.', severity: 'high' },
  'Purple Blotch': { desc: 'Bercak ungu kecoklatan. Muncul di kondisi lembab.', severity: 'medium' },
  'Stemphylium Leaf Blight': { desc: 'Bercak kuning-coklat akibat jamur Stemphylium vesicarium.', severity: 'medium' },
  'Sehat': { desc: 'Tanaman terdeteksi dalam kondisi sehat. Tidak ada patogen yang terdeteksi.', severity: 'none' },
};

const severityConfig = {
  high: { label: 'Tinggi', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
  medium: { label: 'Sedang', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: <ShieldAlert className="w-4 h-4 text-amber-500" /> },
  low: { label: 'Rendah', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: <Activity className="w-4 h-4 text-blue-500" /> },
  none: { label: 'Sehat', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', icon: <CheckCircle className="w-4 h-4 text-teal-500" /> },
};

export default function AIAnalysisPage() {
  const { activeMode } = useApp();
  const { detection, nextUpdateIn, lastUpdated, analyzing, runDetection } = useAIDetection(activeMode);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const imgRef = React.useRef<HTMLImageElement>(null);

  const diseaseInfo = detection ? (DISEASE_INFO[detection.label] ?? DISEASE_INFO['Sehat']) : null;
  const severity = diseaseInfo?.severity ?? 'none';
  const sevConfig = severityConfig[severity];

  function handleImgLoad() {
    setImgLoaded(true);
    if (imgRef.current) {
      setImgSize({ w: imgRef.current.clientWidth, h: imgRef.current.clientHeight });
    }
  }

  const bboxStyle = detection && imgLoaded && imgSize.w > 0 ? {
    left: `${detection.bbox_x * 100}%`,
    top: `${detection.bbox_y * 100}%`,
    width: `${detection.bbox_width * 100}%`,
    height: `${detection.bbox_height * 100}%`,
  } : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Analisis Patogen SIGMA AI</h2>
          <p className="text-sm text-gray-400">Model: penyakit-bawang/1 — Deteksi Penyakit Bawang Merah</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Scan className="w-4 h-4 text-teal-500" />
                <span className="text-sm font-semibold text-gray-700">Pratinjau Gambar Capture</span>
              </div>
              <button
                onClick={runDetection}
                disabled={analyzing}
                className="flex items-center gap-2 text-xs bg-teal-500 hover:bg-teal-400 disabled:bg-gray-200 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                {analyzing ? 'Menganalisis...' : 'Analisis Ulang'}
              </button>
            </div>

            <div className="relative bg-gray-900 aspect-video overflow-hidden">
              <img
                ref={imgRef}
                src="https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Tangkapan kamera lapangan"
                onLoad={handleImgLoad}
                className="w-full h-full object-cover"
              />

              {analyzing && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 border-4 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
                  <div className="space-y-1 text-center">
                    <p className="text-white font-semibold text-sm">Menganalisis...</p>
                    <p className="text-teal-300 text-xs">Model Roboflow penyakit-bawang/1</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {['Pra-proses', 'Inferensi', 'NMS'].map((step, i) => (
                      <div key={step} className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                        <span className="text-teal-300/70 text-xs">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!analyzing && detection && imgLoaded && bboxStyle && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="absolute"
                    style={bboxStyle}
                  >
                    <div
                      className={`w-full h-full border-2 rounded-sm ${
                        severity === 'none' ? 'border-teal-400' : severity === 'high' ? 'border-red-400' : 'border-amber-400'
                      }`}
                    >
                      <div
                        className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-xs font-bold text-white whitespace-nowrap ${
                          severity === 'none' ? 'bg-teal-500' : severity === 'high' ? 'bg-red-500' : 'bg-amber-500'
                        }`}
                      >
                        {detection.label} — {detection.confidence.toFixed(1)}%
                      </div>
                    </div>
                    <div
                      className={`absolute inset-0 opacity-10 ${
                        severity === 'none' ? 'bg-teal-400' : severity === 'high' ? 'bg-red-400' : 'bg-amber-400'
                      }`}
                    />
                  </motion.div>
                </AnimatePresence>
              )}

              <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                <span className="text-white text-xs font-medium">SIGMA CAM</span>
              </div>

              <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <span className="text-white/70 text-xs font-mono">
                  {new Date().toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-teal-600">Live</span>
            </div>
            <div className="w-px h-6 bg-gray-100" />
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Pembaruan berikutnya: <span className="font-mono font-bold text-gray-800">{formatTime(nextUpdateIn)}</span></span>
            </div>
            <div className="flex-1 hidden sm:block">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-1000"
                  style={{ width: `${((600000 - nextUpdateIn) / 600000) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="wait">
            {detection && !analyzing && (
              <motion.div
                key={detection.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className={`bg-white rounded-2xl shadow-sm border p-5 ${sevConfig.border}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-700">Hasil Deteksi</h3>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sevConfig.bg} ${sevConfig.color}`}>
                      {sevConfig.icon}
                      Risiko {sevConfig.label}
                    </div>
                  </div>

                  <div className="text-center py-3">
                    <p className="text-2xl font-bold text-gray-900">{detection.label}</p>
                    <p className="text-gray-400 text-sm mt-1">Patogen Terdeteksi</p>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span>Kepercayaan Model</span>
                        <span className="font-bold text-gray-700">{detection.confidence.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${detection.confidence}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-full rounded-full ${
                            severity === 'none' ? 'bg-teal-500' : severity === 'high' ? 'bg-red-500' : 'bg-amber-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Informasi Penyakit</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{diseaseInfo?.desc}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Koordinat Bounding Box</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'X', value: detection.bbox_x.toFixed(3) },
                      { label: 'Y', value: detection.bbox_y.toFixed(3) },
                      { label: 'Lebar', value: detection.bbox_width.toFixed(3) },
                      { label: 'Tinggi', value: detection.bbox_height.toFixed(3) },
                    ].map(item => (
                      <div key={item.label} className="bg-gray-50 rounded-xl px-3 py-2">
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="text-sm font-mono font-bold text-gray-800">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Info Model</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Model', value: 'penyakit-bawang/1' },
                      { label: 'Sumber', value: 'Roboflow Universe' },
                      { label: 'Target', value: 'Tanaman Bawang Merah' },
                      { label: 'Versi', value: 'v1.0' },
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
            {analyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center gap-4 text-center"
              >
                <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin" />
                <p className="text-gray-600 font-medium">Memproses gambar...</p>
                <p className="text-gray-400 text-sm">Model AI sedang menganalisis tanaman bawang</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
