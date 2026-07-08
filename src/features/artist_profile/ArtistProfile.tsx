import { useParams, useNavigate } from 'react-router-dom';
import { useArtist } from '../../hooks/useArtist';
import ExpandableBio from '../../primitives/ExpandableBio';
import GenrePills from '../../primitives/GenrePills';
import Img from '../../primitives/Img';
import Discography from './Discography';

export default function ArtistProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        <p className="text-muted">Artist not found</p>
      </div>
    );
  }

  const heroSrc = artist.image_url || '/Images/mystery-actor.png';

  return (
    <div className="flex flex-col relative">
      {/* Hero image — full width of the 430px container */}
      <div className="artist-hero">
        <Img
          src={heroSrc}
          alt={artist.name}
          className="w-full h-full"
          imgClassName="object-cover object-[center_50%]"
        />
        {/* Back button overlaid on top-left of hero */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-lg left-lg z-10 flex items-center justify-center w-12 h-12 rounded-full bg-black/70 text-white active:opacity-70 transition-opacity"
          aria-label="Go back"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
      </div>

      {/* Artist info — overlaps the hero image */}
      <div className="artist-hero-content flex flex-col gap-md p-lg">
        <h1 className="font-display text-xl text-left drop-shadow-lg">{artist.name}</h1>

        {artist.bio && (
          <div className="frosted-card p-lg flex flex-col gap-md">
            <ExpandableBio text={artist.bio} />
          </div>
        )}

        <GenrePills genres={artist.genres} />
      </div>

      {/* Discography */}
      <div className="p-lg">
        <Discography artistId={artistId} artistName={artist.name} />
      </div>
    </div>
  );
}
