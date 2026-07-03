import { apiFetch } from './client';
import { Song } from './songs';
import { RequestClosedReason } from './requests';

export interface Album {
  _id: string;
  artist_id: string;
  title?: string;
  song_count?: number;
  cover_url?: string;
  created_at?: string;
}

// Whether the album is currently accepting song requests, evaluated server-side
// on album detail read. `open` gates the request form; when closed, `reason`
// says why. `deadline` is an ISO string (null only when `not_configured`).
export interface RequestStatus {
  open: boolean;
  reason: RequestClosedReason | null;
  track_count: number;
  max_tracks: number;
  deadline: string | null;
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
