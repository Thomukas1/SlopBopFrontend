# SlopBop Frontend — Overview

A mobile-first React SPA (430px design target) that serves as the public-facing window into the SlopBop simulation. The app has two jobs: let people watch a simulation unfold in real time, and let them browse the music those artists have released.

For technical detail (routes, hooks, components, API surface) see `_CONTEXT.md`. This document covers the conceptual architecture and the decisions behind it.

---

## Mental Model

The app holds two distinct data layers and keeps them deliberately separate:

**Static layer** — who the artists are. Profiles, bios, discographies, cover art, released music. This data is permanent and not tied to any simulation. It lives in the `artists`, `collections`, and `songs` MongoDB collections and is fetched directly. It is the bulk of the app and the default experience.

**Live layer** — what the artists are doing today. Location on the map, simulation stats (Energy / Focus / Inspiration), journal entries, song-idea notes. This data is simulation-scoped and ephemeral. It lives in the `simulations` collection and is fetched through the sim endpoints. It is **entirely contained within the Map page** — nothing outside `/map` touches the sim.

These two layers power two distinct parts of the UI:

| UI surface | Data layer | Entry point |
|---|---|---|
| About (`/`) | Static | Landing page |
| Roster (`/roster`) | Static | NavBar |
| Artist Profile (`/artists/:id`) | Static | Roster card |
| World Map (`/map`) + ArtistSheet | Live (sim) | NavBar (Map tab) |

A user lands on the About page, browses the roster, and listens to artists' music — all static, no simulation involved. The Map is a self-contained destination they can step into to watch a simulation unfold in real time; stepping off it tears the sim back down. The two layers meet only inside the ArtistSheet ("View Profile" links from the live map to the static profile), never the other way around.

---

## Static-First, Sim-Contained Architecture

The home page is the About page, and the roster + profiles + music are all static — the default experience is browsing artists and their catalogue, no simulation required. This is intentional: the music and the artists are permanent, the simulation is one live event layered on top.

The **Map is a self-contained simulation page**, reached from the NavBar. It owns the entire live layer: `SimProvider` mounts on `/map` and nowhere else, so the `/sim/current` heartbeat only runs while the map is on screen and stops the moment you leave. The static surfaces (roster, profile, album) never read the sim — their artists come straight from the `artists` collection and their songs are always visible, independent of any sim clock.

The layers meet in exactly one direction: the ArtistSheet on the live map links out to a static profile. The static side has no knowledge of the sim.

---

## The Drip-Feed Mechanic

The simulation runs ahead of time and the frontend reveals it progressively. The live-layer streams gated by time — entries in the journal, notes in the bars tab — are filtered by `sim_time`, the cutoff resolved by the backend. Nothing from the future leaks through. (Songs are **not** part of this: the static music catalogue is always fully visible, decoupled from the sim clock.)

`SimContext` holds the current sim snapshot and polls every 2 minutes while the sim is live. Its provider is mounted by the Map page alone, so only the map's components read it via `useSim()`. This is the heartbeat of the live layer, and it beats only while you're watching the map.

---

## ArtistSheet: Where Live and Static Meet

The `ArtistSheet` (bottom sheet, opened by tapping an artist on the map) is the only surface that shows live simulation data about an artist. It has three tabs:

- **Status** — location, current action, stat bars, carried items
- **Bars** — song-idea notes the artist wrote in their notebook during the sim
- **Journal** — reverse-chronological log of everything the artist did (plans, intents, interactions, arrivals)

The "View Profile" link in the sheet navigates to the static artist profile. That profile has no simulation data on it — no stats, no journal. The separation is strict: live data stays on the map, static data stays on the profile.

---

## Music Player

Global playback state lives in `MusicPlayerContext` — a single persistent `HTMLAudioElement`, not recreated per track. Songs can be played from the artist profile, the album page, or directly from a Roster card (which surfaces each artist's top-rated track as a one-tap shortcut). The MiniPlayer (sticky bottom bar) and full MusicPlayer overlay both read from this shared context.

All catalogue songs are always visible — playback is a pure static-layer concern with no sim gating. `release_date` remains on the `Song` type as catalogue metadata and a sort key, but nothing filters on it.

---

## Images & Media Loading

Cover art, artist photos, and album images are the heaviest thing the app loads. They live on **Arweave** (a decentralized, permanent store) and are served through the **`turbo-gateway.com`** gateway. Two facts drive the whole strategy: we **can't set response headers** on them (no `Cache-Control`, no server-side resize — it's not our server), and Arweave is **immutable and content-addressed** — a given URL's bytes can *never* change.

The download size itself is fixed at **upload time**, not here. The upload pipeline saves images as 1024×1024 WebP (not 2048 PNG), which is the only place bytes actually get smaller. **The frontend cannot shrink a download** — a browser must fetch the whole file before it can show it. So the frontend solves the two things it *can*: how the wait feels, and never waiting twice.

**Perceived speed — the `Img` primitive (`src/primitives/Img.tsx`).** Every remote image renders through `Img`, not a raw `<img>`. It decodes off-thread (`decoding="async"`) and fades the whole image in at once over a shimmer placeholder — killing the "image reveals slowly from the top" effect on slow connections. It also lazy-loads (offscreen grid/list images don't fetch until scrolled to) and reveals correctly for already-cached images. Styling lives in `src/styles/components/image.css`. It splits classes: `className` sizes the frame (aspect/rounding), `imgClassName` handles object-fit. This is *perceived* speed only — it does not reduce bytes. (It accepts an optional `placeholderSrc` for a true blurred low-res preview, unused today.)

**Never waiting twice — the service worker (`vite.config.ts`, via `vite-plugin-pwa`).** A generated service worker intercepts every `turbo-gateway.com` request and serves it **CacheFirst** from the browser's Cache API. Because Arweave content is immutable, "cache forever, serve from cache" is completely safe — there is no staleness risk, ever — which is exactly why this is worth doing here and would be dangerous against a mutable server. First load hits the network; every load after is instant and offline-capable. This is the decentralized-storage equivalent of the `Cache-Control` header we can't set. It's off during `vite dev` (so it never serves stale assets while developing) and auto-updates on deploy.

**If media storage ever changes**, the only coupling is the `IMAGE_HOST` regex at the top of `vite.config.ts` — point it at the new gateway/host and nothing else changes. The `Img` component and every call site stay identical, because the service worker intercepts at the network layer, below React.

---

## The Application Form

`/apply` is the audience's way *into* the show — a form to audition as a contestant for a future season. With song voting, it's one of only two surfaces that write rather than read.

The form's content — the personality questions, the audition prompts, the option lists — is **served by the backend**, not hardcoded here. The frontend fetches a config once and renders the form's tiers from it, so the question bank changes without a frontend deploy. On submit, the backend is the trust boundary: it validates, derives the applicant's archetype, and returns it for a thank-you screen. The frontend mirrors the validation rules for instant feedback, but they're owned server-side.

This is the front of the casting funnel. Everything downstream of a validated submission — screening, selection, turning a chosen application into a simulation artist — happens off the frontend entirely.

---

## Routing

```
/                  AboutPage       — project explainer, the landing page
/about             AboutPage       — alias of /
/roster            RosterPage      — artist directory + top-rated song per artist
/map               MapPage         — self-contained live simulation, world map
/apply             ApplicationForm — audition form to join a future season
/artists/:id       ArtistProfile   — static profile + discography
/albums/:id        AlbumPage       — album/EP tracklist
```

The simulation lives entirely on `/map`. Every other route is purely static (or, for `/apply`, write-only) and never mounts `SimProvider` or reads `useSim()`.

---

## Key Architectural Decisions

**Simulation is scoped to the Map page.** `SimProvider` mounts on `/map`, fetches `/sim/current`, and polls while live; all map + sheet components consume it via `useSim()`. Leaving `/map` unmounts the provider and stops the heartbeat, so the sim never loads on the static routes.

**Static artist data fetched per page.** Profile and collection pages fetch their own data independently. There is no global artist cache — each route is self-contained.

**World map and item catalogue cached at module scope.** `useWorldMap` and `useWorldItems` are fetched once per session with in-flight dedup. They're static for a season.

**No time-scrubbing UI yet.** The backend supports `GET /sim?at=` for arbitrary cutoffs, but the frontend always uses `/sim/current`. Time scrubbing is a future feature.

**Pan/zoom deferred.** The map uses a CSS fit-scale (`grid.ts` → `computeBounds`) to make the whole world visible at once. Future pan/zoom would start from this as the default zoom level.

**Media is cached client-side, not server-side.** Images come from Arweave via `turbo-gateway.com`, whose headers we don't control — but its content is immutable, so a CacheFirst service worker (`vite.config.ts`) caches it forever, safely. The `Img` primitive handles perceived speed on top. See *Images & Media Loading*.

**Styling is a token-driven hybrid.** Tailwind utilities for the everyday (layout, spacing, one-offs); central CSS under `src/styles/` for animations and reusable components with real visual identity, all reading the same design tokens in `theme.css` so a retheme is a palette swap. The operational "which do I use when" rule lives in `CLAUDE.md`; the decision here is that both exist on purpose and share one token source — they are not two competing systems.
