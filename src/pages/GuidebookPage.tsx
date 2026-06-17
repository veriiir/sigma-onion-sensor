import React from 'react';
import { BookOpen, BrainCircuit, MapPin, Activity, Smartphone, MonitorSpeaker } from 'lucide-react';

export default function GuidebookPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/5">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tighter">Buku Panduan</h2>
          <p className="text-sm text-neutral-muted font-medium">Panduan penggunaan aplikasi SIGMA</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <section>
          <h3 className="text-lg font-bold text-gray-800 mb-3">1. Tentang SIGMA</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            SIGMA (Smart IoT for Growth Monitoring in Agriculture) adalah platform cerdas untuk memantau kondisi kesehatan tanaman bawang Anda secara real-time. Dengan bantuan AI, Anda dapat mendeteksi penyakit tanaman lebih cepat dan mendapatkan saran penanganan yang tepat.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-accent-rosemary/10 border border-accent-rosemary/20">
            <div className="flex items-center gap-2 mb-2 text-accent-straken">
              <Smartphone className="w-5 h-5" />
              <h4 className="font-bold text-sm">Portable Mode</h4>
            </div>
            <p className="text-xs text-gray-600">Digunakan untuk monitoring lapangan secara fleksibel dengan perangkat mobile.</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <MonitorSpeaker className="w-5 h-5" />
              <h4 className="font-bold text-sm">Panel Mode</h4>
            </div>
            <p className="text-xs text-gray-600">Digunakan untuk monitoring lahan stasioner menggunakan panel sensor terpasang.</p>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" /> 2. Analisis AI
          </h3>
          <ul className="text-sm text-gray-600 space-y-2 list-decimal pl-4">
            <li>Pastikan lahan sudah terdaftar di menu pemilihan lahan.</li>
            <li>Pilih mode (Portable/Panel) yang sesuai.</li>
            <li>Pilih lahan atau lokasi yang ingin dianalisis.</li>
            <li>Ambil foto tanaman terinfeksi menggunakan kamera atau unggah foto dari galeri.</li>
            <li>Tunggu proses deteksi selesai, sistem akan menampilkan hasil penyakit dan rekomendasi penanganan.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> 3. Manajemen Lahan
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Untuk menambah lahan, buka menu pemilihan lahan, klik tombol tambah (+), masukkan nama lahan, varietas (jika Panel), dan koordinat Google Maps. Koordinat sangat penting untuk memastikan akurasi validasi lokasi saat melakukan analisis AI.
          </p>
        </section>
      </div>
    </div>
  );
}
