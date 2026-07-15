import { Link } from 'react-router-dom';
import { Artist } from '../../services/slopbop';
import Img from '../../primitives/Img';

/**
 * A stripped-down artist showcase for the landing page — image + name only,
 * no genres or top track. Links through to the full artist page, same as the
 * roster's {@link ArtistCard}.
 */
export function FeaturedArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link
      to={`/artists/${artist.artist_id}`}
      className="block w-full rounded-lg overflow-hidden border-2 border-accent active:opacity-80 transition-opacity"
    >
      <Img
        src={artist.image_url ?? '/Images/mystery-actor.png'}
        alt={artist.name}
        className="w-full aspect-video"
        imgClassName="object-cover object-top"
      />
      <div className="px-lg py-md bg-surface flex flex-col gap-xs">
        <p className="eyebrow">Featured Artist</p>
        <p className="font-display text-xl">{artist.name}</p>
      </div>
    </Link>
  );
}
