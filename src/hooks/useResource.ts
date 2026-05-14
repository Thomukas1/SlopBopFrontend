import { useState, useEffect, useRef, useCallback } from 'react';

interface UseResourceOptions<T> {
  onError?: (err: unknown) => void;
  // Fixed-interval polling, or a function of the latest data (useful when "should I keep
  // polling?" depends on what was just loaded — e.g. stop once a past sim is in hand).
  // Future: align to sim's 10-min tick boundary (refetch ~15s after wallclock crosses
  // :00/:10/:20…) to match content cadence.
  pollMs?: number | ((data: T | null) => number | undefined);
}

export function useResource<T>(
  fetcher: () => Promise<T>,
  key: string,
  options: UseResourceOptions<T> = {},
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchKeyRef = useRef('');
  const fetcherRef = useRef(fetcher);
  const onErrorRef = useRef(options.onError);

  fetcherRef.current = fetcher;
  onErrorRef.current = options.onError;

  const refetch = useCallback(() => {
    if (!key) return;
    fetchKeyRef.current = key;
    setLoading(true);
    fetcherRef.current()
      .then(result => {
        if (fetchKeyRef.current !== key) return;
        setData(result);
      })
      .catch(err => onErrorRef.current?.(err))
      .finally(() => {
        if (fetchKeyRef.current === key) setLoading(false);
      });
  }, [key]);

  useEffect(() => {
    if (!key) return;
    refetch();
  }, [refetch, key]);

  const effectivePollMs = typeof options.pollMs === 'function'
    ? options.pollMs(data)
    : options.pollMs;

  useEffect(() => {
    if (!key || !effectivePollMs) return;
    const id = setInterval(refetch, effectivePollMs);
    return () => clearInterval(id);
  }, [key, effectivePollMs, refetch]);

  return { data, loading, refetch };
}
