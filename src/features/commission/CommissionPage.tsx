import { useNavigate } from 'react-router-dom';
import { ContactForm } from './ContactForm';

// How a day runs, as three plain beats — the mechanic without the clutter.
const FLOW: { title: string; body: string }[] = [
  {
    title: 'Everyone writes one song',
    body: "Early on there's a short submission window: each person writes the lyrics for one 30-second song. That's the only task — after that you just listen.",
  },
  {
    title: 'Songs drop on a schedule',
    body: 'Through the day the artist records them and releases them one at a time, so there’s always a next drop to look forward to.',
  },
  {
    title: 'Listen, react, vote',
    body: 'Every release, the group plays it together, reacts, and votes Slop or Bop — then waits for the next. The favourite earns a music video.',
  },
];

// An illustrative album — makes the artifact concrete. Swap for a <Link> to a
// real /albums/:id once there's a showcase-worthy one.
const EXAMPLE_TRACKS = ['Coffee at 6AM', 'Whose Idea Was This', 'The Group Chat Anthem'];

export default function CommissionPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3xl pb-2xl">
      {/* Hero */}
      <header className="flex flex-col">
        <img src="/Branding/contact-visual.png" alt="" className="w-full block" />
        <div className="px-md pt-md flex flex-col gap-sm">
          <p className="eyebrow">Private Commissions</p>
          <h1 className="font-display text-3xl leading-tight">Your day, as an album</h1>
          <p className="subtle text-base leading-relaxed">
            Rent one of our artists for a group activity that hums along in the background of your
            day — and leaves a real album behind.
          </p>
        </div>
      </header>

      {/* The vibe */}
      <section className="flex flex-col gap-md px-md">
        <h2 className="font-display text-lg">Not the main event</h2>
        <p className="text-base leading-relaxed">
          It runs quietly alongside whatever your group is already doing — working, celebrating,
          hanging out. Nobody has to stop and pay attention; it just adds to the day instead of
          taking it over.
        </p>
        <p className="text-base leading-relaxed">
          But everyone's writing for the same album, so by the end you've made something
          <span className="highlight"> together</span>. Groups bond over it in a way they don't see
          coming — your inside jokes, your day, your people, turned into music.
        </p>
      </section>

      {/* How the day flows */}
      <section className="flex flex-col gap-lg px-md">
        <h2 className="font-display text-lg">How the day flows</h2>
        <div className="flex flex-col gap-lg">
          {FLOW.map(({ title, body }, i) => (
            <div key={title} className="flex gap-md items-start">
              <span className="font-display text-base text-alt bg-accent rounded-full w-8 h-8 shrink-0 flex items-center justify-center">
                {i + 1}
              </span>
              <div className="flex flex-col gap-xs pt-1">
                <h3 className="font-display text-base leading-tight">{title}</h3>
                <p className="text-sm subtle leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The keepsake — the emotional core, made concrete by an example album */}
      <section className="flex flex-col gap-lg px-md">
        <div className="flex flex-col gap-md">
          <h2 className="font-display text-lg">The album is the keepsake</h2>
          <p className="text-base leading-relaxed">
            When the day ends, the album stays. It's that day <span className="highlight">immortalized</span> —
            the whole vibe locked into something you can play back months later and feel it all again.
            Not a folder of files: a finished record, recorded start to finish by one artist in a
            single voice.
          </p>
        </div>

        {/* Example album */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="flex gap-md p-md">
            <img
              src="/Images/default_song_cover.png"
              alt=""
              className="w-24 h-24 rounded-md object-cover shrink-0"
            />
            <div className="flex flex-col justify-center gap-0.5 min-w-0">
              <p className="subtle text-[10px] uppercase tracking-wider">Example album</p>
              <h3 className="font-display text-lg leading-tight">A Day at the Lake House</h3>
              <p className="text-sm text-muted">9 songs · one voice</p>
            </div>
          </div>
          <div className="border-t border-border">
            {EXAMPLE_TRACKS.map((title, i) => (
              <div key={title} className="flex items-center gap-md px-md py-sm border-b border-border last:border-b-0">
                <span className="text-xs text-muted w-4 shrink-0">{i + 1}</span>
                <span className="text-sm flex-1 truncate">{title}</span>
                {i === 1 && <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Winner</span>}
              </div>
            ))}
            <div className="px-md py-sm text-xs text-muted">+ 6 more</div>
          </div>
        </div>

        <button
          type="button"
          className="secondary full-width"
          onClick={() => navigate('/roster')}
        >
          Pick the artist who records it
        </button>
      </section>

      <ContactForm />
    </div>
  );
}
