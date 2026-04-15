import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorReading, SystemType, LandId } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const SYNC_INTERVAL = 6 * 60 * 60 * 1000;
const SIGNIFICANT_THRESHOLD = 0.1;

function storageKey(systemType: SystemType, landId: LandId) {
  return `sigma_last_update_${systemType}_${landId}`;
}

function getRemaining(systemType: SystemType, landId: LandId): number {
  const raw = localStorage.getItem(storageKey(systemType, landId));
  if (!raw) return 0;
  const lastTs = parseInt(raw, 10);
  if (isNaN(lastTs)) return 0;
  const remaining = SYNC_INTERVAL - (Date.now() - lastTs);
  return remaining > 0 ? remaining : 0;
}

function saveTimestamp(systemType: SystemType, landId: LandId) {
  localStorage.setItem(storageKey(systemType, landId), String(Date.now()));
}

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

export function useSensorData(systemType: SystemType, landId: LandId) {
  const { user } = useAuth();
  const { push } = useNotification();
  const [sensorData, setSensorData] = useState<SensorReading>(() => generateSensorData(systemType, landId));
  const [nextUpdateIn, setNextUpdateIn] = useState(() => {
    const r = getRemaining(systemType, landId);
    return r > 0 ? r : SYNC_INTERVAL;
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(SYNC_INTERVAL);

  const fetchAndSave = useCallback(async () => {
    const newData = generateSensorData(systemType, landId);
    setSensorData(newData);
    setLastUpdated(new Date());
    saveTimestamp(systemType, landId);
    remainingRef.current = SYNC_INTERVAL;
    setNextUpdateIn(SYNC_INTERVAL);

    checkCritical(newData).forEach(msg =>
      push({ type: 'error', title: 'Nilai Sensor Kritis!', message: msg, duration: 8000 })
    );

    if (user) {
      const existing = await fetchTodayRecord(user.id, systemType, landId);
      if (!existing || isSignificantChange(existing as SensorReading, newData)) {
        await supabase.from('sensor_readings').insert({ ...newData, user_id: user.id });
        push({ type: 'success', title: 'Data Tersimpan', message: 'Pembacaan sensor berhasil disimpan ke cloud.' });
      }
    }
  }, [systemType, landId, user, push]);

  useEffect(() => {
    const remaining = getRemaining(systemType, landId);
    remainingRef.current = remaining > 0 ? remaining : SYNC_INTERVAL;
    setNextUpdateIn(remainingRef.current);

    if (remaining <= 0) fetchAndSave();

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

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [systemType, landId]);

  return { sensorData, nextUpdateIn, lastUpdated };
}
