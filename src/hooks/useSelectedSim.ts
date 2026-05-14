import { useResource } from './useResource';
import { fetchSimAt, isSimLive } from '../services/slopbop';
import { useToast } from '../context/ToastContext';
import { useTimeline } from '../context/TimelineContext';

const POLL_MS = 2 * 60 * 1000;

export function useSelectedSim() {
  const { showToast } = useToast();
  const { mode, at } = useTimeline();

  // Live mode uses a stable key + interval polling so the 1s clock tick doesn't
  // cause refetches; the fetcher reads `new Date()` at call time. Scrubbed mode
  // keys on `at` so each new scrub position triggers a fetch.
  const key = mode === 'live' ? 'sim-live' : `sim-scrub-${at.toISOString()}`;

  const { data: sim, loading, refetch } = useResource(
    () => fetchSimAt(mode === 'live' ? new Date() : at),
    key,
    {
      onError: () => showToast('Failed to load simulation'),
      pollMs: data => {
        if (mode !== 'live') return undefined;
        return !data || isSimLive(data) ? POLL_MS : undefined;
      },
    },
  );
  return { sim, loading, refetch };
}
