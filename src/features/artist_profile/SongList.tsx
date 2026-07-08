import { useState, type ReactNode } from 'react';
import type { Song } from '../../services/slopbop';
import { useMusicPlayer, type Track } from '../../context/MusicPlayerContext';
import SingleCard from '../../primitives/music/SingleCard';

type SongSort = 'release' | 'popular';

interface Props {
  songs: Song[];
  /** Maps a song to a playable track — supplies cover/artist context per caller. */
  toTrack: (song: Song) => Track;
  /** Optional left-aligned heading shown on the same row as the sort toggle. */
  header?: ReactNode;
}

/**
 * The canonical way to render a list of songs: a release/popular sort toggle and a
 * play-all button over a card per song. Shared by the artist's Singles section
 * and the album tracklist so the two stay identical.
 *
 * Playback is what-you-see-is-what-plays: hitting play-all, or tapping a song,
 * snapshots the list in its *current* displayed order into the player's queue
 * (tapping song N starts there and plays through to the end). Switching the
 * sort afterwards only affects the next play — it never disturbs a live queue.
 */
export default function SongList({ songs, toTrack, header }: Props) {
  const { playQueue, track, playing, togglePlay } = useMusicPlayer();
  const [sort, setSort] = useState<SongSort>('release');

  const sorted = sort === 'popular'
    ? [...songs].sort((a, b) => {
        const scoreA = (a.stats?.bops ?? 0) - (a.stats?.slops ?? 0);
        const scoreB = (b.stats?.bops ?? 0) - (b.stats?.slops ?? 0);
        return scoreB - scoreA;
      })
    : [...songs].sort((a, b) => {
        // Release order: oldest first (id 1 first). Fall back to created_at so
        // undated songs stay put rather than jumping around.
        const ka = a.release_date || a.created_at || '';
        const kb = b.release_date || b.created_at || '';
        return ka.localeCompare(kb);
      });

  // Snapshot in the exact order shown, so tap index == queue index.
  const tracks = sorted.map(toTrack);

  // This list "owns" playback when the playing track is one of its songs —
  // so its play-all button becomes a pause/resume toggle (keeping the queue
  // position) instead of restarting from the top.
  const isCurrentList = !!track && sorted.some(s => s._id === track.id);
  const showPause = isCurrentList && playing;

  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center justify-between gap-md">
        <div className="flex items-center gap-md min-w-0">
          {header}
          <div className="flex rounded-md overflow-hidden border border-border text-xs flex-shrink-0">
            {(['release', 'popular'] as SongSort[]).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setSort(mode)}
                className={`px-sm py-xs capitalize transition-base ${
                  sort === mode ? 'bg-surface text-primary' : 'text-muted'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => (isCurrentList ? togglePlay() : playQueue(tracks, 0))}
          aria-label={showPause ? 'Pause' : 'Play all'}
          className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0
                     cursor-pointer active:scale-90 transition-base"
        >
          {showPause ? (
            <svg viewBox="0 0 24 24" fill="var(--black)" className="w-4 h-4">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="var(--black)" className="w-5 h-5 ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>
      <div className="flex flex-col bg-surface-2 rounded-lg p-sm">
        {sorted.map((song, i) => (
          <div key={song._id}>
            {i > 0 && <div className="border-t border-white/10 my-xs" />}
            <SingleCard
              coverUrl={song.cover_url}
              title={song.title || 'Untitled'}
              duration={song.duration}
              stats={song.stats}
              active={track?.id === song._id}
              onClick={() => playQueue(tracks, i)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
