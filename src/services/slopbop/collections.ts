import { apiFetch } from './client';
import { Song } from './songs';
import type { RequestClosedReason } from './requests';

// How a collection resolves its songs and which extra fields it carries. Both
// `album` and `mixtape` resolve their songs by collection_id back-reference and
// carry the same shape; the union is the seam for future kinds (e.g. a
// `playlist` that resolves an explicit song_id list instead).
export type CollectionType = 'album' | 'mixtape';

// The generic container for an artist's songs. `type` discriminates the kind.
export interface Collection {
  _id: string;
  artist_id: string;
  type: CollectionType;
  title?: string;
  song_count?: number;
  cover_url?: string;
  created_at?: string;
  // Submission-window fields, authored on album-type collections only. Prefer
  // reading the evaluated `RequestStatus` off collection detail; these are the
  // raw source.
  submission_start?: string;    // ISO or absent
  submission_deadline?: string; // ISO or absent
  submission_count?: number;    // seeds submitted so far
  max_tracks?: number;
}

// Whether an album-type collection is currently accepting song submissions,
// evaluated server-side on collection detail read. `open` gates the submission
// form; when closed, `reason` says why. The window runs from `submission_start`
// to `submission_deadline` (either may be null). `track_count` is the count of
// submissions received (the capacity gauge is track_count / max_tracks).
export interface RequestStatus {
  open: boolean;
  reason: RequestClosedReason | null;
  track_count: number;
  max_tracks: number;
  submission_start: string | null;
  submission_deadline: string | null;
}

interface CollectionsResponse {
  success: boolean;
  collections: Collection[];
}

interface CollectionResponse {
  success: boolean;
  collection: Collection;
  songs: Song[];
  // Present only for album-type collections; other types omit it.
  request_status?: RequestStatus;
}

// List an artist's collections, optionally filtered by kind (e.g. `'album'`).
export const fetchCollections = (artistId: string, type?: CollectionType) => {
  const params = new URLSearchParams({ artist_id: artistId });
  if (type) params.set('type', type);
  return apiFetch<CollectionsResponse>(`/slopbop/collections?${params}`).then(r => r.collections);
};

export const fetchCollection = (id: string) =>
  apiFetch<CollectionResponse>(`/slopbop/collections/${id}`).then(r => ({
    collection: r.collection,
    songs: r.songs,
    requestStatus: r.request_status ?? null,
  }));
