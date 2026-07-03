import { useState, type ReactNode } from 'react';
import type { Song } from '../../services/slopbop';
import SingleCard from './SingleCard';

type SongSort = 'new' | 'popular';

interface Props {
  songs: Song[];
  onPlay: (song: Song) => void;
  /** Optional left-aligned heading shown on the same row as the sort toggle. */
  header?: ReactNode;
}

/**
 * The canonical way to render a list of songs: a new/popular sort toggle over a
 * card per song. Shared by the artist's Singles section and the album tracklist
 * so the two stay identical.
 */
export default function SongList({ songs, onPlay, header }: Props) {
  const [sort, setSort] = useState<SongSort>('new');

  const sorted = sort === 'popular'
    ? [...songs].sort((a, b) => {
        const scoreA = (a.stats?.bops ?? 0) - (a.stats?.slops ?? 0);
        const scoreB = (b.stats?.bops ?? 0) - (b.stats?.slops ?? 0);
        return scoreB - scoreA;
      })
    : [...songs].sort((a, b) => {
        if (!a.release_date) return 1;
        if (!b.release_date) return -1;
        return b.release_date.localeCompare(a.release_date);
      });

  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center justify-between">
        {header ?? <span />}
        <div className="flex rounded-md overflow-hidden border border-border text-xs">
          {(['new', 'popular'] as SongSort[]).map(mode => (
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
      <div className="flex flex-col bg-surface-2 rounded-lg p-sm">
        {sorted.map((song, i) => (
          <div key={song._id}>
            {i > 0 && <div className="border-t border-white/10 my-xs" />}
            <SingleCard
              coverUrl={song.cover_url}
              title={song.title || 'Untitled'}
              duration={song.duration}
              stats={song.stats}
              onClick={() => onPlay(song)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
