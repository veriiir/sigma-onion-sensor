import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Land, LandValidationResult, SystemType } from '../types';

const DEFAULT_LANDS: Omit<Land, 'user_id' | 'created_at'>[] = [
  { id: 'lahan1', label: 'Lahan 1', crop: 'Bawang Merah', system_type: 'panel', radius_m: 500 },
  { id: 'lahan2', label: 'Lahan 2', crop: 'Bawang Merah', system_type: 'panel', radius_m: 500 },
  { id: 'lahan3', label: 'Lahan 3', crop: 'Bawang Merah', system_type: 'panel', radius_m: 500 },
  { id: 'lahan1', label: 'Lahan 1', crop: 'Bawang Merah', system_type: 'portable', radius_m: 500 },
  { id: 'lahan2', label: 'Lahan 2', crop: 'Bawang Merah', system_type: 'portable', radius_m: 500 },
  { id: 'lahan3', label: 'Lahan 3', crop: 'Bawang Merah', system_type: 'portable', radius_m: 500 },
];

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function validateLandCoords(
  lat: number,
  lon: number,
  lands: Land[],
): LandValidationResult {
  const landsWithCoords = lands.filter(l => l.latitude != null && l.longitude != null);

  if (landsWithCoords.length === 0) {
    return { matched: false, land: null, distanceM: null, withinRadius: false };
  }

  let closest: Land | null = null;
  let minDist = Infinity;

  for (const land of landsWithCoords) {
    const dist = haversineM(lat, lon, land.latitude!, land.longitude!);
    if (dist < minDist) {
      minDist = dist;
      closest = land;
    }
  }

  const radius = closest?.radius_m ?? 500;
  return {
    matched: minDist <= radius,
    land: closest,
    distanceM: Math.round(minDist),
    withinRadius: minDist <= radius,
  };
}

export function useLands(systemType?: SystemType) {
  const { user } = useAuth();
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLands = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    let q = supabase.from('lands').select('*').eq('user_id', user.id);
    if (systemType) q = q.eq('system_type', systemType);
    const { data } = await q.order('id');

    if (data && data.length > 0) {
      setLands(data);
    } else {
      // Seed default lands for new users
      const toInsert = DEFAULT_LANDS
        .filter(l => !systemType || l.system_type === systemType)
        .map(l => ({ ...l, user_id: user.id }));

      const { data: inserted } = await supabase
        .from('lands')
        .upsert(toInsert, { onConflict: 'id,user_id' })
        .select();
      setLands(inserted ?? []);
    }
    setLoading(false);
  }, [user, systemType]);

  useEffect(() => { fetchLands(); }, [fetchLands]);

  return { lands, loading, refetch: fetchLands };
}
