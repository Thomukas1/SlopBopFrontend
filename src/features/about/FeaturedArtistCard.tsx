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
      <Img
        src={artist.image_url ?? '/Images/mystery-actor.png'}
        alt={artist.name}
        className="w-full aspect-video"
        imgClassName="object-cover object-top"
      />
      <div className="px-lg py-md bg-surface flex items-center justify-between gap-md">
        <div className="flex flex-col gap-xs min-w-0">
          <p className="eyebrow">Featured Artist</p>
          <p className="font-display text-xl truncate">{artist.name}</p>
        </div>
        {/* The affordance. A trailing arrow on the right edge of a card is the
            standard "this goes somewhere" cue on mobile — without it the card
            reads as a picture with a caption. */}
        <span className="text-sm text-accent whitespace-nowrap shrink-0">View profile →</span>
      </div>
    </Link>
  );
}
