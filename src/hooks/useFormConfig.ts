import { useState, useEffect } from 'react';
import { fetchFormConfig, FormConfig } from '../services/slopbop';

// The application form config is static for a session — fetch once, cache at
// module scope, dedupe concurrent callers. Mirrors useWorldItems, but exposes
// an `error` value so the form can render an inline load-failure state.
let cachedConfig: FormConfig | null = null;
let inflight: Promise<FormConfig> | null = null;

export function useFormConfig() {
  const [config, setConfig] = useState<FormConfig | null>(cachedConfig);
  const [loading, setLoading] = useState(!cachedConfig);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedConfig) return;
    if (!inflight) inflight = fetchFormConfig();
    let cancelled = false;
    inflight
      .then(result => {
        cachedConfig = result;
        if (!cancelled) setConfig(result);
      })
      .catch(() => {
        inflight = null; // allow a retry on remount
        if (!cancelled) setError('Failed to load form');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { config, loading, error };
}
