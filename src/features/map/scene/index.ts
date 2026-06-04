// A tiny tile-based scene layer: think in tiles and a camera, not pixel math.
// Frame a tile world with `useCamera`, wrap it in a <Stage>, drop <Sprite>s at
// tile coordinates, and layer render passes (grid overlay, vignette
// post-processing) over the top. See camera.ts for the why.
export { TILE_SIZE, MARGIN_TILES, frameTiles } from './camera';
export type { Camera, Tile, PixelPos, Viewport, FrameOptions } from './camera';
export { useCamera } from './useCamera';
export { Stage } from './Stage';
export { Sprite } from './Sprite';
export { GroundLayer } from './GroundLayer';
export { GridLines } from './GridLines';
export { Spotlight } from './Spotlight';
