import { useNavigate } from 'react-router-dom';
import { Footer } from '../../primitives/Footer';
import { SocialLinks } from '../../primitives/SocialLinks';
import { useArtists } from '../../hooks/useArtists';
import { FeaturedArtistCard } from './FeaturedArtistCard';

const PROJECT_SOCIALS: Record<string, string> = {
  twitter: 'https://x.com/slopboptv',
  youtube: 'https://www.youtube.com/@slopboptv',
};

/** Musical flourish divider — keeps the page breathing between sections. */
function Flourish() {
  return (
    <div
      className="px-md flex justify-between text-sm select-none opacity-80"
      aria-hidden="true"
    >
      <span>🎤</span>
      <span>🎶</span>
      <span>🎤</span>
      <span>🎶</span>
      <span>🎤</span>
      <span>🎶</span>
      <span>🎤</span>
    </div>
  );
}

export default function AboutPage() {
  const navigate = useNavigate();
  const { artists } = useArtists();
  const featured = artists[0];

  return (
    <div className="flex flex-col gap-xl py-lg">
      {/* Banner — sets the mood, edge-to-edge of the 430px column */}
      <img src="/Branding/banner_wide.png" alt="SlopBop" className="w-full" />

      {/* The concept — who we are, and how the name works. No business here. */}
      <section className="flex flex-col gap-md px-md">
        <p className="text-base leading-relaxed">
          SlopBop is an <span className="highlight">agentic music label</span> with a cast of
          synthetic artists. They create songs, and you judge them.
          <br /><br />
          Every song gets rated one of two ways:
        </p>

        {/* slop / bop as decorative (disabled) versions of the BopMeter buttons */}
        <ul className="flex flex-col gap-sm my-md">
          <li className="flex items-center gap-md">
            <button
              type="button"
              disabled
              aria-hidden="true"
              className="shrink-0 w-24 py-1.5 rounded-lg bg-danger text-black font-bold text-xs disabled:opacity-100"
            >
              SLOP 🤮
            </button>
            <span className="text-base">Boring AI music</span>
          </li>
          <li className="flex items-center gap-md">
            <button
              type="button"
              disabled
              aria-hidden="true"
              className="shrink-0 w-24 py-1.5 rounded-lg bg-accent text-black font-bold text-xs disabled:opacity-100"
            >
              BOP 🤩
            </button>
            <span className="text-base">Actual fire beat</span>
          </li>
        </ul>

        <p className="text-base leading-relaxed">
          Our mission is to find out if AI music can actually <span className="highlight">bop</span> if
          there's an artist, even if a fake one, behind its production.
        </p>
        <p className="text-sm uppercase tracking-wider highlight">
          Is it slop, or does it bop?
        </p>

        {/* Socials, lifted up right under the introduction */}
        <SocialLinks socials={PROJECT_SOCIALS} className="justify-center pt-sm" />
      </section>

      {/* The Roster — what the artists are, plus the one we've got */}
      <section className="flex flex-col gap-md px-md">
        <h2 className="font-display text-xl">The Roster</h2>
        <p className="text-base leading-relaxed">
          Each artist in SlopBop is an agent built from the ground up, with its own distinct:
        </p>

        <ul className="flex flex-col gap-sm text-base">
          <li className="flex items-center gap-md"><span aria-hidden="true">🧠</span> Personality</li>
          <li className="flex items-center gap-md"><span aria-hidden="true">🎨</span> Appearance</li>
          <li className="flex items-center gap-md"><span aria-hidden="true">🎤</span> Voice</li>
          <li className="flex items-center gap-md"><span aria-hidden="true">🎧</span> Music taste</li>
        </ul>

        <p className="text-base leading-relaxed">
          Listen to their songs and rate them too!
        </p>

        {featured && <FeaturedArtistCard artist={featured} />}

        <button
          type="button"
          className="secondary full-width"
          onClick={() => navigate('/roster')}
        >
          See all Artists
        </button>
      </section>

      <Flourish />

      {/* What we offer — the activity itself, no hard sell */}
      <section className="flex flex-col gap-md px-md">
        <div className="flex flex-col gap-xs">
          <p className="text-sm uppercase tracking-wider highlight">Introducing</p>
          <h2 className="font-display text-2xl">Creative Bootcamp</h2>
        </div>
        <p className="text-base leading-relaxed">
          Rent an artist for a private album creation activity with your group of friends.
        </p>
        <p className="flex items-center gap-md text-base">
          <span aria-hidden="true">👥</span> Recommended group size: 10-15
        </p>

        <h3 className="font-display text-lg pt-sm">How it works</h3>
        <ol className="list-decimal pl-lg space-y-md text-base leading-relaxed marker:text-accent marker:font-bold">
          <li>Pick the artist you want singing and producing your album.</li>
          <li>Everyone submits one song idea by writing the lyrics for a 30-second song.</li>
          <li>
            After the submission deadline, songs release one by one on your album's page for the
            group to listen, react and vote on.
          </li>
        </ol>

        <p className="text-base leading-relaxed">
          The best voted song of your album gets its own <span className="highlight">music video</span>,
          released as a post on our social channels, bringing new listeners and potential fans to
          your album.
        </p>

        <div className="flex justify-end pt-sm">
          <button
            type="button"
            className="secondary"
            onClick={() => navigate('/contact')}
          >
            How do I order?
          </button>
        </div>
      </section>

      <div className="px-md">
        <Footer />
      </div>
    </div>
  );
}
