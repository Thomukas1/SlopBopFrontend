import { apiFetch } from './client';
import { Song } from './songs';
import type { RequestClosedReason } from './requests';

export interface Album {
  _id: string;
  artist_id: string;
  title?: string;
  song_count?: number;
  cover_url?: string;
  created_at?: string;
  // Submission-window fields (authored on the album doc). Prefer reading the
  // evaluated `RequestStatus` off album detail; these are the raw source.
  submission_start?: string;    // ISO or absent
  submission_deadline?: string; // ISO or absent
  submission_count?: number;    // seeds submitted so far
  max_tracks?: number;
}

// Whether the album is currently accepting song submissions, evaluated
// server-side on album detail read. `open` gates the submission form; when
// closed, `reason` says why. The window runs from `submission_start` to
// `submission_deadline` (either may be null). `track_count` is the count of
// submissions received (the capacity gauge is track_count / max_tracks).
export interface RequestStatus {
  open: boolean;
  reason: RequestClosedReason | null;
  track_count: number;
  max_tracks: number;
  submission_start: string | null;
  submission_deadline: string | null;
}

interface AlbumsResponse {
  success: boolean;
  albums: Album[];
}

interface AlbumResponse {
  success: boolean;
  album: Album;
  songs: Song[];
  request_status: RequestStatus;
}

export const fetchAlbums = (artistId: string) => {
  const params = new URLSearchParams({ artist_id: artistId });
  return apiFetch<AlbumsResponse>(`/slopbop/albums?${params}`).then(r => r.albums);
};

export const fetchAlbum = (id: string) =>
  apiFetch<AlbumResponse>(`/slopbop/albums/${id}`).then(r => ({
    album: r.album,
    songs: r.songs,
    requestStatus: r.request_status,
  }));
