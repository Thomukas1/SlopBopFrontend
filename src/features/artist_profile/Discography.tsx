import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollections } from '../../hooks/useCollections';
import { useSongs } from '../../hooks/useSongs';
import type { Collection, Song } from '../../services/slopbop';
import AlbumCard from '../../primitives/music/AlbumCard';
import SongList from './SongList';

interface Props {
  artistId: string;
  artistName?: string;
}

export interface GroupedDiscography {
  albums: { album: Collection; songs: Song[] }[];
  singles: Song[];
}

function useDiscography(artistId: string): {
  discography: GroupedDiscography;
  loading: boolean;
  refetch: () => void;
} {
  const { collections: albums, loading: albumsLoading } = useCollections(artistId, 'album');
  const { songs, loading: songsLoading, refetch } = useSongs(artistId);

  const discography = useMemo<GroupedDiscography>(() => {
    const songsByCollection = new Map<string, Song[]>();
    const singles: Song[] = [];

    for (const song of songs) {
      if (song.collection_id) {
        const list = songsByCollection.get(song.collection_id) ?? [];
        list.push(song);
        songsByCollection.set(song.collection_id, list);
      } else {
        singles.push(song);
      }
    }

    const grouped = albums.map(album => ({
      album,
      songs: songsByCollection.get(album._id) ?? [],
    }));

    return { albums: grouped, singles };
  }, [albums, songs]);

  return { discography, loading: albumsLoading || songsLoading, refetch };
}

export default function Discography({ artistId, artistName }: Props) {
  const { discography, loading, refetch } = useDiscography(artistId);
  const navigate = useNavigate();

  if (loading) return null;
  if (!discography.albums.length && !discography.singles.length) return null;

  return (
    <div className="flex flex-col gap-lg">
      {discography.albums.length > 0 && (
        <div className="flex flex-col gap-md">
          <h2 className="font-display text-lg">Albums</h2>
          <div className="grid grid-cols-2 gap-md">
            {discography.albums.map(({ album }) => (
              <AlbumCard
                key={album._id}
                coverUrl={album.cover_url}
                title={album.title || 'Untitled'}
                onClick={() => navigate(`/albums/${album._id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {discography.singles.length > 0 && (
        <SongList
          songs={discography.singles}
          header={<h2 className="font-display text-lg">Singles</h2>}
          onRefetch={refetch}
          toTrack={song => ({
            id: song._id,
            title: song.title || 'Untitled',
            coverUrl: song.cover_url,
            audioUrl: song.audio_url || '',
            duration: song.duration,
            lyrics: song.lyrics,
            author: song.author,
            stats: song.stats,
            artistId: song.artist_id,
            artistName,
          })}
        />
      )}
    </div>
  );
}
