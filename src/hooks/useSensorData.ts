import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorReading, SystemType, LandId } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const SYNC_INTERVAL = 6 * 60 * 60 * 1000;
const SIGNIFICANT_THRESHOLD = 0.1;

function generateSensorData(systemType: SystemType, landId: LandId): Omit<SensorReading, 'id' | 'user_id' | 'created_at'> {
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

function isSignificantChange(prev: SensorReading, next: SensorReading): boolean {
  const keys: Array<keyof SensorReading> = ['moisture', 'nitrogen', 'phosphorus', 'potassium', 'temperature', 'ph', 'conductivity'];
  return keys.some(k => {
    const pv = prev[k] as number;
    const nv = next[k] as number;
    if (!pv) return !!nv;
    return Math.abs(nv - pv) / Math.abs(pv) >= SIGNIFICANT_THRESHOLD;
  });
}

async function fetchTodayRecord(userId: string, systemType: SystemType, landId: LandId): Promise<SensorReading | null> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { data } = await supabase
    .from('sensor_readings')
    .select('*')
    .eq('user_id', userId)
    .eq('system_type', systemType)
    .eq('land_id', landId)
    .gte('created_at', todayStart.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

async function fetchSyncState(userId: string, systemType: SystemType, landId: LandId): Promise<Date | null> {
  const { data } = await supabase
    .from('sync_state')
    .select('last_synced_at')
    .eq('user_id', userId)
    .eq('system_type', systemType)
    .eq('land_id', landId)
    .maybeSingle();
  return data ? new Date(data.last_synced_at) : null;
}

async function saveSyncState(userId: string, systemType: SystemType, landId: LandId) {
  await supabase
    .from('sync_state')
    .upsert(
      { user_id: userId, system_type: systemType, land_id: landId, last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { onConflict: 'user_id,system_type,land_id' }
    );
}

export function useSensorData(systemType: SystemType, landId: LandId) {
  const { user } = useAuth();
  const { push } = useNotification();
  const [sensorData, setSensorData] = useState<SensorReading>(() => generateSensorData(systemType, landId) as SensorReading);
  const [nextUpdateIn, setNextUpdateIn] = useState(SYNC_INTERVAL);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(SYNC_INTERVAL);
  const initializedRef = useRef(false);

  const fetchAndSave = useCallback(async (forceInsert = false) => {
    const newData = generateSensorData(systemType, landId);
    setSensorData(newData as SensorReading);
    setLastUpdated(new Date());
    remainingRef.current = SYNC_INTERVAL;
    setNextUpdateIn(SYNC_INTERVAL);

    checkCritical(newData as SensorReading).forEach(msg =>
      push({ type: 'error', title: 'Nilai Sensor Kritis!', message: msg, duration: 8000 })
    );

    if (user) {
      await saveSyncState(user.id, systemType, landId);
      const existing = await fetchTodayRecord(user.id, systemType, landId);
      if (forceInsert || !existing || isSignificantChange(existing as SensorReading, newData as SensorReading)) {
        await supabase.from('sensor_readings').insert({ ...newData, user_id: user.id });
        push({ type: 'success', title: 'Data Tersimpan', message: 'Pembacaan sensor berhasil disimpan ke cloud.' });
      }
    }
  }, [systemType, landId, user, push]);

  useEffect(() => {
    if (!user || initializedRef.current) return;
    initializedRef.current = true;

    fetchSyncState(user.id, systemType, landId).then(lastSynced => {
      let remaining: number;

      if (lastSynced) {
        const elapsed = Date.now() - lastSynced.getTime();
        remaining = Math.max(0, SYNC_INTERVAL - elapsed);
      } else {
        remaining = 0;
      }

      remainingRef.current = remaining > 0 ? remaining : SYNC_INTERVAL;
      setNextUpdateIn(remainingRef.current);

      if (remaining <= 0) {
        fetchTodayRecord(user.id, systemType, landId).then(existing => {
          fetchAndSave(!existing);
        });
      }

      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      function scheduleCycle(delay: number) {
        syncTimerRef.current = setTimeout(async () => {
          await fetchAndSave();
          scheduleCycle(SYNC_INTERVAL);
        }, delay);
      }
      scheduleCycle(remaining > 0 ? remaining : SYNC_INTERVAL);

      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        remainingRef.current = Math.max(0, remainingRef.current - 1000);
        setNextUpdateIn(remainingRef.current);
      }, 1000);
    });

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [user, systemType, landId]);

  return { sensorData, nextUpdateIn, lastUpdated };
}
