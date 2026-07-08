import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlbums } from '../../hooks/useAlbums';
import { useSongs } from '../../hooks/useSongs';
import type { Album, Song } from '../../services/slopbop';
import AlbumCard from './AlbumCard';
import SongList from './SongList';

interface Props {
  artistId: string;
  artistName?: string;
}

export interface GroupedDiscography {
  albums: { album: Album; songs: Song[] }[];
  singles: Song[];
}

function useDiscography(artistId: string): { discography: GroupedDiscography; loading: boolean } {
  const { albums, loading: albumsLoading } = useAlbums(artistId);
  const { songs, loading: songsLoading } = useSongs(artistId);

  const discography = useMemo<GroupedDiscography>(() => {
    const songsByAlbum = new Map<string, Song[]>();
    const singles: Song[] = [];

    for (const song of songs) {
      if (song.album_id) {
        const list = songsByAlbum.get(song.album_id) ?? [];
        list.push(song);
        songsByAlbum.set(song.album_id, list);
      } else {
        singles.push(song);
      }
    }

    const grouped = albums.map(album => ({
      album,
      songs: songsByAlbum.get(album._id) ?? [],
    }));

    return { albums: grouped, singles };
  }, [albums, songs]);

  return { discography, loading: albumsLoading || songsLoading };
}

export default function Discography({ artistId, artistName }: Props) {
  const { discography, loading } = useDiscography(artistId);
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
          toTrack={song => ({
            id: song._id,
            title: song.title || 'Untitled',
            coverUrl: song.cover_url,
            audioUrl: song.audio_url || '',
            duration: song.duration,
            lyrics: song.lyrics,
            stats: song.stats,
            artistId: song.artist_id,
            artistName,
          })}
        />
      )}
    </div>
  );
}
