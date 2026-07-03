import { useMemo } from 'react';
import { useSongs } from './useSongs';
import { useSim } from '../context/SimContext';
import { Song, isSongReleased } from '../services/slopbop';

function netScore(song: Song): number {
  return (song.stats?.bops ?? 0) - (song.stats?.slops ?? 0);
}

export function useTopSong(artistId: string) {
  const { songs, loading } = useSongs(artistId);
  const { sim } = useSim();

  const topSong = useMemo(() => {
    const cutoff = sim?.sim_time;
    const visible = songs.filter(s => s.audio_url && isSongReleased(s, cutoff));

    if (!visible.length) return null;
    return visible.reduce((best, s) => netScore(s) >= netScore(best) ? s : best);
  }, [songs, sim?.sim_time]);

  return { topSong, loading };
}
