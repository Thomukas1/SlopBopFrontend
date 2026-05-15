import { useEffect } from 'react';
import { useResource } from './useResource';
import { fetchSimCurrent, fetchSimAt, isSimLive } from '../services/slopbop';
import { useToast } from '../context/ToastContext';
import { useTimeline } from '../context/TimelineContext';

const POLL_MS = 2 * 60 * 1000;

export function useSelectedSim() {
  const { showToast } = useToast();
  const { mode, at, setEnvironment } = useTimeline();

  // Live mode hits /sim/current — needs no `at`, and is the call that delivers
  // the environment (timezone/city). Scrubbed mode keys on `at` so each new
  // scrub position triggers a fetch with the naive sim-local timestamp.
  const key = mode === 'live' ? 'sim-live' : `sim-scrub-${at}`;

  const { data: sim, loading, refetch } = useResource(
    () => (mode === 'live' ? fetchSimCurrent() : fetchSimAt(at)),
    key,
    {
      onError: () => showToast('Failed to load simulation'),
      pollMs: data => {
        if (mode !== 'live') return undefined;
        return !data || isSimLive(data) ? POLL_MS : undefined;
      },
    },
  );

  // Capture the sim's clock once it lands; the context treats it as static.
  useEffect(() => {
    if (sim?.environment) setEnvironment(sim.environment);
  }, [sim?.environment, setEnvironment]);

  return { sim, loading, refetch };
}
