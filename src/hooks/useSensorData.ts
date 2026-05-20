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

// FIX: Mengambil 1 data paling baru secara global dari database tanpa filter pengunci
async function fetchLatestReading(): Promise<SensorReading | null> {
  const { data, error } = await supabase
    .from('sensor_readings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export function useSensorData(systemType: SystemType, landId: LandId) {
  const { user } = useAuth();
  const { push } = useNotification();
  
  // FIX: Nilai default awal diset ke 0 (Bukan data dummy acak lagi)
  const [sensorData, setSensorData] = useState<SensorReading>({
    system_type: systemType,
    land_id: landId,
    moisture: 0,
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
    temperature: 0,
    ph: 7.0,
    conductivity: 0,
    created_at: new Date().toISOString(),
  });
  
  const [nextUpdateIn, setNextUpdateIn] = useState(systemType === 'panel' ? PANEL_REFRESH_INTERVAL : PORTABLE_REFRESH_INTERVAL);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [isDemoData, setIsDemoData] = useState(false); // Paksa selalu false
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshSensorData = useCallback(async (showFeedback = false) => {
    if (!user) return;

    setLoading(true);
    try {
      const latest = await fetchLatestReading();

      if (!latest) {
        console.log("Database masih kosong atau tidak mengembalikan data.");
        return;
      }

      setSensorData(latest);
      setLastUpdated(toDate(latest.created_at));
      setIsDemoData(false);

      checkCritical(latest).forEach(msg =>
        push({ type: 'error', title: 'Nilai Sensor Kritis!', message: msg, duration: 8000 })
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
  }, [user, systemType, push]);

  useEffect(() => {
    refreshSensorData(false);
  }, [refreshSensorData]);

  // FIX: Realtime Listener Global Tanpa Filter Kolom land_id
  useEffect(() => {
    if (!user) return;

    console.log(`[REALTIME] Mengaktifkan listener global untuk tabel sensor_readings.`);

    const channel = supabase
      .channel('sensor-readings-global-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings'
        },
        (payload) => {
          const newReading = payload.new as SensorReading;
          console.log("Sukses! Transmisi data sensor baru masuk ke database:", newReading);
          
          setSensorData(newReading);
          setLastUpdated(toDate(newReading.created_at));
          setIsDemoData(false);

          checkCritical(newReading).forEach(msg =>
            push({ type: 'error', title: 'Nilai Sensor Kritis!', message: msg, duration: 8000 })
          );

          push({
            type: 'success',
            title: 'Data Baru Terdeteksi!',
            message: 'Kondisi sensor diperbarui dari database secara live.',
            duration: 4000
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[REALTIME] Jalur global ke tabel sensor_readings aktif.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, push]);

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