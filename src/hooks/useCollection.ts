import { useResource } from './useResource';
import { fetchCollection, Song } from '../services/slopbop';
import { useToast } from '../context/ToastContext';

export function useCollection(id: string) {
  const { showToast } = useToast();
  const { data, loading, refetch } = useResource(
    () => fetchCollection(id),
    id ? `collection-${id}` : '',
    { onError: () => showToast('Failed to load collection') },
  );
  return {
    collection: data?.collection ?? null,
    songs: (data?.songs ?? []) as Song[],
    loading,
    refetch,
  };
}
