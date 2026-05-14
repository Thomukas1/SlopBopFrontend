import { apiFetch } from './client';

export interface SongStats {
  bops: number;
  slops: number;
  totalVotes: number;
}

export interface Song {
  _id: string;
  artistId: string;
  collectionId?: string;
  title?: string;
  duration?: number;
  coverUrl?: string;
  audioUrl?: string;
  animationUrl?: string;
  lyrics?: string;
  createdAt?: string;
  stats?: SongStats;
}

export type VoteType = 'bop' | 'slop';

interface SongsResponse {
  success: boolean;
  songs: Song[];
}

interface VoteResponse {
  success: boolean;
  stats: SongStats;
}

interface GenerateSongPayload {
  artistId: string;
  theme: string;
  collectionId?: string;
  walletAddress: string;
  challengeId: string;
  message: string;
  signature: string;
}

interface GenerateSongResponse {
  success: boolean;
  message: string;
}

export const fetchSongs = (artistId: string) =>
  apiFetch<SongsResponse>(`/slopbop/songs?artist_id=${artistId}`).then(r => r.songs);

export const voteSong = (songId: string, type: VoteType) =>
  apiFetch<VoteResponse>(`/slopbop/songs/${songId}/vote`, {
    method: 'PATCH',
    body: JSON.stringify({ type }),
  }).then(r => r.stats);

export const generateSong = (payload: GenerateSongPayload) =>
  apiFetch<GenerateSongResponse>('/slopbop/song/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
