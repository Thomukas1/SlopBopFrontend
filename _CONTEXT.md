# SlopBop Frontend — App Context

## What It Is

SlopBop is a platform for AI-generated synthetic artists. The frontend is a mobile-first web app (430px design target) that serves as a public artist showcase. Currently, **thomukas1** is the featured artist used to demonstrate the concept.

The experience is closest to AI Spotify: browse artists, listen to their collections, and vote on songs. Songs are published server-side by the simulator and gated on the frontend by `sim.sim_time` — the day unfolds, releases drop as the cutoff advances.

The app has been reframed into a **simulation-first** view: a separate `SlopBopSimulator` (Python) produces a presimulated day per artist, and the frontend drip-feeds that day to viewers. The home page is now a full-screen **world map** that places artists and locations on a tile grid, so opening the site immediately reads as "a simulation you're watching a snapshot of." See "World Map" below.

---

## Routes

| Route | Component | Description |
|---|---|---|
| `/` | `MapPage` | Full-screen world map — the simulation view (home) |
| `/roster` | `RosterPage` | Artist directory with top-rated song per card |
| `/about` | `AboutPage` | Project blurb + footer |
| `/artists/:id` | `ArtistProfile` | Artist profile + discography |
| `/collections/:id` | `CollectionPage` | Album/EP view (tracklist) |

---

## Tech Stack

**Frontend**
- React 19, TypeScript, Vite
- Tailwind CSS 3 (utility classes in TSX; CSS files only for animations)
- React Router v7
- `@solana/wallet-adapter-react` + `@solana-mobile/wallet-standard-mobile` for wallet connect (Phantom, Solflare, MWA on mobile)
- Helius RPC for Solana connection (devnet or mainnet via `VITE_SOL_NETWORK` env)

**Backend** (external, TypeScript, Heroku)
- MongoDB for all data (artists, collections, songs)
- Arweave for audio file storage — only URLs are stored in MongoDB
- REST API under `/slopbop/` prefix
- Base URL configured via `VITE_API_URL` env var (defaults to `http://localhost:5000`)

**Song Generation** (local machine, Python)
- FastAPI server running locally on Thomas's machine (5090 GPU)
- Exposed via ngrok tunnel — only the backend can call it, authenticated via secret API key
- Pipeline: ACE-Step + voice LoRA + processing → uploads audio to Arweave → returns URL + metadata to backend

---

## Data Model

```ts
Artist     { _id, name, bio?, imageUrl?, socials? }
Collection { _id, artist_id, collection_type: 'Album'|'EP', title?, cover_url?, created_at? }
Song       { _id, artist_id, collection_id?, title?, duration?, cover_url?, audio_url?, lyrics?,
             caption?, bpm?, keyscale?, lora?, release_date?, created_at?, stats? }
SongStats  { bops, slops, total_votes }
```

---

## Feature Breakdown

### World Map (`/`)

The home page — a full-screen, top-down map that makes the simulation tangible: you see *where* each artist is in the world right now.

The backend gives every location and agent an integer tile coordinate (used server-side for distance / travel-turn maths). The frontend treats that grid as the layout. `src/features/map/grid.ts` is the **single source** of the grid↔pixel mapping: the board is *derived* from the locations (`computeBounds` — min/max tile + a `MARGIN_TILES` border, so there's never dead grid), then scaled with a CSS transform so the whole world is always visible at once, filling the viewport on any screen. Unlike the rest of the app, the map page is **not** clamped to the 430px column.

- **`MapPage`** — owns the fit-scale, splits agents into location occupants vs. loose markers, renders the weather chip, and owns the location/artist selection state.
- **`LocationIcon`** — emoji + name at its tile; shows a `👤 N` overlay when artists stand on it; tapping opens the panel.
- **`AgentMarker`** — an artist's avatar at their tile; tapping opens their `ArtistSheet`. Rendered only for artists on a *vacant* tile — artists on a location's tile are folded into that location's occupant count instead.
- **`LocationPanel`** — a `Modal` with the location name, description, and clickable artist strips; tapping a strip opens that artist's `ArtistSheet` (and closes the panel — the modal sits above the sheet's z-index).
- **`ArtistSheet`** — a `BottomSheet` for a tapped agent: identity row + "View Profile" link to `/artists/:id`, then a Status / Bars / Journal tab switcher over the artist's live simulation data. All sim-derived artist UI lives here, not on the profile page.
  - **`ArtistStatus`** — location, current action, the three stat bars (Energy / Focus / Inspiration) and carried items (resolved against `useWorldItems`) from the sim snapshot.
  - **`ArtistBars`** — the artist's song-idea notes on notebook-style lined paper (`bars-page.css`).
  - **`ArtistJournal`** — reverse-chronological journal of plans, intents, interactions, item uses and arrivals; resolves interaction/item emojis from `useWorldMap` / `useWorldItems`.
- **`GridLines`** — dev overlay (grid + margin shading), gated by `GRIDLINE_OPACITY` in `grid.ts`; set to 0 to hide.

Pan/zoom is intentionally deferred: the fit-scale *is* the default zoom level a future pan/zoom layer would start from.

### Roster (`/roster`)

A static artist directory — no sim data. Fetches all artists via `useArtists()` (calls `GET /slopbop/artists`). Each `ArtistCard` independently fetches the artist's songs via `useTopSong(artistId)`, which applies the same `release_date <= sim_time` gate as Discography and picks the highest net-score (`bops − slops`) track with a playable `audio_url`.

Card anatomy (top to bottom):
1. Full-width `aspect-video` artist image → `Link` to `/artists/:id`
2. Artist name band → also part of the Link
3. "Top Rated Song" label (accent colour) + inset `SingleCard` — tapping plays immediately via `MusicPlayerContext`; the pocket is `bg-surface-2` so it reads as nested inside the card

If an artist has no releasable songs, the song pocket is omitted. The "More artists announced soon" footer sits below the list.

Future: highlight artists currently in residency (i.e. present in the active sim's artist list) without restructuring — just pass an `isResident` bool into `ArtistCard` from `useSim()`.

### Artist Profile (`/artists/:id`)

Fetches artist, collections, and songs in parallel. Layout:

1. Full-width hero image (350px tall, `object-cover`)
2. Artist name overlapping the hero (pull-up with `-mt-[100px]`)
3. Frosted info card — collapsible bio + social icon links (Twitter/X, TikTok, Instagram)
4. Discography — Albums/EPs in a 2-column `CollectionCard` grid, standalone singles as a stacked `SingleCard` list

Songs are filtered by `release_date <= sim.sim_time` (fixed-width `"YYYY-MM-DDTHH:MM"`, lexicographic == chronological), then split via `useMemo`: songs with a `collection_id` are grouped under their collection; the rest are singles. Songs without a `release_date` are dropped (treated as unreleased) during the backfill window.

The singles section has a **New / Popular** sort toggle (button group, top-right of the section header). "New" sorts by `release_date` descending; "Popular" sorts by `bops − slops` descending.

Tapping a `CollectionCard` navigates to `/collections/:id`. Tapping a `SingleCard` calls `play()` on `MusicPlayerContext`.

**`SingleCard`** displays the song title on one line and approval rating + duration as a quieter metadata row below. Approval = `bops / total_votes × 100`; only shown when `total_votes > 0`. Emoji tiers: 💩 (0–39 %), 😪 (40–69 %), 🔥 (70–89 %), 🥶 (90–100 %). Duration stays right-aligned.

### Collection Page (`/collections/:id`)

Loads collection metadata + songs in parallel. Layout:

1. Full-width square cover art
2. Metadata — title, type, linked artist name, date
3. **Tracklist** — numbered rows, each taps to call `play()` on `MusicPlayerContext`. Songs gated by `release_date <= sim.sim_time` (same rule as Discography).

### Music Player

Global playback state in `MusicPlayerContext` — a persistent `HTMLAudioElement` ref, not recreated per track.

- **MiniPlayer** — sticky yellow bottom bar, visible when a track is loaded but player not expanded. Shows cover, title, play/pause, expand, close.
- **MusicPlayer** — full-screen view with cover art, title, play/pause, ±15s skip, seek slider, BopMeter, and lyrics.
- **BopMeter** — SLOP/BOP voting strip between the slider and lyrics. Reads `track.stats`, checks `localStorage` (`slopbop_votes` key) to prevent double-voting, calls `PATCH /msi/songs/:id/vote`.

---

## Auth Model

### Wallet Verification (challenge-response)
Used by the remaining wallet-gated actions (vote, admin check). Flow:
1. `useWalletVerification()` calls backend to get a challenge message + `challengeId`
2. User's wallet signs the message
3. Signature + challenge data sent alongside the API request; backend verifies server-side

### Admin Check
`useAdmin()` sends the connected wallet's public key to `POST /slopbop/admin/check`. Backend returns `{ isAdmin: boolean }` based on an allowlist.

---

## API Surface (Frontend → Backend)

All calls go through `apiFetch()` in `src/services/slopbop/client.ts` with base `VITE_API_URL`. Per-resource modules under `src/services/slopbop/` own their types and fetchers; `src/services/slopbop.ts` is a barrel that re-exports them.

| Call | Method | Endpoint | Module |
|---|---|---|---|
| Fetch artist | GET | `/slopbop/artist/:id` | `slopbop/artists` |
| Fetch artists | GET | `/slopbop/artists?limit=` | `slopbop/artists` |
| Fetch collections | GET | `/slopbop/collections?artist_id=&type=` | `slopbop/collections` |
| Fetch collection + songs | GET | `/slopbop/collections/:id` | `slopbop/collections` |
| Fetch songs (standalone) | GET | `/slopbop/songs?artist_id=` | `slopbop/songs` |
| Vote on song | PATCH | `/slopbop/songs/:id/vote` | `slopbop/songs` |
| Current sim | GET | `/slopbop/sim/current` | `slopbop/sim` |
| Artist notes | GET | `/slopbop/sim/:simId/artist/:artistId/notes` | `slopbop/sim` |
| Artist journal | GET | `/slopbop/sim/:simId/artist/:artistId/journal` | `slopbop/sim` |
| World map | GET | `/slopbop/world/map` | `slopbop/sim` |
| World items | GET | `/slopbop/world/items` | `slopbop/sim` |
| Admin check | POST | `/slopbop/admin/check` | `slopbop/admin` |
| Verification challenge | POST | `/slopbop/verification/challenge` | `slopbop/verification` |

---

## Context Providers (App-level)

Wrapping order in `main.tsx`:

```
BrowserRouter
  WalletContextProvider    ← Solana wallet (Phantom, Solflare, MWA)
    ToastProvider          ← global toast notifications
      SimProvider          ← shared sim snapshot (polled); read via useSim()
        MusicPlayerProvider  ← global audio playback state
          Header
          Routes
          MiniPlayer
          MusicPlayer
```

---

## Hooks Pattern

Read-hooks are thin wrappers over a generic `useResource<T>(fetcher, key, { onError?, pollMs? })` in `src/hooks/useResource.ts`. It owns the stale-response guard (`fetchKeyRef`), the loading state, and optional polling. `pollMs` accepts either a number or a function of the latest data (used by `useSimCurrent` to auto-stop polling once a past sim is loaded).

Wallet-gated mutation hooks (`useAdmin`, `useWalletAuth`) follow a separate command-shaped pattern and don't go through `useResource`.

## Simulation Plumbing

Types and fetchers in `src/services/slopbop/sim.ts`:

- `SimCurrent` — `{ simulation_id, date, weather, sim_time, environment, status, artists }`. Per-artist value is a `SnapshotState | null` (null = intro hasn't run yet). `environment` is `{ city, timezone, lat, lon }` (the sim's place, static for its life; null for legacy docs).
- `SnapshotState` — `{ location, position, current_action, current_target, busy_until, stats, items }`. `position` is a `[number, number]` tile or null; `stats` is a `Record<string, number>` (Energy / Focus / Inspiration); `items` is a `string[]` of owned item names, resolved against the item catalogue.
- `JournalEntry` — discriminated union on `type`: `plan | intent | interaction | item | arrival`. `intent.action` is `move | interact | item`; `item` entries share the `interaction` shape (`target, observation, outcome`).
- `Note` — `{ sim_time, note }`.
- `Location` — `{ _id, name, position, emoji, description, interactions }`; `interactions` is a map of `InteractionDef`. `WorldMap` is `Location[]`.
- `Item` — `{ name, emoji, description, duration_minutes, stat_effects, skill_use?, tool_use? }`; the global portable-item catalogue. `ItemCatalogue` is `Item[]`.
- Helper `isSimLive(sim)` — `sim.date === today` evaluated in the sim's own `environment.timezone` (falls back to UTC for legacy docs).

Hooks in `src/hooks/`:

- `useSimCurrent()` — fetches `/sim/current`, polls every 2 min while the sim is live, auto-stops once a past sim is loaded.
- `useSimArtistNotes(simId, artistId, { live? })` — notes for one artist; caller forwards `live` (typically `isSimLive(sim)` from `useSimCurrent`).
- `useSimArtistJournal(simId, artistId, { live? })` — same shape, returns journal entries.
- `useWorldMap()` — fetched once, cached at module scope with in-flight dedup.
- `useWorldItems()` — same pattern as `useWorldMap()`; the static item catalogue.
- `useTopSong(artistId)` — fetches songs for one artist (via `useSongs`), applies the sim_time gate, and returns the single highest net-score (`bops − slops`) track that has an `audio_url`. Returns `null` if none qualify. Used by the Roster's `ArtistCard`.

`SimContext` wraps `useSimCurrent()` so the snapshot is fetched/polled once and shared via `useSim()`. The **World Map** (`/`) consumes `useWorldMap()` plus that snapshot. All sim-derived artist UI (status, bars, journal) now lives in the map's `ArtistSheet`; the `ArtistProfile` page is purely static (hero, bio, discography).

## Key Files

| Path | Role |
|---|---|
| `src/main.tsx` | Bootstrap, providers, routing |
| `src/config/network.ts` | Solana network + Helius RPC config |
| `src/services/slopbop.ts` | Barrel re-exporting everything under `slopbop/` |
| `src/services/slopbop/client.ts` | `apiFetch` + base URL |
| `src/services/slopbop/{artists,collections,songs,admin,verification}.ts` | Per-resource types + fetchers |
| `src/services/slopbop/sim.ts` | Sim types + fetchers + `isSimLive` helper |
| `src/context/MusicPlayerContext.tsx` | Global audio state |
| `src/context/ToastContext.tsx` | Global toast state |
| `src/context/SimContext.tsx` | Shared sim snapshot (polled), exposed via `useSim()` |
| `src/hooks/useResource.ts` | Generic read-hook (stale-guard + polling) |
| `src/hooks/useAdmin.ts` | Admin wallet check |
| `src/hooks/useWalletAuth.ts` | Wallet signature flow |
| `src/hooks/useSim*.ts`, `useWorldMap.ts` | Simulation read-hooks |
| `src/hooks/useTopSong.ts` | Top-rated song per artist (used by Roster) |
| `src/features/map/` | World map home page — `MapPage`, `grid.ts`, icons, `LocationPanel` |
| `src/features/roster/` | Roster page — `RosterPage`, `ArtistCard` |
| `src/features/about/` | About page (project blurb + footer) |
| `src/features/artist_profile/` | Artist profile page + discography |
| `src/features/collection/` | Collection/album page |
| `src/features/music_player/` | MusicPlayer, MiniPlayer, BopMeter |
| `src/components/NavBar.tsx` | Bottom nav — Map, Roster, About tabs |
