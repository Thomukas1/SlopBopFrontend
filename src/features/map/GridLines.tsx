import { TILE_SIZE, GRIDLINE_OPACITY } from './grid';

export function GridLines() {
  if (GRIDLINE_OPACITY <= 0) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: GRIDLINE_OPACITY }}
    >
      {/* Tile grid over the whole board. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), ' +
            'linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: `${TILE_SIZE}px ${TILE_SIZE}px`,
        }}
      />
    </div>
  );
}
