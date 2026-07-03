import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCollection } from '../../hooks/useCollection';
import { useArtist } from '../../hooks/useArtist';
import { useSim } from '../../context/SimContext';
import { useMusicPlayer } from '../../context/MusicPlayerContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTH_NAMES[d.getMonth()] } ${d.getFullYear()}`;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function CollectionPage() {
  const { id } = useParams<{ id: string }>();
  const { collection, songs, loading: collectionLoading } = useCollection(id ?? '');
  const { artist, loading: artistLoading } = useArtist(collection?.artist_id ?? '');
  const { sim } = useSim();
  const { play } = useMusicPlayer();

  const loading = collectionLoading || artistLoading;

  // Same release-gate as Discography: fixed-width "YYYY-MM-DDTHH:MM"
  // string compare is correct chronological order.
  const visibleSongs = useMemo(() => {
    const cutoff = sim?.sim_time;
    if (!cutoff) return [];
    return songs.filter(s => s.release_date && s.release_date <= cutoff);
  }, [songs, sim?.sim_time]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner large processing" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted">Collection not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <img
        src={collection.cover_url || '/Images/default_song_cover.png'}
        alt={collection.title}
        className="w-full aspect-square object-cover"
      />

      <div className="flex flex-col gap-xs p-lg">
        <h1 className="font-display text-xl">{collection.title || 'Untitled'}</h1>
        <p className="text-sm ml-md">
          {collection.collection_type} by{' '}
          <Link
            to={`/artists/${artist?.artist_id}`}
            className="underline"
          >
            {artist?.name ?? 'Unknown'}
          </Link>
          {collection.created_at && <> | {formatDate(collection.created_at)}</>}
        </p>
      </div>

      <div className="flex flex-col px-lg pb-lg">
        <div className="flex items-center gap-sm px-sm py-xs text-xs">
          <p className="w-6 text-center">#</p>
          <p className="flex-1">Title</p>
          <p className="flex-shrink-0">Duration</p>
        </div>

        <div className="flex flex-col bg-surface-2 rounded-lg p-sm">
          {visibleSongs.map((song, i) => (
            <div key={song._id}>
              {i > 0 && <div className="border-t border-white/10 my-xs" />}
              <button
                type="button"
                onClick={() => play({
                  id: song._id,
                  title: song.title || 'Untitled',
                  coverUrl: song.cover_url || collection.cover_url,
                  audioUrl: song.audio_url || '',
                  duration: song.duration,
                  lyrics: song.lyrics,
                  stats: song.stats,
                  artistId: song.artist_id,
                  artistName: artist?.name,
                })}
                className="flex items-center gap-sm w-full text-left cursor-pointer
                           active:opacity-70 transition-base px-sm py-xs"
              >
                <span className="w-6 text-center text-sm text-muted">{i + 1}</span>
                <p className="text-sm truncate flex-1">{song.title || 'Untitled'}</p>
                {song.duration != null && (
                  <span className="text-sm text-muted flex-shrink-0">
                    {formatDuration(song.duration)}
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
