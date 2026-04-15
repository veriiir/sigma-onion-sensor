import { useState, useEffect, useCallback, useRef } from 'react';
import { AIDetection, SystemType } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DISEASES, DUMMY_IMAGE_URL } from '../constants/sensors';

const SYNC_INTERVAL = 10 * 60 * 1000;

function generateDetection(systemType: SystemType): Omit<AIDetection, 'id' | 'user_id' | 'created_at'> {
  const disease = DISEASES[Math.floor(Math.random() * DISEASES.length)];
  const baseX = 0.15 + Math.random() * 0.3;
  const baseY = 0.1 + Math.random() * 0.3;
  return {
    system_type: systemType,
    image_url: DUMMY_IMAGE_URL,
    label: disease.label,
    confidence: parseFloat((disease.confidence + (Math.random() * 4 - 2)).toFixed(1)),
    bbox_x: parseFloat(baseX.toFixed(3)),
    bbox_y: parseFloat(baseY.toFixed(3)),
    bbox_width: parseFloat((0.3 + Math.random() * 0.25).toFixed(3)),
    bbox_height: parseFloat((0.25 + Math.random() * 0.25).toFixed(3)),
  };
}

export function useAIDetection(systemType: SystemType) {
  const { user } = useAuth();
  const [detection, setDetection] = useState<AIDetection | null>(null);
  const [nextUpdateIn, setNextUpdateIn] = useState(SYNC_INTERVAL);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [analyzing, setAnalyzing] = useState(false);
  const syncRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(SYNC_INTERVAL);

  const runDetection = useCallback(async () => {
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 1800));

    const newDetection = generateDetection(systemType);
    setDetection(newDetection);
    setLastUpdated(new Date());
    remainingRef.current = SYNC_INTERVAL;
    setNextUpdateIn(SYNC_INTERVAL);
    setAnalyzing(false);

    if (user) {
      await supabase.from('ai_detections').insert({
        ...newDetection,
        user_id: user.id,
      });
    }
  }, [systemType, user]);

  useEffect(() => {
    runDetection();
    syncRef.current = setInterval(runDetection, SYNC_INTERVAL);
    countdownRef.current = setInterval(() => {
      remainingRef.current -= 1000;
      if (remainingRef.current <= 0) remainingRef.current = SYNC_INTERVAL;
      setNextUpdateIn(remainingRef.current);
    }, 1000);

    return () => {
      if (syncRef.current) clearInterval(syncRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [systemType]);

  return { detection, nextUpdateIn, lastUpdated, analyzing, runDetection };
}
