import { useResource } from './useResource';
import { fetchAlbum, Song } from '../services/slopbop';
import { useToast } from '../context/ToastContext';

export function useAlbum(id: string) {
  const { showToast } = useToast();
  const { data, loading, refetch } = useResource(
    () => fetchAlbum(id),
    id ? `album-${id}` : '',
    { onError: () => showToast('Failed to load album') },
  );
  return {
    album: data?.album ?? null,
    songs: (data?.songs ?? []) as Song[],
    requestStatus: data?.requestStatus ?? null,
    loading,
    refetch,
  };
}
