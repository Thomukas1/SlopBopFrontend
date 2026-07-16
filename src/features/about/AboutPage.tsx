import { useNavigate } from 'react-router-dom';
import { Footer } from '../../components/Footer';
import { SocialLinks } from '../../primitives/SocialLinks';
import { Flourish } from '../../primitives/Flourish';
import { useArtists } from '../../hooks/useArtists';
import { FeaturedArtistCard } from './FeaturedArtistCard';
import { Testimonials } from './Testimonials';
import { PROJECT_SOCIALS } from '../../config/socials';

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

        {/* Socials, lifted up right under the introduction */}
        <SocialLinks socials={PROJECT_SOCIALS} className="justify-center pt-sm" />
      </section>

      {/* Featured artist — a taste of the roster; the full list lives on /roster */}
      <section className="flex flex-col gap-md px-md">
        {featured && <FeaturedArtistCard artist={featured} />}

        <button
          type="button"
          className="secondary full-width"
          onClick={() => navigate('/roster')}
        >
          View all artists
        </button>
      </section>

      <Flourish />

      {/* Commission teaser — full detail lives on /commission */}
      <section className="flex flex-col gap-md px-md">
        <div className="flex flex-col gap-xs">
          <p className="eyebrow">Private commissions</p>
          <h2 className="font-display text-2xl">Hire an artist for your group</h2>
        </div>
        <p className="text-base leading-relaxed">
          For a day, one of our artists is yours. Your group writes the lyrics, the artist records
          them in its own voice, and the songs release one by one on a custom album — with a music
          video for the group's favourite.
        </p>

        <div className="flex justify-end pt-sm">
          <button
            type="button"
            className="secondary"
            onClick={() => navigate('/commission')}
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
