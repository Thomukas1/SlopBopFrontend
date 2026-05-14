import { apiFetch } from './client';
import { Song } from './songs';

export type CollectionType = 'Album' | 'EP';

export interface Collection {
  _id: string;
  artistId: string;
  collectionType: CollectionType;
  title?: string;
  coverUrl?: string;
  isRecording?: boolean;
  createdAt?: string;
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

interface RecordingModePayload {
  collectionId: string;
  isRecording: boolean;
  walletAddress: string;
  challengeId: string;
  message: string;
  signature: string;
}

interface RecordingModeResponse {
  success: boolean;
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

export const setRecordingMode = (payload: RecordingModePayload) =>
  apiFetch<RecordingModeResponse>('/slopbop/collections/recording-mode', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
