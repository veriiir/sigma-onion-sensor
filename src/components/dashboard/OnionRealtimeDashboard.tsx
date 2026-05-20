import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { SensorReading } from '../../types';
import { 
  Droplets, FlaskConical, Thermometer, 
  Smartphone, Activity, RefreshCw, AlertCircle 
} from 'lucide-react';

interface OnionRealtimeDashboardProps {
  targetDeviceId?: string;
  landId?: string;
}

export default function OnionRealtimeDashboard({ 
  targetDeviceId = "onion-field-panel-01",
  landId = "lahan1" 
}: OnionRealtimeDashboardProps) {
  const [sensorData, setSensorData] = useState<SensorReading>({
    system_type: 'panel',
    land_id: landId,
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
    ph: 7.0,
    moisture: 0,
    temperature: 0,
    conductivity: 0,
    created_at: undefined
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);

  // 1. Mengambil data awal (Initial Fetch)
  const fetchLatestData = async () => {
    try {
      setLoading(true);
      const { data, error: dbError } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('land_id', landId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbError) throw dbError;
      if (data) {
        setSensorData(data);
      }
      setError(null);
    } catch (err: any) {
      console.error("Gagal mengambil data sensor awal:", err.message);
      setError("Gagal memuat data terakhir dari database.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Hubungkan ke Supabase Realtime Channel
  useEffect(() => {
    fetchLatestData();

    // Buat realtime channel untuk mendengarkan perubahan tabel sensor_readings secara live
    const channel = supabase
      .channel(`sensor-readings-direct-${landId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings',
          filter: `land_id=eq.${landId}`
        },
        (payload) => {
          console.log("Menerima data sensor baru secara Realtime:", payload.new);
          setSensorData(payload.new as SensorReading);
          
          // Triger efek visual pulsing kedip hijau ketika data baru masuk
          setPulseEffect(true);
          setTimeout(() => setPulseEffect(false), 1500);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsLive(true);
          console.log("Berhasil subscribe ke Supabase Realtime!");
        } else {
          setIsLive(false);
        }
      });

    // Cleanup subscription saat komponen di-unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [landId]);

  // Evaluasi indikator kelayakan tanah bawang merah (pH ideal: 5.5 - 7.0, kelembapan ideal: >40%)
  const getSoilStatus = () => {
    if (sensorData.ph < 5.5) return { text: "Kadar Asam Tinggi (Butuh Kapur Dolomit)", color: "text-red-600 bg-red-50 border-red-200 animate-pulse" };
    if (sensorData.ph > 7.0) return { text: "Terlalu Basa (Butuh Pemupukan Sulfur/ZA)", color: "text-amber-600 bg-amber-50 border-amber-200" };
    if (sensorData.moisture < 40) return { text: "Tanah Kering (Perlu Penyiraman / Irigasi)", color: "text-blue-600 bg-blue-50 border-blue-200" };
    return { text: "Kondisi Tanah Optimal (Sangat Ideal untuk Bawang Merah)", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  };

  const status = getSoilStatus();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] bg-neutral-50 rounded-2xl border border-black/5 p-8">
        <RefreshCw className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm font-semibold text-gray-500 font-sans">Mengkoneksikan ke database...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      
      {/* Header Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-800 tracking-tight">SIGMA REALTIME MONITOR</h1>
            {isLive ? (
              <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live Connection
              </span>
            ) : (
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Offline
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" /> Lahan: <span className="font-semibold text-primary font-mono">{landId}</span>
            {targetDeviceId && (
              <>
                <span className="text-gray-300">|</span>
                <span>Device ID: <span className="font-semibold text-emerald-700 font-mono">{targetDeviceId}</span></span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sensorData.created_at && (
            <span className="text-xs text-gray-400 font-medium">
              Update Terakhir: {new Date(sensorData.created_at).toLocaleTimeString('id-ID')}
            </span>
          )}
          <button 
            onClick={fetchLatestData}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors border border-black/5 text-gray-600"
            title="Refresh Data Manual"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Indikator Status Kelayakan */}
      <div className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-500 ${status.color} ${pulseEffect ? 'ring-4 ring-emerald-400/30' : ''}`}>
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 shrink-0" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">Rekomendasi Lahan</p>
            <p className="text-sm font-black tracking-tight mt-0.5">{status.text}</p>
          </div>
        </div>
        <span className="text-[10px] font-black px-3 py-1 bg-white/70 border border-current rounded-xl uppercase">
          Bawang Merah
        </span>
      </div>

      {/* Grid parameter sensor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* NPK Card */}
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
          <h2 className="text-xs font-black uppercase text-gray-400 tracking-wider">Kadar NPK Tanah (mg/kg)</h2>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Nitrogen (N)</span>
                <span className="text-emerald-600 font-extrabold">{sensorData.nitrogen} mg/kg</span>
              </div>
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((sensorData.nitrogen / 100) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Fosfor (P)</span>
                <span className="text-amber-600 font-extrabold">{sensorData.phosphorus} mg/kg</span>
              </div>
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((sensorData.phosphorus / 100) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Kalium (K)</span>
                <span className="text-indigo-600 font-extrabold">{sensorData.potassium} mg/kg</span>
              </div>
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((sensorData.potassium / 200) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* pH Card */}
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-black uppercase text-gray-400 tracking-wider">Derajat Keasaman (pH)</span>
            <div className="w-10 h-10 rounded-xl bg-[#829D45]/10 flex items-center justify-center text-[#829D45]"><FlaskConical className="w-5 h-5" /></div>
          </div>
          <div className="my-4">
            <h3 className="text-4xl font-black text-gray-800 tracking-tight">{Number(sensorData.ph).toFixed(2)}</h3>
            <p className="text-[10px] font-bold text-gray-400 mt-1">Sifat tanah: {sensorData.ph < 7.0 ? 'Asam' : sensorData.ph > 7.0 ? 'Basa' : 'Netral'}</p>
          </div>
          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
            <div className="bg-[#829D45] h-full rounded-full transition-all duration-1000" style={{ width: `${(sensorData.ph / 14) * 100}%` }}></div>
          </div>
        </div>

        {/* Kelembaban & Suhu */}
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-gray-600">Kelembaban Tanah</span>
            </div>
            <span className="text-lg font-black text-gray-800">{sensorData.moisture}%</span>
          </div>

          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-gray-600">Suhu Tanah</span>
            </div>
            <span className="text-lg font-black text-gray-800">{sensorData.temperature}°C</span>
          </div>

          <div className="text-[9px] text-gray-400 font-semibold italic">
            * Parameter tanah di-broadcast instan menggunakan Supabase Realtime Channel
          </div>
        </div>

      </div>
    </div>
  );
}
