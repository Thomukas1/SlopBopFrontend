import { useMemo } from 'react';
import { useSongs } from './useSongs';
import { isReleased, Song } from '../services/slopbop';

function netScore(song: Song): number {
  return (song.stats?.bops ?? 0) - (song.stats?.slops ?? 0);
}

export function useTopSong(artistId: string) {
  const { songs, loading } = useSongs(artistId);

  const topSong = useMemo(() => {
    // A not-yet-released song can't be the roster shortcut — it isn't playable.
    const playable = songs.filter(s => s.audio_url && isReleased(s));

    if (!playable.length) return null;
    return playable.reduce((best, s) => netScore(s) >= netScore(best) ? s : best);
  }, [songs]);

  return { topSong, loading };
}
