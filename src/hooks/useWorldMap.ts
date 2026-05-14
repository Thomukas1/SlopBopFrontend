import { useState, useEffect } from 'react';
import { fetchWorldMap, WorldMap } from '../services/slopbop';
import { useToast } from '../context/ToastContext';

let cachedMap: WorldMap | null = null;
let inflight: Promise<WorldMap> | null = null;

export function useWorldMap() {
  const { showToast } = useToast();
  const [map, setMap] = useState<WorldMap | null>(cachedMap);
  const [loading, setLoading] = useState(!cachedMap);

  useEffect(() => {
    if (cachedMap) return;
    if (!inflight) inflight = fetchWorldMap();
    inflight
      .then(result => {
        cachedMap = result;
        setMap(result);
      })
      .catch(() => showToast('Failed to load world map'))
      .finally(() => setLoading(false));
  }, []);

  return { map, loading };
}
