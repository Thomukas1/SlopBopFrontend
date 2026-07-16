import { useState } from 'react';
import { FAQ } from '../../primitives/FAQ';
import { useArtists } from '../../hooks/useArtists';
import { ArtistCarousel } from './ArtistCarousel';
import { ExampleAlbum } from './ExampleAlbum';
import { PrizeVideo } from './PrizeVideo';
import { ContactForm } from './ContactForm';
import { COMMISSION_FAQ_ITEMS } from './commission-faq-data';

// How a day runs, as three plain beats — the mechanic without the clutter.
const FLOW: { title: string; body: string }[] = [
  {
    title: 'Everyone writes one song',
    body: 'One hour up front: meet the artist, learn how a 30-second song actually works, write yours. No experience, no talent required. It’s the only thing anyone asks of you all day.',
  },
  {
    title: 'Songs drop on a schedule',
    body: 'The artist records them and releases them one at a time, each with a countdown to the next. Waiting turns into anticipation instead of a queue.',
  },
  {
    title: 'Listen, react, vote',
    // The prize used to be a trailing clause here. It's the payoff, so it gets
    // its own section further down; this beat just hands off to it.
    body: 'Every drop, someone puts it on for the room. Guess who wrote it. Slop or Bop. By the end the votes have decided which song won the day.',
  },
];

export default function CommissionPage() {
  const { artists } = useArtists();
  // Index rather than an id: the first artist is featured by default, and the
  // list is only known once it loads.
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedArtist = artists[selectedIndex];

  return (
    <div className="flex flex-col gap-3xl pb-2xl">
      {/* Hero — image and eyebrow only. Mood, nothing to read yet. */}
      <header className="flex flex-col">
        <img src="/Branding/contact-visual.png" alt="" className="w-full block" />
        <div className="px-md pt-md">
          <p className="eyebrow">Hire an artist for the day</p>
        </div>
      </header>

      {/* The TL;DR — carries the page's h1. The one idea the whole pitch rests
          on: this is a layer on top of a day you've already planned, not a day
          you have to give up. "Whatever your group already has planned" is the
          load-bearing clause — it makes an offsite and a camping trip the same
          sentence without listing use cases. Ends by naming the artifact, which
          the album below then makes real. */}
      <section className="flex flex-col gap-md px-md">
        <h1 className="font-display text-3xl leading-tight">It runs on top of your day</h1>
        <p className="text-base leading-relaxed">
          Whatever your group already has planned — an offsite, a hackathon, a weekend at the lake —
          this runs alongside it. One hour in the morning, everyone writes one short song. The
          artist records them all in a voice that's unmistakably theirs and drops them one at a time
          while you get on with everything else. By the evening there's an
          <span className="highlight"> album</span> that didn't exist that morning.
        </p>
      </section>

      {/* The artifact, made real — and the first thing on the page you can touch
          rather than read. Sits here, right where the TL;DR names it, instead of
          down by the carousel: the two interactive blocks are the page's visual
          breaks, so they're deliberately at opposite ends of the prose. The line
          underneath is the emotional read of what you just heard. */}
      <section className="flex flex-col gap-lg px-md">
        <ExampleAlbum />
        <p className="text-base leading-relaxed">
          One song per person, all in the same voice. Not a prompt anyone typed — lyrics they wrote,
          sung by an artist with a real voice, played to a room that had opinions about it. People
          who'll tell you flat out they aren't creative walk out quietly
          <span className="highlight"> proud</span> of three lines they wrote before lunch.
        </p>
      </section>

      {/* How the day flows. No subhead — the TL;DR now carries the "ambient"
          idea, so this section just has to explain the mechanic. The card binds
          the three beats and the group size into one block: the whole shape of
          a day, spec sheet and all, in a single frame. */}
      <section className="flex flex-col gap-lg px-md">
        <h2 className="font-display text-lg">How the day goes</h2>
        <div className="frosted-card !p-lg flex flex-col">
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

          {/* The GPU throughput ceiling (~6–20 songs/day), as a plain spec line
              closing the card — the last thing read before the FAQ is a
              concrete fit check. */}
          <div className="frosted-card-divider-h !my-lg" />
          <div className="flex flex-col gap-xs">
            <p className="eyebrow">Recommended group size</p>
            <p className="font-display text-2xl">🧑 10–15</p>
          </div>
        </div>
      </section>

      {/* The prize — the page's crescendo, and the only part of the day that
          leaves the room. Placed last before the FAQ so the pitch escalates
          into it, and it does double duty: it's the stakes that make a Slop or
          Bop vote worth arguing about, and it's the reach that justifies the
          spend to a community's marketing budget. The video is the proof. */}
      <section className="flex flex-col gap-lg px-md">
        <div className="flex flex-col gap-md">
          <h2 className="font-display text-lg">One song gets a music video</h2>
          <p className="text-base leading-relaxed">
            That's what the voting is for. Whichever track your group backs hardest gets made into a
            real music video and published on our channels — the same ones every other Slop Bop
            release goes out on. It's the one thing from the day that
            <span className="highlight"> leaves the room</span>, and the reason a Slop or Bop vote at
            3pm is worth arguing about.
          </p>
        </div>

        <PrizeVideo />
      </section>

      {/* The detail, opt-in — anything that would clog the page as prose. Above
          the ask on purpose: objections get answered before you're asked to
          write, and the form gets to be the last thing on the page. */}
      <FAQ items={COMMISSION_FAQ_ITEMS} title="Frequent questions" />

      {/* The ask — and the artist is the star, not a form control. It used to
          open on a bare "Pick an artist" eyebrow, which made the roster read as
          a dropdown next to the email field; the heading and framing make this
          the last emotional beat before the send button instead. Tap an
          artist's top song and the player keeps going while you write, so
          choosing and writing stay one act. */}
      <section className="flex flex-col gap-lg px-md">
        <div className="flex flex-col gap-md">
          <h2 className="font-display text-lg">Who you're hiring</h2>
          <p className="text-base leading-relaxed">
            Each artist is a character, not a filter — a fixed personality, a face, a real singing
            voice, a taste in music. One artist records your whole album start to finish, which is
            why it comes out sounding like a
            <span className="highlight"> record</span> instead of a song generator. Pick the one your
            group would actually want to hear.
          </p>
        </div>

        <ArtistCarousel
          artists={artists}
          index={selectedIndex}
          onIndexChange={setSelectedIndex}
        />

        <ContactForm selectedArtistName={selectedArtist?.name} />
      </section>
    </div>
  );
}
