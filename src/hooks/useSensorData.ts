import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorReading, SystemType, LandId } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const PANEL_REFRESH_INTERVAL = 10 * 1000;
const PORTABLE_REFRESH_INTERVAL = 0;

function checkCritical(data: SensorReading) {
  const msgs: string[] = [];
  if (data.ph < 5.0) msgs.push(`pH sangat rendah: ${data.ph}`);
  if (data.ph > 8.5) msgs.push(`pH sangat tinggi: ${data.ph}`);
  if (data.moisture < 20) msgs.push(`Kelembaban kritis rendah: ${data.moisture}%`);
  if (data.temperature > 38) msgs.push(`Suhu terlalu tinggi: ${data.temperature}°C`);
  if (data.nitrogen < 5) msgs.push(`Nitrogen sangat rendah: ${data.nitrogen} mg/kg`);
  return msgs;
}

function toDate(value?: string) {
  if (!value) return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

// FIX: Mengambil 1 data paling baru secara global dari database tanpa filter land_id/user_id
// Menggunakan tabel yang sesuai berdasarkan system_type
async function fetchLatestReading(systemType: SystemType, userId: string, landId: LandId): Promise<SensorReading | null> {
  const tableName = systemType === 'portable' ? 'sensor_readings_portable' : 'sensor_readings_panel';
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('user_id', userId)
    .eq('land_id', landId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export function useSensorData(systemType: SystemType, landId: LandId) {
  const { user } = useAuth();
  const { push } = useNotification();
  
  // FIX: Mengunci nilai default awal pada angka 0 (Bukan data dummy acak)
  const [sensorData, setSensorData] = useState<SensorReading>({
    system_type: systemType,
    land_id: landId,
    moisture: 0,
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
    temperature: 0,
    ph: 0,
    conductivity: 0,
    created_at: new Date().toISOString(),
  });
  
  const [nextUpdateIn, setNextUpdateIn] = useState(systemType === 'panel' ? PANEL_REFRESH_INTERVAL : PORTABLE_REFRESH_INTERVAL);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [isDemoData, setIsDemoData] = useState(false); // Dipaksa selalu false agar tidak lari ke dummy

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshSensorData = useCallback(async (showFeedback = false) => {
    if (!user) return;

    setLoading(true);
    try {
      const latest = await fetchLatestReading(systemType, user.id, landId);

      // FIX PEMUTUS DUMMY ACAK: Jika DB kosong / koneksi Vercel putus, kunci di angka 0 dan pH 7
      if (!latest) {
        console.log("Database kosong atau gagal memuat data asli. Memaksa state ke angka 0.");
        setSensorData({
          system_type: systemType,
          land_id: landId,
          moisture: 0,
          nitrogen: 0,
          phosphorus: 0,
          potassium: 0,
          temperature: 0,
          ph: 0, 
          conductivity: 0,
          created_at: undefined // Menandakan tidak ada timestamp dari DB
        });
        setIsDemoData(false);
        return;
      }

      setSensorData(latest);
      setLastUpdated(toDate(latest.created_at));
      setIsDemoData(false);

      checkCritical(latest).forEach(msg =>
        push({ type: 'error', title: 'Nilai Sensor Kritis!', message: msg })
      );

      if (showFeedback) {
        push({
          type: 'success',
          title: 'Data Terbaru Dimuat',
          message: 'Pembacaan sensor terakhir berhasil diambil dari Database.',
        });
      }
    } catch (error) {
      console.error('Failed to fetch latest sensor reading:', error);
    } finally {
      setLoading(false);
      setNextUpdateIn(systemType === 'panel' ? PANEL_REFRESH_INTERVAL : PORTABLE_REFRESH_INTERVAL);
    }
  }, [user, systemType, landId, push]);

  useEffect(() => {
    refreshSensorData(false);
  }, [refreshSensorData]);

  // FIX: Realtime Listener Global Tanpa Filter Kolom land_id agar transmisi Dani terbaca instan
  // Menggunakan tabel yang sesuai berdasarkan system_type
  useEffect(() => {
    if (!user) return;

    const tableName = systemType === 'portable' ? 'sensor_readings_portable' : 'sensor_readings_panel';
    console.log(`[REALTIME] Mengaktifkan listener untuk memantau data transmisi terbaru dari tabel ${tableName} untuk user ${user.id} dan lahan ${landId}.`);

    const channel = supabase
      .channel(`sensor-realtime-${systemType}-${landId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: tableName,
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newReading = payload.new as SensorReading;
          if (newReading.land_id !== landId) {
            console.log(`[REALTIME] Mengabaikan data sensor dari lahan lain.`, newReading);
            return;
          }
          console.log(`Sukses! Ada transmisi data sensor baru untuk lahan ${landId}:`, newReading);
          
          setSensorData(newReading);
          setLastUpdated(toDate(newReading.created_at));
          setIsDemoData(false);

          checkCritical(newReading).forEach(msg =>
            push({ type: 'error', title: 'Nilai Sensor Kritis!', message: msg })
          );

          push({
            type: 'success',
            title: 'Data Baru Terdeteksi!',
            message: 'Kondisi sensor diperbarui dari database secara live.',
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[REALTIME] Jalur untuk tabel ${tableName} aktif.`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, systemType, landId, push]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setNextUpdateIn(systemType === 'panel' ? PANEL_REFRESH_INTERVAL : PORTABLE_REFRESH_INTERVAL);

    if (systemType !== 'panel') return;

    timerRef.current = setInterval(() => {
      refreshSensorData(false);
    }, PANEL_REFRESH_INTERVAL);

    countdownRef.current = setInterval(() => {
      setNextUpdateIn(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [systemType, refreshSensorData]);

  return {
    sensorData,
    nextUpdateIn,
    lastUpdated,
    loading,
    isDemoData,
    refreshSensorData,
    refreshInterval: systemType === 'panel' ? PANEL_REFRESH_INTERVAL : PORTABLE_REFRESH_INTERVAL,
  };
}