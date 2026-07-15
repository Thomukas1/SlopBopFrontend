import { genreColor } from './genreColor';

/**
 * A wrap of Pokémon-style genre pills. Each genre gets a deterministic colour
 * (see {@link genreColor}) so the same genre always looks the same everywhere.
 */
export default function GenrePills({
  genres,
  className = '',
}: {
  genres?: string[];
  className?: string;
}) {
  if (!genres?.length) return null;

  return (
    <div className={`flex flex-wrap gap-xs ${className}`}>
      {genres.map(genre => {
        const { bg, fg, outline } = genreColor(genre);
        return (
          <span
            key={genre}
            className="inline-flex items-center px-md py-xs text-xs font-bold uppercase tracking-wide leading-none"
            style={{
              backgroundColor: bg,
              color: fg,
              borderRadius: '9999px',
              // Thin contrasting halo so the vivid label stays legible on any fill.
              textShadow: `-0.5px -0.5px 0 ${outline}, 0.5px -0.5px 0 ${outline}, -0.5px 0.5px 0 ${outline}, 0.5px 0.5px 0 ${outline}`,
            }}
          >
            {genre}
          </span>
        );
      })}
    </div>
  );
}
