import { useArtists } from '../../hooks/useArtists';
import { ArtistCard } from './ArtistCard';

export default function RosterPage() {
  const { artists, loading } = useArtists();

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-sm py-lg">
        <h1 className="font-display text-2xl">The Roster</h1>
        <p className="text-base leading-relaxed text-muted">
          These are the artists invited to the SlopBop Residency program. Listen and rate their songs!
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4xl">
          <div className="spinner large processing" />
        </div>
      ) : (
        <div className="flex flex-col border-t border-border -mx-lg">
          {artists.map(artist => (
            <ArtistCard key={artist.artist_id} artist={artist} />
          ))}
          <p className="text-center text-muted text-sm py-lg px-lg">More artists announced soon</p>
        </div>
      )}
    </div>
  );
}
