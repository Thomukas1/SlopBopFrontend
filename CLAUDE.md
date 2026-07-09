# SlopBop Frontend

Mobile-first React web app (430px design target) — the public window into SlopBop. The conceptual architecture and the *why* live in `OVERVIEW.md`; this file is the orientation map for working in the code.

## Current focus

The product has narrowed to its breakout feature: **group album creation** ("Creative Bootcamp"). A host rents one of our synthetic artists for a private activity with a group (friends, a community, a small firm — ~10–15 people); everyone writes lyrics for a short song, the artist records them, and the songs release one-by-one on a shared album page for the group to listen, react, and vote on. The top-voted song gets a music video posted to our socials.

To keep the public app pointed at this, two earlier surfaces are **hidden from the NavBar but still fully routed and functional** — deferred, not removed, while we build them out:

- **Simulation / Map (`/map`)** — the live "artist lives a day" loop. All the sim architecture in `OVERVIEW.md` still stands.
- **Application (`/apply`)** — the audition funnel to become a synthetic artist.

The nav is now **About · Roster · Bootcamp**. The About page (`/`) teases Creative Bootcamp; the **Bootcamp page (`/bootcamp`, `features/bootcamp/`)** explains the activity in full and ends with an informal email inquiry form (`ContactForm` → a `mailto:` to `slopboptv@gmail.com` for now; no payment or ordering flow yet). Everything about the sim and the application form in the docs remains accurate for when those surfaces come back.

## Stack

React 19 · TypeScript · Vite · Tailwind 3 · React Router v7 · `@solana/wallet-adapter-react` (Phantom / Solflare / MWA) for wallet-gated mutations.

Env: `VITE_API_URL` (backend base, defaults `http://localhost:5000`), `VITE_SOL_NETWORK` (devnet / mainnet).

## Code layout

- **`src/services/<service>/`** — one folder per backend, one file per resource, with a same-named barrel re-exporting it. Today: `services/slopbop/` (`client`, `artists`, `collections`, `songs`, `sim`, `application`, `admin`, `verification`). **The types here are the API contract** — keep them honest; the rest of the app points at them rather than restating shapes.
- **`src/hooks/`** — hook-per-resource. Read hooks build on the generic `useResource<T>(fetcher, key, { onError?, pollMs?, cache? })`, which owns the stale-response guard, optional polling, and an `error` value. Pass `cache: true` for data that's static for a session (world map, items, form config) — it caches at module scope and dedupes the in-flight request, so don't hand-roll module-level caching in a hook. Wallet-gated mutations follow a command-shaped pattern (`useWalletAuth` + a submit hook).
- **`src/features/<feature>/`** — one folder per route/feature: the page plus its components, co-located.
- **`src/context/`** — true app-wide singletons only: `SimContext` (the live-sim heartbeat, polled while live), `MusicPlayerContext` (one persistent audio element), `ToastContext`.
- **`src/primitives/`** — low-level reusable UI (form controls, `BottomSheet`, `Modal`, `StatBar`…).

## Styling — hybrid, two systems by design

1. **Tailwind utility classes inline in TSX** — the default. Layout, spacing, one-off structure, simple states. No separate file.
2. **Central CSS under `src/styles/`** — for what Tailwind shouldn't do: animations, complex/stateful selectors, and reusable components with real visual identity.
   - `theme.css` — design tokens (palette → semantic roles → spacing / radius / z-index / type). The single source of truth; both Tailwind and the component CSS read these. Retheme the whole app by swapping the ~10 palette values.
   - `components/*.css` — one file per component (`stat-bar`, `cards`, `bottom-sheet`, `music-player`…), each `@import`ed by `index.css`. Use the tokens, never raw values.
   - `index.css` — entry point: imports the design system, then Tailwind, then global reset + animated background.

**Rule of thumb:** reach for Tailwind first; drop to a `styles/components/*.css` file when the styling is reusable, animated, or too complex to read inline. **Do not co-locate `.css` next to a component** — it lives in `styles/components/` and loads through `index.css`, so styling has exactly one home.

## Docs

- `OVERVIEW.md` — the mental model and the decisions behind it. **Read it first.**
- Cross-repo contract (backend API, Mongo shapes, the other two repos): `/home/thomukas1/repos/SlopBopSimulator/_DOCS/_INFRA/` — read before any change that touches the backend's shape.
- **No per-feature doc files.** The code plus the service types are the detail; they don't desync. Don't reintroduce per-feature markdown — it rots.
