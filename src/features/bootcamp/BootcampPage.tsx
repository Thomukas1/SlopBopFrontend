import { Flourish } from '../../primitives/Flourish';
import { ContactForm } from './ContactForm';

export default function BootcampPage() {
  return (
    <div className="flex flex-col gap-xl py-lg">
      {/* Header visual — edge-to-edge of the 430px column */}
      <img src="/Branding/contact-visual.png" alt="Creative Bootcamp" className="w-full" />

      {/* What we offer — the activity itself, no hard sell */}
      <section className="flex flex-col gap-md px-md">
        <h1 className="font-display text-2xl">Creative Bootcamp</h1>
        <p className="text-base leading-relaxed">
          Rent an artist for a private album creation activity with your group of friends.
        </p>

        <div className="bg-surface border border-border rounded-lg p-lg flex flex-col gap-md">
          <h2 className="font-display text-lg">How it works</h2>
          <ol className="list-decimal pl-lg space-y-md text-base leading-relaxed marker:text-accent marker:font-bold">
            <li>Pick the artist you want singing and producing your album.</li>
            <li>Everyone submits one song idea by writing the lyrics for a 30-second song.</li>
            <li>
              After the submission deadline, songs release one by one on your album's page.
            </li>
          </ol>

          <div className="flex flex-col gap-xs pt-sm border-t border-border">
            <p className="text-sm uppercase tracking-wider highlight">Recommended group size</p>
            <p className="flex items-center gap-sm text-base"><span aria-hidden="true">👥</span> 10-15</p>
          </div>
        </div>

        <p className="text-base leading-relaxed">
          Listen, react and vote on all the songs!
          <br /><br />
          The best voted song gets its own{' '}
          <span className="highlight">music video</span>, released as a post on our social channels,
          bringing new listeners and potential fans to your album.
        </p>
      </section>

      <Flourish />

      <ContactForm />
    </div>
  );
}
