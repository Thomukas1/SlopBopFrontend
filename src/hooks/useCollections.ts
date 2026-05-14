import { useResource } from './useResource';
import { fetchCollections, Collection, CollectionType } from '../services/slopbop';

export function useCollections(artistId: string, type?: CollectionType) {
  const { data, loading } = useResource(
    () => fetchCollections(artistId, type),
    artistId ? `collections-${artistId}-${type ?? 'all'}` : '',
    { onError: () => {} },
  );
  const collections: Collection[] = data ?? [];
  return { collections, loading };
}
