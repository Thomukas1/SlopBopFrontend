import { useMemo } from 'react';
import { useSongs } from './useSongs';
import { Song } from '../services/slopbop';

function netScore(song: Song): number {
  return (song.stats?.bops ?? 0) - (song.stats?.slops ?? 0);
}

export function useTopSong(artistId: string) {
  const { songs, loading } = useSongs(artistId);

  const topSong = useMemo(() => {
    const playable = songs.filter(s => s.audio_url);

    if (!playable.length) return null;
    return playable.reduce((best, s) => netScore(s) >= netScore(best) ? s : best);
  }, [songs]);

  return { topSong, loading };
}
