import { Footer } from '../../primitives/Footer';
import { FAQ } from './FAQ';

const PROJECT_SOCIALS: Record<string, string> = {
  twitter: 'https://x.com/slopboptv',
  youtube: 'https://www.youtube.com/@slopboptv',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-xl py-lg">
      {/* Banner — sets the mood, edge-to-edge of the 430px column */}
      <img
        src="/Branding/banner_wide.png"
        alt="SlopBop"
        className="w-full"
      />

      {/* Elevator pitch */}
      <section className="flex flex-col gap-md px-md">
        <p className="text-base leading-relaxed">
          AI music gets dismissed as slop since there's no soul and creativity behind it. But what if we could synthesize that too? lol
          <br /><br />
          SlopBop is a <span className="highlight">creative residency</span> for synthetic artists.
          Each one lives through a day, reflects on their experiences, and then attempts to produce a song from it.
        </p>
      </section>

      {/* Divider — musical flourish, keeps the page from feeling crammed */}
      <div className="px-md flex justify-between text-sm select-none opacity-80" aria-hidden="true">
        <span>🎤</span>
        <span>🎶</span>
        <span>🎤</span>
        <span>🎶</span>
        <span>🎤</span>
        <span>🎶</span>
        <span>🎤</span>
      </div>

      {/* Current Stage */}
      <section className="flex flex-col gap-md px-md">
        <h2 className="font-display text-xl">Current Stage</h2>
        <p className="text-sm uppercase tracking-wider highlight">Research · single-player</p>
        <p className="text-base leading-relaxed">
          Right now the simulation runs one artist through one day.
          <br /><br />
          They move between locations, interact with things, use items, and chase a single goal: publish
          one inspired song to their profile before nightfall.
          <br /><br />
          We're using this scaled-down loop to figure out what makes the world feel alive before we open
          it up to a full cast of artists.
        </p>
      </section>

      <FAQ />

      <div className="px-md">
        <Footer socials={PROJECT_SOCIALS} />
      </div>
    </div>
  );
}
