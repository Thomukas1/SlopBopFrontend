---
name: map-rendering-approach
description: Why the world map uses a DOM "scene" layer instead of Pixi.js/a game engine
metadata:
  type: project
---

The world map (`src/features/map/`) renders with a deliberate **Tier-1 DOM scene layer**, not Pixi.js, Konva, or a game engine. The scene layer lives in `src/features/map/scene/` (`Camera`/`frameTiles`, `useCamera`, `<Stage>`, `<Sprite>`, plus render passes `<GridLines>` overlay and `<Spotlight>` vignette/post-processing): feature code frames a tile world with a camera and drops `<Sprite tile={...}>`s, so markers carry zero coordinate math while keeping DOM accessibility + Tailwind. (It was briefly in `src/primitives/scene/` but moved into the map since only the map uses it.)

**Why:** the sim only advances every ~10 minutes, so there is no realtime-movement requirement — a WebGL renderer would buy nothing and cost a11y/styling. Reach for a canvas renderer (react-konva first, Pixi only at WebGL scale) only if a concrete visual ambition appears: camera pan/zoom, animated sprite art, particle/glow effects, or hundreds of moving entities.

**Tile art:** the backend's 5x5 is *logic only* (coordinates for travel maths); art resolution is independent. Chosen direction is **one texture per cell** ("texture per cell"), rendered by the `<GroundLayer>` bottom render-pass + `board/terrain.ts` (frontend-only `TILEMAP` cell→type + `TERRAIN_TEXTURE` pack; currently placeholder CSS gradients). It is the N=1 case of a future sub-tiled look, so evolving to detailed tiles changes only GroundLayer's per-cell rendering — `TILEMAP` stays the source of truth. The sim models no terrain, so all tile-art data lives frontend-side.

**How to apply:** keep new map visuals in the DOM scene layer; don't introduce a rendering engine without one of those triggers. Map folder is split into `scene/` (the generic rendering engine + render passes), `board/` (domain rendering: WorldBoard/LocationIcon/AgentMarker), `details/` (tap-open sheets/panels), `chrome/` (SimHud, WelcomeModal).
