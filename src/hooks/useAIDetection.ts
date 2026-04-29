import { useState, useCallback, useRef } from 'react';
import { AIDetection, EnrichedDetection, SensorReading, SystemType, LandId, Land } from '../types';
import { DISEASES, DUMMY_IMAGE_URL } from '../constants/sensors';
import { runAIPipeline } from '../lib/aiPipeline';
import { supabase } from '../lib/supabase';

const LS_KEY = (st: SystemType, lid: LandId) => `sigma_analysis_${st}_${lid}`;

function generateRawDetection(systemType: SystemType, landId: LandId): AIDetection {
  const disease = DISEASES[Math.floor(Math.random() * DISEASES.length)];
  return {
    system_type: systemType,
    land_id: landId,
    image_url: DUMMY_IMAGE_URL,
    label: disease.label,
    confidence: parseFloat((disease.confidence + (Math.random() * 4 - 2)).toFixed(1)),
    bbox_x: parseFloat((0.15 + Math.random() * 0.3).toFixed(3)),
    bbox_y: parseFloat((0.1 + Math.random() * 0.3).toFixed(3)),
    bbox_width: parseFloat((0.28 + Math.random() * 0.22).toFixed(3)),
    bbox_height: parseFloat((0.22 + Math.random() * 0.22).toFixed(3)),
  };
}

async function fetchLatestSensor(
  userId: string,
  systemType: SystemType,
  landId: LandId,
): Promise<SensorReading | null> {
  const { data } = await supabase
    .from('sensor_readings')
    .select('*')
    .eq('user_id', userId)
    .eq('system_type', systemType)
    .eq('land_id', landId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

function loadFromStorage(st: SystemType, lid: LandId): EnrichedDetection | null {
  try {
    const raw = localStorage.getItem(LS_KEY(st, lid));
    return raw ? (JSON.parse(raw) as EnrichedDetection) : null;
  } catch {
    return null;
  }
}

function saveToStorage(st: SystemType, lid: LandId, detection: EnrichedDetection) {
  try {
    localStorage.setItem(LS_KEY(st, lid), JSON.stringify(detection));
  } catch { /* storage full */ }
}

export interface RunDetectionOptions {
  imageElement?: HTMLImageElement | null;
  photoTimestamp?: Date | null;
  photoCoords?: { latitude: number; longitude: number } | null;
  land?: Land | null;
}

export function useAIDetection(systemType: SystemType, landId: LandId, userId: string | null) {
  const [detection, setDetection] = useState<EnrichedDetection | null>(
    () => loadFromStorage(systemType, landId),
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);

  // Keep a mutable ref so the callback always sees the latest params
  const paramsRef = useRef({ userId, systemType, landId });
  paramsRef.current = { userId, systemType, landId };

  const runDetection = useCallback(async (opts: RunDetectionOptions = {}) => {
    const { userId: uid, systemType: st, landId: lid } = paramsRef.current;
    setAnalyzing(true);

    // Simulate inference (swap this for real Roboflow edge-function call)
    await new Promise(r => setTimeout(r, 2000));
    const raw = generateRawDetection(st, lid);

    const sensor = uid ? await fetchLatestSensor(uid, st, lid) : null;

    const pipeline = await runAIPipeline({
      detection: raw,
      sensor,
      imageElement: opts.imageElement ?? null,
      photoTimestamp: opts.photoTimestamp ?? null,
      photoCoords: opts.photoCoords ?? null,
      land: opts.land ?? null,
    });

    const enriched: EnrichedDetection = {
      ...raw,
      // Apply label override from Lapis 2 if present
      label: pipeline.overriddenLabel ?? raw.label,
      pipeline,
    };

    setDetection(enriched);
    setLastAnalyzed(new Date());
    setAnalyzing(false);
    saveToStorage(st, lid, enriched);

    return enriched;
  }, []);

  return { detection, analyzing, lastAnalyzed, runDetection };
}
