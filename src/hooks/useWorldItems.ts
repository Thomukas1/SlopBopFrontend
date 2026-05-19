import { useState, useEffect } from 'react';
import { fetchWorldItems, ItemCatalogue } from '../services/slopbop';
import { useToast } from '../context/ToastContext';

// The item catalogue is static for a session — fetch once, cache at module
// scope, dedupe concurrent callers. Mirrors useWorldMap.
let cachedItems: ItemCatalogue | null = null;
let inflight: Promise<ItemCatalogue> | null = null;

export function useWorldItems() {
  const { showToast } = useToast();
  const [items, setItems] = useState<ItemCatalogue | null>(cachedItems);
  const [loading, setLoading] = useState(!cachedItems);

  useEffect(() => {
    if (cachedItems) return;
    if (!inflight) inflight = fetchWorldItems();
    inflight
      .then(result => {
        cachedItems = result;
        setItems(result);
      })
      .catch(() => showToast('Failed to load items'))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading };
}
