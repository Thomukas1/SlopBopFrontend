import { useResource } from './useResource';
import { fetchSimCurrent, isSimLive } from '../services/slopbop';
import { useToast } from '../context/ToastContext';

const POLL_MS = 2 * 60 * 1000;

export function useSimCurrent() {
  const { showToast } = useToast();
  const { data: sim, loading, refetch } = useResource(
    () => fetchSimCurrent(),
    'sim-current',
    {
      onError: () => showToast('Failed to load simulation'),
      // Poll while live or while we don't have a sim yet; stop once a past sim is loaded.
      pollMs: data => (!data || isSimLive(data) ? POLL_MS : undefined),
    },
  );
  return { sim, loading, refetch };
}
