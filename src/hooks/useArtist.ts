import { useResource } from './useResource';
import { fetchArtist } from '../services/slopbop';
import { useToast } from '../context/ToastContext';

export function useArtist(id: string) {
  const { showToast } = useToast();
  const { data: artist, loading } = useResource(
    () => fetchArtist(id),
    id ? `artist-${id}` : '',
    { onError: () => showToast('Failed to load artist') },
  );
  return { artist, loading };
}
