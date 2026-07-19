import { Link } from 'react-router-dom';
import { Artist } from '../../services/slopbop';
import Img from '../../primitives/Img';

/**
 * A stripped-down artist showcase for the landing page — image + name only,
 * no genres or top track. Links through to the full artist page, same as the
 * roster's {@link ArtistCard}.
 *
 * The whole card is the target, so the "View profile" cue is a span rather than
 * a button: a second interactive element nested inside the link would give the
 * card two tap targets for one destination, and hand screen readers a control
 * inside a control.
 */
export function FeaturedArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link
      to={`/artists/${artist.artist_id}`}
      className="block w-full rounded-lg overflow-hidden border-2 border-accent active:opacity-80 transition-opacity"
    >
      <div className="relative">
        <Img
          src={artist.image_url ?? '/Images/mystery-actor.png'}
          alt={artist.name}
          className="w-full aspect-video"
          imgClassName="object-cover object-top"
        />
        {/* The affordance, as a tab off the border's top-right corner — without
            it the card reads as a picture with a caption. It sits over the image
            rather than beside the name so that the name owns its whole row and
            never has to compete for width. */}
        <span className="absolute top-0 right-0 bg-accent text-alt text-xs px-md py-xs rounded-bl-lg">
          View profile →
        </span>
      </div>
      <div className="px-lg py-md bg-surface flex flex-col gap-xs">
        <p className="eyebrow">Featured Artist</p>
        <p className="font-display text-xl break-words">{artist.name}</p>
      </div>
    </Link>
  );
}
