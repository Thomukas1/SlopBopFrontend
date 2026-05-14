import { useArtists } from '../../hooks/useArtists';
import { ArtistCard } from '../artist_profile/ArtistCard';

export function ArtistsGrid({ artistIds }: { artistIds: string[] }) {
  const { artists, loading } = useArtists();

  if (loading) {
    return <p className="text-secondary text-sm">Loading artists...</p>;
  }

  const byId = new Map(artists.map(a => [a._id, a]));
  const ordered = artistIds.map(id => byId.get(id)).filter(Boolean) as typeof artists;

  if (ordered.length === 0) {
    return <p className="text-secondary text-sm">No artists in this simulation.</p>;
  }

  return (
    <div className="flex flex-col gap-md">
      {ordered.map(artist => (
        <ArtistCard key={artist._id} artist={artist} />
      ))}
    </div>
  );
}
