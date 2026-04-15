import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorReading, SystemType } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const SYNC_INTERVAL = 10 * 60 * 1000;

function generateSensorData(systemType: SystemType): Omit<SensorReading, 'id' | 'user_id' | 'created_at'> {
  const variance = systemType === 'portable' ? 1 : 0.5;
  return {
    system_type: systemType,
    moisture: parseFloat((35 + Math.random() * 40 * variance + 15).toFixed(1)),
    nitrogen: parseFloat((15 + Math.random() * 35 * variance + 10).toFixed(1)),
    phosphorus: parseFloat((8 + Math.random() * 20 * variance + 5).toFixed(1)),
    potassium: parseFloat((60 + Math.random() * 120 * variance + 40).toFixed(1)),
    temperature: parseFloat((22 + Math.random() * 10 * variance + 2).toFixed(1)),
    ph: parseFloat((5.5 + Math.random() * 1.5 * variance + 0.3).toFixed(2)),
    conductivity: parseFloat((0.4 + Math.random() * 2.0 * variance + 0.3).toFixed(3)),
  };
}

export function useSensorData(systemType: SystemType) {
  const { user } = useAuth();
  const [sensorData, setSensorData] = useState<SensorReading>(generateSensorData(systemType));
  const [nextUpdateIn, setNextUpdateIn] = useState(SYNC_INTERVAL);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(SYNC_INTERVAL);

  const fetchAndSave = useCallback(async () => {
    const newData = generateSensorData(systemType);
    setSensorData(newData);
    setLastUpdated(new Date());
    setIsLive(true);
    remainingRef.current = SYNC_INTERVAL;
    setNextUpdateIn(SYNC_INTERVAL);

    if (user) {
      await supabase.from('sensor_readings').insert({
        ...newData,
        user_id: user.id,
      });
    }
  }, [systemType, user]);

  useEffect(() => {
    fetchAndSave();

    syncTimerRef.current = setInterval(fetchAndSave, SYNC_INTERVAL);
    countdownRef.current = setInterval(() => {
      remainingRef.current -= 1000;
      if (remainingRef.current <= 0) remainingRef.current = SYNC_INTERVAL;
      setNextUpdateIn(remainingRef.current);
    }, 1000);

    return () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [systemType]);

  return { sensorData, nextUpdateIn, lastUpdated, isLive };
}
