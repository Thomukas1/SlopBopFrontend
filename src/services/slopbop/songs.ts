import { apiFetch } from './client';

export interface SongStats {
  bops: number;
  slops: number;
  total_votes: number;
}

export interface Song {
  _id: string;
  artist_id: string;
  album_id?: string;
  title?: string;
  duration?: number;
  cover_url?: string;
  audio_url?: string;
  animation_url?: string;
  lyrics?: string;
  caption?: string;
  bpm?: number;
  keyscale?: string;
  lora?: string;
  // Naive sim-local "YYYY-MM-DDTHH:MM" — fixed-width, so lexicographic
  // comparison against `sim.sim_time` is correct chronological order.
  release_date?: string;
  created_at?: string;
  stats?: SongStats;
}

/**
 * Release gate. A song with a `release_date` is sim-scheduled and only becomes
 * visible once sim time reaches it (fixed-width "YYYY-MM-DDTHH:MM" strings, so
 * lexicographic compare == chronological). A song with no `release_date` isn't
 * part of a simulation, so it's always visible like a normal song. `cutoff` is
 * the current `sim.sim_time` (undefined until the sim heartbeat loads).
 */
export function isSongReleased(song: Song, cutoff: string | undefined): boolean {
  if (!song.release_date) return true;
  return !!cutoff && song.release_date <= cutoff;
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

export const fetchSongs = (artistId: string) =>
  apiFetch<SongsResponse>(`/slopbop/songs?artist_id=${artistId}`).then(r => r.songs);

export const voteSong = (songId: string, type: VoteType) =>
  apiFetch<VoteResponse>(`/slopbop/songs/${songId}/vote`, {
    method: 'PATCH',
    body: JSON.stringify({ type }),
  }).then(r => r.stats);
