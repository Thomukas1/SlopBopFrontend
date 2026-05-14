# SlopBop Frontend

Mobile-first React web app (430px design target) for the SlopBop platform.

## Stack

React 19 · TypeScript · Vite · Tailwind 3 (utility classes in TSX; CSS files
only for animations) · React Router v7 · `@solana/wallet-adapter-react`
(Phantom / Solflare / MWA) for wallet-gated mutations.

Env: `VITE_API_URL` (backend base, defaults `http://localhost:5000`),
`VITE_SOL_NETWORK` (devnet / mainnet).

## Code layout

- **`src/services/<service>/`** — per-backend folder, one file per resource,
  with a same-named barrel (`services/<service>.ts`) re-exporting it. Today:
  `services/slopbop/` (`client`, `artists`, `collections`, `songs`, `sim`,
  `admin`, `verification`). Future backends slot in next to it.
- **`src/hooks/`** — hook-per-resource. Read-hooks are built on a generic
  `useResource<T>(fetcher, key, { onError?, pollMs? })` that owns the
  stale-response guard and optional polling. Wallet-gated mutation hooks
  follow a separate command-shaped pattern.
- **`src/features/<feature>/`** — feature pages and their components.
- **`src/context/`** — app-wide providers (Toast, MusicPlayer).
- **`src/primitives/`** — low-level reusable UI.

See `_CONTEXT.md` for the per-feature inventory (routes, components,
auth flow, data model).
