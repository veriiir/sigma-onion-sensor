import { useState, useCallback } from 'react';
import { AIDetection, SystemType, LandId } from '../types';
import { DISEASES, DUMMY_IMAGE_URL } from '../constants/sensors';

function generateDetection(systemType: SystemType, landId: LandId): AIDetection {
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

export function useAIDetection(systemType: SystemType, landId: LandId) {
  const [detection, setDetection] = useState<AIDetection | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);

  const runDetection = useCallback(async () => {
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 2000));
    const result = generateDetection(systemType, landId);
    setDetection(result);
    setLastAnalyzed(new Date());
    setAnalyzing(false);
  }, [systemType, landId]);

  return { detection, analyzing, lastAnalyzed, runDetection };
}
