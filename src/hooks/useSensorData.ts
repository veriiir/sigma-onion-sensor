import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorReading, SystemType, LandId } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const PANEL_REFRESH_INTERVAL = 10 * 1000;
const PORTABLE_REFRESH_INTERVAL = 0;

function generateDemoSensorData(systemType: SystemType, landId: LandId): SensorReading {
  const variance = systemType === 'portable' ? 1.0 : 0.5;
  const offset = landId === 'lahan2' ? 5 : landId === 'lahan3' ? 10 : 0;
  return {
    system_type: systemType,
    land_id: landId,
    moisture: parseFloat((40 + offset * 0.5 + Math.random() * 30 * variance).toFixed(1)),
    nitrogen: parseFloat((20 + offset * 0.8 + Math.random() * 30 * variance).toFixed(1)),
    phosphorus: parseFloat((10 + offset * 0.3 + Math.random() * 18 * variance).toFixed(1)),
    potassium: parseFloat((80 + offset * 2 + Math.random() * 100 * variance).toFixed(1)),
    temperature: parseFloat((24 + offset * 0.2 + Math.random() * 8 * variance).toFixed(1)),
    ph: parseFloat((5.8 + offset *import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorReading, SystemType, LandId } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const PANEL_REFRESH_INTERVAL = 10 * 1000;
const PORTABLE_REFRESH_INTERVAL = 0;

function generateDemoSensorData(systemType: SystemType, landId: LandId): SensorReading {
  const variance = systemType === 'portable' ? 1.0 : 0.5;
  const offset = landId === 'lahan2' ? 5 : landId === 'lahan3' ? 10 : 0;
  return {
    system_type: systemType,
    land_id: landId,
    moisture: parseFloat((40 + offset * 0.5 + Math.random() * 30 * variance).toFixed(1)),
    nitrogen: parseFloat((20 + offset * 0.8 + Math.random() * 30 * variance).toFixed(1)),
    phosphorus: parseFloat((10 + offset * 0.3 + Math.random() * 18 * variance).toFixed(1)),
    potassium: parseFloat((80 + offset * 2 + Math.random() * 100 * variance).toFixed(1)),
    temperature: parseFloat((24 + offset * 0.2 + Math.random() * 8 * variance).toFixed(1)),
    ph: parseFloat((5.8 + offset * 0.05 + Math.random() * 1.2 * variance).toFixed(2)),
    conductivity: parseFloat((0.6 + offset * 0.05 + Math.random() * 1.8 * variance).toFixed(3)),
    created_at: new Date().toISOString(),
  };
}

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

async function fetchLatestReading(
  userId: string,
  systemType: SystemType,
  landId: LandId,
): Promise<SensorReading | null> {
  const { data, error } = await supabase
    .from('sensor_readings')
    .select('*')
    .eq('user_id', userId)
    .eq('system_type', systemType)
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
  const [sensorData, setSensorData] = useState<SensorReading>(() => generateDemoSensorData(systemType, landId));
  const [nextUpdateIn, setNextUpdateIn] = useState(systemType === 'panel' ? PANEL_REFRESH_INTERVAL : PORTABLE_REFRESH_INTERVAL);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [isDemoData, setIsDemoData] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningShownRef = useRef(false);

  const refreshSensorData = useCallback(async (showFeedback = false) => {
    if (!user) {
      const demo = generateDemoSensorData(systemType, landId);
      setSensorData(demo);
      setLastUpdated(toDate(demo.created_at));
      setIsDemoData(true);
      return;
    }

    setLoading(true);
    try {
      const latest = await fetchLatestReading(user.id, systemType, landId);

      if (!latest) {
        const demo = generateDemoSensorData(systemType, landId);
        setSensorData(demo);
        setLastUpdated(toDate(demo.created_at));
        setIsDemoData(true);

        if (showFeedback || !warningShownRef.current) {
          warningShownRef.current = true;
          push({
            type: 'info',
            title: 'Belum Ada Data Alat',
            message: 'Dashboard menampilkan data demo sampai alat mengirim data ke Database.',
            duration: 6000,
          });
        }
        return;
      }

      warningShownRef.current = false;
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
      if (showFeedback) {
        push({
          type: 'error',
          title: 'Gagal Memuat Sensor',
          message: 'Periksa koneksi Database atau endpoint alat.',
          duration: 6000,
        });
      }
    } finally {
      setLoading(false);
      setNextUpdateIn(systemType === 'panel' ? PANEL_REFRESH_INTERVAL : PORTABLE_REFRESH_INTERVAL);
    }
  }, [user, systemType, landId, push]);

  useEffect(() => {
    refreshSensorData(false);
  }, [refreshSensorData]);

  // FIX & UPDATE: Supabase Realtime Listener yang sudah distabilkan
  useEffect(() => {
    if (!user) return;

    console.log(`Mengaktifkan Realtime listener untuk Lahan: ${landId}, Mode: ${systemType}`);

    const channel = supabase
      .channel(`sensor-readings-realtime-${systemType}-${landId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings',
          // Perbaikan: Gunakan filter land_id karena berupa string pendek/enum yang didukung penuh oleh Realtime Supabase
          filter: `land_id=eq.${landId}` 
        },
        (payload) => {
          const newReading = payload.new as SensorReading;
          
          // Validasi keamanan lapis kedua di sisi JavaScript (Memastikan user_id dan system_type cocok)
          if (
            newReading.system_type === systemType && 
            newReading.land_id === landId && 
            (!newReading.user_id || newReading.user_id === user.id)
          ) {
            console.log("Sukses! Data sensor masuk dari lapangan secara live:", newReading);
            setSensorData(newReading);
            setLastUpdated(toDate(newReading.created_at));
            setIsDemoData(false);

            // Jalankan deteksi nilai kritis
            checkCritical(newReading).forEach(msg =>
              push({ type: 'error', title: 'Nilai Sensor Kritis!', message: msg, duration: 8000 })
            );

            // Trigger alert pemberitahuan data live masuk
            push({
              type: 'success',
              title: 'Data Alat Diterima!',
              message: 'Kondisi lahan bawang merah diperbarui secara live dari alat.',
              duration: 4000
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[REALTIME] Berhasil terkoneksi ke tabel sensor_readings untuk lahan: ${landId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[REALTIME] Gagal subscribe. Pastikan Replication Realtime di dashboard Supabase sudah diaktifkan.');
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
} 0.05 + Math.random() * 1.2 * variance).toFixed(2)),
    conductivity: parseFloat((0.6 + offset * 0.05 + Math.random() * 1.8 * variance).toFixed(3)),
    created_at: new Date().toISOString(),
  };
}

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

async function fetchLatestReading(
  userId: string,
  systemType: SystemType,
  landId: LandId,
): Promise<SensorReading | null> {
  const { data, error } = await supabase
    .from('sensor_readings')
    .select('*')
    .eq('user_id', userId)
    .eq('system_type', systemType)
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
  const [sensorData, setSensorData] = useState<SensorReading>(() => generateDemoSensorData(systemType, landId));
  const [nextUpdateIn, setNextUpdateIn] = useState(systemType === 'panel' ? PANEL_REFRESH_INTERVAL : PORTABLE_REFRESH_INTERVAL);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [isDemoData, setIsDemoData] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningShownRef = useRef(false);

  const refreshSensorData = useCallback(async (showFeedback = false) => {
    if (!user) {
      const demo = generateDemoSensorData(systemType, landId);
      setSensorData(demo);
      setLastUpdated(toDate(demo.created_at));
      setIsDemoData(true);
      return;
    }

    setLoading(true);
    try {
      const latest = await fetchLatestReading(user.id, systemType, landId);

      if (!latest) {
        const demo = generateDemoSensorData(systemType, landId);
        setSensorData(demo);
        setLastUpdated(toDate(demo.created_at));
        setIsDemoData(true);

        if (showFeedback || !warningShownRef.current) {
          warningShownRef.current = true;
          push({
            type: 'info',
            title: 'Belum Ada Data Alat',
            message: 'Dashboard menampilkan data demo sampai alat mengirim data ke Database.',
            duration: 6000,
          });
        }
        return;
      }

      warningShownRef.current = false;
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
      if (showFeedback) {
        push({
          type: 'error',
          title: 'Gagal Memuat Sensor',
          message: 'Periksa koneksi Database atau endpoint alat.',
          duration: 6000,
        });
      }
    } finally {
      setLoading(false);
      setNextUpdateIn(systemType === 'panel' ? PANEL_REFRESH_INTERVAL : PORTABLE_REFRESH_INTERVAL);
    }
  }, [user, systemType, landId, push]);

  useEffect(() => {
    refreshSensorData(false);
  }, [refreshSensorData]);

  // Supabase Realtime listener untuk update live otomatis dari ESP32
  useEffect(() => {
    if (!user) return;

    console.log(`Mengaktifkan Realtime listener untuk Lahan: ${landId}, Mode: ${systemType}`);

    const channel = supabase
      .channel(`sensor-readings-realtime-${systemType}-${landId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newReading = payload.new as SensorReading;
          
          // Validasi apakah data baru cocok dengan mode dan lahan yang sedang dibuka di UI
          if (newReading.system_type === systemType && newReading.land_id === landId) {
            console.log("Update sensor real-time diterima secara live!", newReading);
            setSensorData(newReading);
            setLastUpdated(toDate(newReading.created_at));
            setIsDemoData(false);

            // Periksa jika ada nilai sensor kritis untuk memunculkan peringatan
            checkCritical(newReading).forEach(msg =>
              push({ type: 'error', title: 'Nilai Sensor Kritis!', message: msg, duration: 8000 })
            );

            // Munculkan notifikasi sukses data baru masuk
            push({
              type: 'success',
              title: 'Data Alat Diterima!',
              message: 'Kondisi lahan bawang merah diperbarui secara live dari alat.',
              duration: 4000
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed ke realtime channel sensor_readings untuk lahan ${landId}`);
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

