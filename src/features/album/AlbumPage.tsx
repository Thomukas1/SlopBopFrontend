import { useParams, Link } from 'react-router-dom';
import { useAlbum } from '../../hooks/useAlbum';
import { useArtist } from '../../hooks/useArtist';
import SongList from '../artist_profile/SongList';
import Img from '../../primitives/Img';
import Submissions from './Submissions';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const { album, songs, requestStatus, loading: albumLoading, refetch } = useAlbum(id ?? '');
  const { artist, loading: artistLoading } = useArtist(album?.artist_id ?? '');

  const loading = albumLoading || artistLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner large processing" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted">Album not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Img
        src={album.cover_url || '/Images/default_song_cover.png'}
        alt={album.title}
        className="w-full aspect-square"
      />

      <div className="flex flex-col gap-xs p-lg">
        <h1 className="font-display text-xl">{album.title || 'Untitled'}</h1>
        <p className="text-sm ml-md">
          Album by{' '}
          <Link
            to={`/artists/${artist?.artist_id}`}
            className="underline"
          >
            {artist?.name ?? 'Unknown'}
          </Link>
          {album.created_at && <> | {formatDate(album.created_at)}</>}
        </p>
      </div>

      <div className="flex flex-col gap-lg px-lg pb-lg">
        <SongList
          songs={songs}
          onRefetch={refetch}
          toTrack={song => ({
            id: song._id,
            title: song.title || 'Untitled',
            coverUrl: song.cover_url || album.cover_url,
            audioUrl: song.audio_url || '',
            duration: song.duration,
            lyrics: song.lyrics,
            author: song.author,
            stats: song.stats,
            artistId: song.artist_id,
            artistName: artist?.name,
          })}
        />

        {requestStatus && (
          <Submissions
            albumId={album._id}
            artistName={artist?.name}
            status={requestStatus}
            songCount={songs.length}
            refresh={refetch}
          />
        )}
      </div>
    </div>
  );
}
