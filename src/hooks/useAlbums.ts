import { useResource } from './useResource';
import { fetchAlbums, Album } from '../services/slopbop';

export function useAlbums(artistId: string) {
  const { data, loading } = useResource(
    () => fetchAlbums(artistId),
    artistId ? `albums-${artistId}` : '',
    { onError: () => {} },
  );
  const albums: Album[] = data ?? [];
  return { albums, loading };
}
