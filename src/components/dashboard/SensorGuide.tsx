import React from 'react';
import { SENSOR_CONFIGS } from '../../constants/sensors';
import { Info, BookOpen } from 'lucide-react';

const SENSOR_KNOWLEDGE: Record<string, { impact: string; tip: string }> = {
  moisture: { impact: 'Mempengaruhi laju fotosintesis dan penyerapan nutrisi.', tip: 'Jaga kelembaban stabil untuk menghindari stres tanaman dan pembusukan akar.' },
  nitrogen: { impact: 'Mendorong pertumbuhan daun dan batang (vegetatif).', tip: 'Kekurangan menyebabkan daun kuning/kerdil. Kelebihan membuat tanaman rentan hama.' },
  phosphorus: { impact: 'Penting untuk perkembangan akar dan pembentukan umbi.', tip: 'Cukupkan P di fase awal untuk perakaran kuat dan fase pembentukan umbi.' },
  potassium: { impact: 'Meningkatkan kualitas umbi dan ketahanan penyakit.', tip: 'Kalium sangat dibutuhkan saat fase pembesaran umbi agar hasil panen lebih berat dan awet.' },
  temperature: { impact: 'Mengatur laju metabolisme tanaman.', tip: 'Suhu terlalu tinggi menyebabkan tanaman stres dan penguapan berlebih.' },
  ph: { impact: 'Menentukan ketersediaan nutrisi di dalam tanah.', tip: 'pH yang tidak tepat membuat pupuk tidak dapat diserap oleh akar, meski pupuk sudah diberikan.' },
  conductivity: { impact: 'Mengukur konsentrasi garam/pupuk dalam tanah.', tip: 'EC terlalu tinggi dapat menyebabkan "terbakar" pada akar tanaman.' },
};

export default function SensorGuide() {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-black/[0.03] p-6 space-y-6">
      <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 uppercase tracking-tight">
        <BookOpen className="w-5 h-5 text-primary" /> Panduan & Edukasi Sensor
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SENSOR_CONFIGS.map((config) => {
          const knowledge = SENSOR_KNOWLEDGE[config.key] || { impact: '-', tip: '-' };
          return (
            <div key={config.key} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <p className="text-sm font-black text-gray-800 mb-2">{config.label}</p>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-[10px] font-bold text-gray-500 truncate">Rendah: &lt; {config.goodMin} {config.unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-[10px] font-bold text-gray-500 truncate">Optimal: {config.goodMin}–{config.goodMax} {config.unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="text-[10px] font-bold text-gray-500 truncate">Tinggi: &gt; {config.goodMax} {config.unit}</span>
                </div>
              </div>

              <div className="text-[10px] text-gray-600 bg-gray-50 p-2 rounded-lg border border-black/[0.02] mt-auto">
                <p className="font-bold mb-0.5 text-gray-800">Dampak:</p>
                <p className="italic mb-2">{knowledge.impact}</p>
                <p className="font-bold text-primary">Tips:</p>
                <p>{knowledge.tip}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
