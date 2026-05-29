# SlopBop Frontend — Overview

A mobile-first React SPA (430px design target) that serves as the public-facing window into the SlopBop simulation. The app has two jobs: let people watch a simulation unfold in real time, and let them browse the music those artists have released.

For technical detail (routes, hooks, components, API surface) see `_CONTEXT.md`. This document covers the conceptual architecture and the decisions behind it.

---

## Mental Model

The app holds two distinct data layers and keeps them deliberately separate:

**Static layer** — who the artists are. Profiles, bios, discographies, cover art. This data is permanent and not tied to any simulation. It lives in the `artists`, `collections`, and `songs` MongoDB collections and is fetched directly.

**Live layer** — what the artists are doing today. Location on the map, simulation stats (Energy / Focus / Inspiration), journal entries, song-idea notes. This data is simulation-scoped and ephemeral. It lives in the `simulations` collection and is fetched through the sim endpoints.

These two layers power two distinct parts of the UI:

| UI surface | Data layer | Entry point |
|---|---|---|
| World Map (`/`) + ArtistSheet | Live (sim) | Landing page |
| Roster (`/roster`) | Static | NavBar |
| Artist Profile (`/artists/:id`) | Static | Map sheet or Roster card |

A user lands on the simulation, finds an artist on the map, inspects their live state in the bottom sheet, then optionally navigates to their static profile to listen to music. The sim is the primary door; the roster is a secondary one for users who want to browse artists and hear music directly without engaging the map first.

---

## Simulation-First Architecture

The home page is the world map, not an artist listing or a music browser. This is intentional: the product concept is a simulation you are watching, not a catalog you are browsing. Dropping users onto the map makes that premise legible immediately — something is happening, artists are somewhere, time is passing.

The simulation is the primary context. Artists exist within a simulation; their music was released during a simulation. The static profile is downstream of the sim, not parallel to it.

The current UX problem to solve is **orientation** — a first-time visitor needs a sentence of context to make the map legible before they engage with it. The fix is an ambient label or brief onboarding moment, not a restructure.

---

## The Drip-Feed Mechanic

The simulation runs ahead of time and the frontend reveals it progressively. Everything gated by time — songs on the artist profile, entries in the journal, notes in the bars tab — is filtered by `sim_time`, the cutoff resolved by the backend. Nothing from the future leaks through.

`SimContext` holds the current sim snapshot and polls every 2 minutes while the sim is live. The rest of the app reads from this shared context via `useSim()` rather than each fetching independently. This is the heartbeat of the live layer.

---

## ArtistSheet: Where Live and Static Meet

The `ArtistSheet` (bottom sheet, opened by tapping an artist on the map) is the only surface that shows live simulation data about an artist. It has three tabs:

- **Status** — location, current action, stat bars, carried items
- **Bars** — song-idea notes the artist wrote in their notebook during the sim
- **Journal** — reverse-chronological log of everything the artist did (plans, intents, interactions, arrivals)

The "View Profile" link in the sheet navigates to the static artist profile. That profile has no simulation data on it — no stats, no journal. The separation is strict: live data stays on the map, static data stays on the profile.

---

## Music Player

Global playback state lives in `MusicPlayerContext` — a single persistent `HTMLAudioElement`, not recreated per track. Songs can be played from the artist profile, the collection page, or directly from a Roster card (which surfaces each artist's top-rated track as a one-tap shortcut). The MiniPlayer (sticky bottom bar) and full MusicPlayer overlay both read from this shared context.

Song visibility is gated by `release_date <= sim.sim_time`, using lexicographic comparison on the naive `YYYY-MM-DDTHH:MM` string format. Songs without a `release_date` are treated as unreleased and hidden.

---

## Routing

```
/                  MapPage         — simulation home, world map
/roster            RosterPage      — artist directory + top-rated song per artist
/about             AboutPage       — project explainer
/artists/:id       ArtistProfile   — static profile + discography
/collections/:id   CollectionPage  — album/EP tracklist
```

No simulation data appears on `/roster`, `/artists/:id`, or `/collections/:id`. Those routes are purely static.

---

## Key Architectural Decisions

**Simulation loads once, shared via context.** `SimContext` fetches `/sim/current` at boot and polls while live. All map + sheet components consume this via `useSim()`. The world map and the sheet don't compete for the same data.

**Static artist data fetched per page.** Profile and collection pages fetch their own data independently. There is no global artist cache — each route is self-contained.

**World map and item catalogue cached at module scope.** `useWorldMap` and `useWorldItems` are fetched once per session with in-flight dedup. They're static for a season.

**No time-scrubbing UI yet.** The backend supports `GET /sim?at=` for arbitrary cutoffs, but the frontend always uses `/sim/current`. Time scrubbing is a future feature.

**Pan/zoom deferred.** The map uses a CSS fit-scale (`grid.ts` → `computeBounds`) to make the whole world visible at once. Future pan/zoom would start from this as the default zoom level.
