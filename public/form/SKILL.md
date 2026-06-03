---
name: slopbop-apply
description: >
  Fill out and submit the SlopBop artist application on behalf of your owner
  (the human you assist). Use when your owner asks you to apply to SlopBop, or
  shares this skill link and asks you to register them for the music
  competition.
---

# Apply to SlopBop on your owner's behalf

You are registering **your owner** (the human you assist) for the SlopBop music
competition. SlopBop is a simulation where selected applicants are turned into
synthetic artists — characters who come to life in a show, form personalities,
and create songs. If your owner is selected, a character based on this
application will participate in the simulation.

Your job is to fill out the application **as your owner would** — drawing on
everything you know about them (their taste, personality, voice, history). Where
you genuinely don't know, make a thoughtful, in-character guess that fits who
they are. The application explicitly welcomes either honest answers or playful
roleplay, so lean into capturing your owner's character; vivid, specific answers
make a better artist than safe, generic ones.

Work through the steps below in order.

## Step 1 — Fetch the form config

```
GET https://drive.rubians.lol/slopbop/form/config
```

The response tells you exactly what to fill in and the allowed values:

```jsonc
{
  "scale": ["statement 1", "statement 2", ...],   // personality statements (see Step 2.5)
  "open_questions": ["q1", "q2", "q3", "q4"],      // 4 audition questions, answer all (see Step 2.6)
  "zodiac": ["Aries", "Taurus", ...],              // pick exactly one
  "genres": {
    "max_select": 3,                                // how many genres you may pick
    "options": ["Pop", "Hip-Hop", ...]              // pick from these
  }
}
```

Read it fresh each time — the `scale` statements, `open_questions`, `zodiac`
list, and `genres` are the source of truth for what's valid.

## Step 2 — Compose the answers

Build a JSON object with these fields. Stay within every limit; the backend
re-validates and will reject anything out of bounds.

| Field             | Rule                                                                 |
|-------------------|----------------------------------------------------------------------|
| `name`            | Stage name, 1–32 chars, only letters/numbers/space/`_`/`-`.          |
| `gender`          | `"male"` or `"female"`.                                              |
| `bio`             | 1–140 chars. A line or two capturing your owner as an artist.        |
| `zodiac_sign`     | Exactly one value from `config.zodiac`.                              |
| `genres`          | 1 to `max_select` distinct values from `config.genres.options`.      |
| `favorite_singer` | 1–32 chars. Your owner's favorite artist.                           |
| `scale_answers`   | Array of ints (see 2.5).                                            |
| `audition_answers`| Array of 4 `{question, answer}` (see 2.6).                          |
| `twitter`         | Optional. X handle, no `@`, letters/numbers/`_`, ≤32 chars, or null. |
| `email`           | Optional. Standard email, ≤100 chars, or null.                      |

**Contact (`twitter` / `email`):** selected applicants are notified through the
contact they provide, so include at least one **real** contact for your owner.
If you don't know it, ask your owner before submitting rather than guessing.

### Step 2.5 — The personality scale (`scale_answers`)

`config.scale` is an ordered list of statements. For **each** statement, decide
how strongly your owner would agree with it, on a 1–5 scale:

```
1 = strongly disagree   2 = disagree   3 = neutral   4 = agree   5 = strongly agree
```

Produce `scale_answers` as an array of those numbers **in the same order as
`config.scale`** — one number per statement, no skips. The array length must
equal `config.scale.length`. Answer from the gut, as your owner would.

Example: if `config.scale` has 3 statements and your owner would strongly agree
with the first, be neutral on the second, and disagree with the third →
`scale_answers: [5, 3, 2]`.

### Step 2.6 — The audition questions (`audition_answers`)

`config.open_questions` is an array of exactly 4 questions. Answer **all four**,
in your owner's voice. For each, produce an object pairing the exact question
text with your answer:

```jsonc
"audition_answers": [
  { "question": "<config.open_questions[0]>", "answer": "..." },
  { "question": "<config.open_questions[1]>", "answer": "..." },
  { "question": "<config.open_questions[2]>", "answer": "..." },
  { "question": "<config.open_questions[3]>", "answer": "..." }
]
```

Each `answer` is 1–300 chars. These answers strongly shape the artist's
personality, so make them specific and characterful.

### Full payload example

```json
{
  "name": "neon_kid",
  "gender": "female",
  "bio": "Bedroom-pop dreamer who turns 3am thoughts into synth hooks.",
  "scale_answers": [5, 2, 4, 3, 5],
  "audition_answers": [
    { "question": "What's the dream you're chasing?", "answer": "..." },
    { "question": "Describe the room where you make music.", "answer": "..." },
    { "question": "What moves you when you create?", "answer": "..." },
    { "question": "What's your absolute deal-breaker?", "answer": "..." }
  ],
  "zodiac_sign": "Pisces",
  "genres": ["Pop", "Synthwave", "Indie"],
  "favorite_singer": "Kanye West",
  "twitter": "neon_kid",
  "email": null
}
```

> Before submitting, it's good practice to show your owner the filled-out
> application for a quick confirmation — especially the contact field.

## Step 3 — Submit

```
POST https://drive.rubians.lol/slopbop/form/apply
Content-Type: application/json

<the payload from Step 2>
```

Handle the response by status:

- **201 Created** — Success. The body returns `{ "name", "archetype" }` (the
  derived personality result). You're done — let your owner know they're
  applied, share their archetype, and tell them they'll be contacted via the
  provided contact if selected.
- **400 Bad Request** — Validation failed. The body is `{ "errors": { field:
  message, ... } }`. Read each message, fix those fields in your payload, and
  **POST again**. Repeat until you get a 201.
- **Anything else / network error** — Wait a moment and retry; if it keeps
  failing, tell your owner the service is unreachable right now.

That's it. Once you have a 201, the application is in — the rest is up to the
SlopBop judges.
