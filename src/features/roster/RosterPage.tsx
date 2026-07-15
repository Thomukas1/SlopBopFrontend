import { useArtists } from '../../hooks/useArtists';
import { ArtistCard } from './ArtistCard';

// The four elements every artist is built from — each its own emoji + colour so
// the roster reads as a designed system, not a random generator.
const FACETS: { emoji: string; label: string; color: string }[] = [
  { emoji: '🧠', label: 'Personality', color: 'var(--facet-personality)' },
  { emoji: '🎨', label: 'Appearance',  color: 'var(--facet-appearance)' },
  { emoji: '🎤', label: 'Voice',       color: 'var(--facet-voice)' },
  { emoji: '🎧', label: 'Music taste',  color: 'var(--facet-taste)' },
];

export default function RosterPage() {
  const { artists, loading } = useArtists();

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-md py-lg">
        <div className="flex flex-col gap-xs">
          <p className="eyebrow">Signed Artists</p>
          <h1 className="font-display text-2xl">The Roster</h1>
        </div>

        <p className="text-base leading-relaxed">
          Slopbop artists are synthetic agents, each a distinct character
          built around these 4 elements:
        </p>

        <div className="grid grid-cols-2 gap-sm">
          {FACETS.map(({ emoji, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-sm bg-surface-2 rounded-md border-l-2 pl-sm pr-md py-sm"
              style={{ borderColor: color }}
            >
              <span className="text-base leading-none" aria-hidden="true">{emoji}</span>
              <span className="text-xs uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4xl">
          <div className="spinner large processing" />
        </div>
      ) : (
        <div className="flex flex-col border-t border-border">
          {artists.map(artist => (
            <ArtistCard key={artist.artist_id} artist={artist} />
          ))}
          <p className="text-center subtle text-sm py-lg">More artists announced soon</p>
        </div>
      )}
    </div>
  );
}
