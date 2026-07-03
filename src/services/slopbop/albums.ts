import { apiFetch } from './client';
import { Song } from './songs';

export type CollectionType = 'Album' | 'EP';

export interface Collection {
  _id: string;
  artist_id: string;
  collection_type: CollectionType;
  title?: string;
  cover_url?: string;
  created_at?: string;
}

interface CollectionsResponse {
  success: boolean;
  collections: Collection[];
}

interface CollectionResponse {
  success: boolean;
  collection: Collection;
  songs: Song[];
}

export const fetchCollections = (artistId: string, type?: CollectionType) => {
  const params = new URLSearchParams({ artist_id: artistId });
  if (type) params.set('type', type);
  return apiFetch<CollectionsResponse>(`/slopbop/collections?${params}`).then(r => r.collections);
};

export const fetchCollection = (id: string) =>
  apiFetch<CollectionResponse>(`/slopbop/collections/${id}`).then(r => ({
    collection: r.collection,
    songs: r.songs,
  }));
