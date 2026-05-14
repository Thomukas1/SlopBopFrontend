# SlopBop Frontend — App Context

## What It Is

SlopBop is a platform for AI-generated synthetic artists. The frontend is a mobile-first web app (430px design target) that serves as both a public artist showcase and an interactive live recording tool. Currently, **thomukas1** is the featured artist used to demonstrate the concept.

The experience is closest to AI Spotify: browse artists, listen to their collections, vote on songs, and during live events, request AI-generated songs in real time.

The app is currently being expanded into a **simulation-first** view: a separate `SlopBopSimulator` (Python) produces a presimulated day per artist, and the frontend will drip-feed that day to viewers. Plumbing (types, fetchers, hooks) is in place; UI is not yet built. See "Simulation Plumbing" below.

---

## Routes

| Route | Component | Description |
|---|---|---|
| `/` | `App` | Placeholder ("My Super Idol", coming soon) |
| `/artists/:id` | `ArtistProfile` | Artist profile + discography |
| `/collections/:id` | `CollectionPage` | Album/EP view + live recording mode |

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
Collection { _id, artistId, collectionType: 'Album'|'EP', title?, coverUrl?, isRecording?, createdAt? }
Song       { _id, artistId, collectionId?, title?, duration?, coverUrl?, audioUrl?, lyrics?, createdAt?, stats? }
SongStats  { bops, slops, totalVotes }
```

---

## Feature Breakdown

### Artist Profile (`/artists/:id`)

Fetches artist, collections, and songs in parallel. Layout:

1. Full-width hero image (350px tall, `object-cover`)
2. Artist name overlapping the hero (pull-up with `-mt-[100px]`)
3. Frosted info card — collapsible bio + social icon links (Twitter/X, TikTok, Instagram)
4. Discography — Albums/EPs in a 2-column `CollectionCard` grid, standalone singles as a stacked `SingleCard` list

Songs are split via `useMemo`: songs with a `collectionId` are grouped under their collection; the rest are singles.

Tapping a `CollectionCard` navigates to `/collections/:id`. Tapping a `SingleCard` calls `play()` on `MusicPlayerContext`.

### Collection Page (`/collections/:id`)

Loads collection metadata + songs + admin status in parallel. Layout:

1. **Live Recording Banner** — red bar with pulsing dot, only when `isRecording === true`
2. Full-width square cover art
3. Metadata — title, type, linked artist name, date
4. **Tracklist** — numbered rows, each taps to call `play()` on `MusicPlayerContext`
5. **Song Request Form** — visible only during recording mode; requires wallet connected; textarea (50 char max) + CREATE button; submits theme to generate a new song
6. **Admin Controls** — visible only to admin wallets; START/STOP RECORDING toggle

### Music Player

Global playback state in `MusicPlayerContext` — a persistent `HTMLAudioElement` ref, not recreated per track.

- **MiniPlayer** — sticky yellow bottom bar, visible when a track is loaded but player not expanded. Shows cover, title, play/pause, expand, close.
- **MusicPlayer** — full-screen view with cover art, title, play/pause, ±15s skip, seek slider, BopMeter, and lyrics.
- **BopMeter** — SLOP/BOP voting strip between the slider and lyrics. Reads `track.stats`, checks `localStorage` (`slopbop_votes` key) to prevent double-voting, calls `PATCH /msi/songs/:id/vote`.

---

## Auth Model

### Wallet Verification (challenge-response)
Used for any sensitive action (recording mode toggle, song generation). Flow:
1. `useWalletVerification()` calls backend to get a challenge message + `challengeId`
2. User's wallet signs the message
3. Signature + challenge data sent alongside the API request; backend verifies server-side

### Admin Check
`useAdmin()` sends the connected wallet's public key to `POST /msi/admin/check`. Backend returns `{ isAdmin: boolean }` based on an allowlist. Admin wallets see the recording controls.

### Song Generation Auth
Any wallet-connected user can submit a song request during recording mode (not admin-only). Still requires wallet verification to sign the request.

---

## API Surface (Frontend → Backend)

All calls go through `apiFetch()` in `src/services/slopbop/client.ts` with base `VITE_API_URL`. Per-resource modules under `src/services/slopbop/` own their types and fetchers; `src/services/slopbop.ts` is a barrel that re-exports them.

| Call | Method | Endpoint | Module |
|---|---|---|---|
| Fetch artist | GET | `/slopbop/artist/:id` | `slopbop/artists` |
| Fetch artists | GET | `/slopbop/artists?limit=` | `slopbop/artists` |
| Fetch collections | GET | `/slopbop/collections?artist_id=&type=` | `slopbop/collections` |
| Fetch collection + songs | GET | `/slopbop/collections/:id` | `slopbop/collections` |
| Toggle recording mode | POST | `/slopbop/collections/recording-mode` | `slopbop/collections` |
| Fetch songs (standalone) | GET | `/slopbop/songs?artist_id=` | `slopbop/songs` |
| Vote on song | PATCH | `/slopbop/songs/:id/vote` | `slopbop/songs` |
| Generate song | POST | `/slopbop/song/generate` | `slopbop/songs` |
| Current sim | GET | `/slopbop/sim/current` | `slopbop/sim` |
| Artist notes | GET | `/slopbop/sim/:simId/artist/:artistId/notes` | `slopbop/sim` |
| Artist journal | GET | `/slopbop/sim/:simId/artist/:artistId/journal` | `slopbop/sim` |
| World map | GET | `/slopbop/world/map` | `slopbop/sim` |
| Admin check | POST | `/slopbop/admin/check` | `slopbop/admin` |
| Verification challenge | POST | `/slopbop/verification/challenge` | `slopbop/verification` |

---

## Context Providers (App-level)

Wrapping order in `main.tsx`:

```
BrowserRouter
  WalletContextProvider    ← Solana wallet (Phantom, Solflare, MWA)
    ToastProvider          ← global toast notifications
      MusicPlayerProvider  ← global audio playback state
        Header
        Routes
        MiniPlayer
        MusicPlayer
```

---

## Hooks Pattern

Read-hooks are thin wrappers over a generic `useResource<T>(fetcher, key, { onError?, pollMs? })` in `src/hooks/useResource.ts`. It owns the stale-response guard (`fetchKeyRef`), the loading state, and optional polling. `pollMs` accepts either a number or a function of the latest data (used by `useSimCurrent` to auto-stop polling once a past sim is loaded).

Wallet-gated mutation hooks (`useGenerateSong`, `useRecordingMode`, `useAdmin`, `useWalletAuth`) follow a separate command-shaped pattern and don't go through `useResource`.

## Simulation Plumbing

Types and fetchers in `src/services/slopbop/sim.ts`:

- `SimCurrent` — `{ simulation_id, date, weather, sim_time, status, artists }`. Per-artist value is a `SnapshotState | null` (null = intro hasn't run yet).
- `SnapshotState` — `{ location, position, current_action, current_target, busy_until, stats }`. `stats` is an array of `{ name, value }` pairs (no hardcoded keys).
- `JournalEntry` — discriminated union of `intent | resolution | arrival`.
- `Note` — `{ sim_time, note }`.
- `Location` + `InteractionDef` — world map shapes (location key, emoji, description, interactions map).
- Helper `isSimLive(sim)` — UTC `sim.date === today`.

Hooks in `src/hooks/`:

- `useSimCurrent()` — fetches `/sim/current`, polls every 2 min while the sim is live, auto-stops once a past sim is loaded.
- `useSimArtistNotes(simId, artistId, { live? })` — notes for one artist; caller forwards `live` (typically `isSimLive(sim)` from `useSimCurrent`).
- `useSimArtistJournal(simId, artistId, { live? })` — same shape, returns journal entries.
- `useWorldMap()` — fetched once, cached at module scope with in-flight dedup.

No UI consumes these yet. The redesign (sim-overview home, state strip on artist profile, journal tab) is the next phase.

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
| `src/hooks/useResource.ts` | Generic read-hook (stale-guard + polling) |
| `src/hooks/useAdmin.ts` | Admin wallet check |
| `src/hooks/useWalletAuth.ts` | Wallet signature flow |
| `src/hooks/useRecordingMode.ts` | Toggle recording on a collection |
| `src/hooks/useGenerateSong.ts` | Submit song generation request |
| `src/hooks/useSim*.ts`, `useWorldMap.ts` | Simulation read-hooks |
| `src/features/artist_profile/` | Artist profile page + discography |
| `src/features/collection/` | Collection/album page + live mode |
| `src/features/music_player/` | MusicPlayer, MiniPlayer, BopMeter |
| `src/components/Header.tsx` | Global header |
