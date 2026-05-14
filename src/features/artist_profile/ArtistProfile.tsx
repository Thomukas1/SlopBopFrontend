import { useParams } from 'react-router-dom';
import { useArtist } from '../../hooks/useArtist';
import ExpandableBio from '../../primitives/ExpandableBio';
import { ArtistStateCard } from './ArtistStateCard';
import Discography from './Discography';

export default function ArtistProfile() {
  const { id } = useParams<{ id: string }>();
  const artistId = id ?? '';
  const { artist, loading } = useArtist(artistId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner large processing" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-secondary">Artist not found</p>
      </div>
    );
  }

  const heroSrc = artist.imageUrl || '/Images/mystery-actor.png';

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Hero image — full width of the 430px container */}
      <div className="w-full h-[350px] overflow-hidden">
        <img
          src={heroSrc}
          alt={artist.name}
          className="w-full h-full object-cover object-[center_50%]"
        />
      </div>

      {/* Artist info — overlaps the hero image */}
      <div className="flex flex-col gap-md p-lg -mt-[100px] relative z-10">
        <h1 className="font-display text-xl text-left drop-shadow-lg">{artist.name}</h1>

        {artist.bio && (
          <div className="frosted-card p-lg flex flex-col gap-md">
            <ExpandableBio text={artist.bio} />
          </div>
        )}

        <ArtistStateCard artistId={artistId} />
      </div>

      {/* Discography */}
      <div className="p-lg">
        <Discography artistId={artistId} />
      </div>
    </div>
  );
}
