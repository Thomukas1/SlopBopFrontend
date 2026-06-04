---
name: map-feature-context
description: Where the world-map feature's architecture is documented (read before map work)
metadata:
  type: reference
---

The world-map feature (`src/features/map/`) is documented in-repo at
`src/features/map/_CONTEXT.md` — read it before working on the map. It covers
the engine-vs-visuals split (`scene/` = math/positioning, `board/` = the visual
layer + `interactables/`, `details/`, `chrome/`), the render order, the
tile-art model, and a "next steps" roadmap.

Key durable facts: the sim advances ~every 10 min (no realtime movement, so DOM
not WebGL); tile coordinates are logic-only (art resolution is independent);
tile-art data is frontend-only in `board/terrain.ts`.

Note: this is a deliberate exception to CLAUDE.md's "no per-feature doc files"
rule — the user explicitly asked for `_CONTEXT.md` here. Keep it high-level
(roles + why), not API detail, so it doesn't rot.
