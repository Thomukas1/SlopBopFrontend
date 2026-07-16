import type { FAQEntry } from '../../primitives/FAQ';

// Four, deliberately. Everything a buyer needs to *get it* is on the page as
// prose; this is only what they'd still object to after reading it — effort,
// the "I'm not creative" fear, the "team stuff always flops" reflex, and the
// shape of the day. Anything the page already answers (the artist, the prize,
// group size, what you walk away with) is not repeated here. Cost stays off the
// page: inbound only, no price list, handled over email.
export const COMMISSION_FAQ_ITEMS: FAQEntry[] = [
  {
    question: 'How much work is this for me?',
    answer:
      'Almost none. Pick a date and get your people in one room for the first hour. I run the workshop myself, the artist does the rest, and the songs arrive on their own through the day.',
  },
  {
    question: 'Do we need to be any good at writing?',
    answer:
      "No, and it's usually better if you're not. It's four lines and 30 seconds. The songs people still quote months later tend to come from whoever swore they weren't creative right up until the room heard theirs.",
  },
  {
    // The bonding answer — the reason anyone books a second time. It lived on
    // the page as its own section until the prize took that slot; it reads
    // fine here, because by this point the reader knows how a day works.
    question: 'Why does this work when the usual team stuff falls flat?',
    answer:
      "Because nobody's asked to bond. Being told to connect on command is exactly what kills the usual stuff. Here you just write a stupid little song, and it comes out about your people: the running joke, the thing that happened at lunch. Then you hear it sung back and the room reacts. The artist isn't real. What happens in the room is.",
  },
  {
    question: 'How long does the day take?',
    answer:
      'One hour of workshop up front, then it runs in the background for the rest of the day. Six hours end to end is typical. Nobody has to sit and watch it happen.',
  },
];
