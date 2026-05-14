import { apiFetch } from './client';

export interface Artist {
  _id: string;
  name: string;
  bio?: string;
  imageUrl?: string;
  socials?: Record<string, string>;
}

interface ArtistResponse {
  success: boolean;
  artist: Artist;
}

interface ArtistsResponse {
  success: boolean;
  artists: Record<string, Artist>;
}

export const fetchArtist = (id: string) =>
  apiFetch<ArtistResponse>(`/slopbop/artist/${id}`).then(r => r.artist);

export const fetchArtists = (limit?: number) => {
  const params = limit ? `?limit=${limit}` : '';
  return apiFetch<ArtistsResponse>(`/slopbop/artists${params}`).then(r => r.artists);
};
