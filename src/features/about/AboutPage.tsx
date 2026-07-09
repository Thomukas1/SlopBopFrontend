import { useNavigate } from 'react-router-dom';
import { Footer } from '../../primitives/Footer';
import { SocialLinks } from '../../primitives/SocialLinks';
import { Flourish } from '../../primitives/Flourish';
import { useArtists } from '../../hooks/useArtists';
import { FeaturedArtistCard } from './FeaturedArtistCard';
import { Testimonials } from './Testimonials';

const PROJECT_SOCIALS: Record<string, string> = {
  twitter: 'https://x.com/slopboptv',
  youtube: 'https://www.youtube.com/@slopboptv',
};

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
        </p>

        <p className="text-base leading-relaxed">
          We want to find out if AI music can actually <span className="highlight">bop</span> if
          there's a synthetic artist behind its production.
        </p>
        <p className="text-sm uppercase tracking-wider highlight">
          Is it slop, or does it bop?
        </p>

        {/* Socials, lifted up right under the introduction */}
        <SocialLinks socials={PROJECT_SOCIALS} className="justify-center pt-sm" />
      </section>

      {/* The Roster — what the artists are, plus the one we've got */}
      <section className="flex flex-col gap-md px-md">
        {featured && <FeaturedArtistCard artist={featured} />}

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

        <button
          type="button"
          className="secondary full-width"
          onClick={() => navigate('/roster')}
        >
          View Roster
        </button>
      </section>

      <Flourish />

      {/* Creative Bootcamp teaser — full detail lives on /bootcamp */}
      <section className="flex flex-col gap-md px-md">
        <div className="flex flex-col gap-xs">
          <p className="text-sm uppercase tracking-wider highlight">Introducing</p>
          <h2 className="font-display text-2xl">Creative Bootcamp</h2>
        </div>
        <p className="text-base leading-relaxed">
          Get ready for an unforgettable attraction for you and a group of friends:
          <br /><br />
          Rent one of our artists to produce a custom music album based on your ideas, and see who
          can come up with the most viral song!
        </p>

        <div className="flex justify-end pt-sm">
          <button
            type="button"
            className="secondary"
            onClick={() => navigate('/bootcamp')}
          >
            Learn more
          </button>
        </div>
      </section>

      {/* Real testimonials — renders nothing until quotes are added */}
      <Testimonials />

      <div className="px-md">
        <Footer />
      </div>
    </div>
  );
}
