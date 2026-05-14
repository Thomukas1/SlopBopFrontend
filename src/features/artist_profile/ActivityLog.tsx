import { BottomSheet } from '../../primitives/BottomSheet';
import { useSimArtistJournal } from '../../hooks/useSimArtistJournal';
import { JournalEntry } from '../../services/slopbop';

interface Props {
  open: boolean;
  onClose: () => void;
  simulationId: string;
  artistId: string;
}

function titleCaseSnake(s: string) {
  const spaced = s.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatSimTime(iso: string) {
  const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function EntryRow({ entry }: { entry: JournalEntry }) {
  const time = formatSimTime(entry.sim_time);

  switch (entry.type) {
    case 'intent': {
      const verb = entry.action === 'move' ? 'Heading to' : 'Going to';
      return (
        <div className="flex gap-md">
          <div className="text-xs text-gray font-display tabular-nums pt-xs w-12 flex-shrink-0">
            {time}
          </div>
          <div className="flex flex-col gap-xs flex-1">
            <div className="text-sm text-white">
              <span className="mr-1">{entry.action === 'move' ? '🚶' : '🎯'}</span>
              {verb} <span className="text-yellow">{titleCaseSnake(entry.target)}</span>
            </div>
            <div className="text-sm text-gray italic">"{entry.intent}"</div>
          </div>
        </div>
      );
    }
    case 'interaction': {
      const ok = entry.outcome === 'success';
      return (
        <div className="flex gap-md">
          <div className="text-xs text-gray font-display tabular-nums pt-xs w-12 flex-shrink-0">
            {time}
          </div>
          <div className="flex flex-col gap-xs flex-1 min-w-0">
            <div className="text-sm text-white">
              <span className="mr-1">{ok ? '✓' : '✗'}</span>
              {titleCaseSnake(entry.target)}
              {!ok && (
                <span className="text-gray ml-sm">({entry.outcome})</span>
              )}
            </div>
            <div className="text-sm text-white whitespace-pre-line">
              {entry.observation}
            </div>
          </div>
        </div>
      );
    }
    case 'arrival':
      return (
        <div className="flex gap-md">
          <div className="text-xs text-gray font-display tabular-nums pt-xs w-12 flex-shrink-0">
            {time}
          </div>
          <div className="text-sm text-white pt-xs">
            <span className="mr-1">📍</span>
            Arrived at <span className="text-yellow">{titleCaseSnake(entry.location)}</span>
          </div>
        </div>
      );
  }
}

export function ActivityLog({ open, onClose, simulationId, artistId }: Props) {
  const { entries, loading } = useSimArtistJournal(simulationId, artistId, { live: open });
  const sorted = [...entries].reverse();

  return (
    <BottomSheet open={open} onClose={onClose} title="Activity Log">
      {loading && entries.length === 0 ? (
        <div className="flex justify-center py-3xl">
          <div className="spinner large processing" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center text-gray text-sm py-3xl">
          Nothing logged yet.
        </div>
      ) : (
        <div className="flex flex-col gap-lg">
          {sorted.map((entry, i) => (
            <EntryRow key={`${entry.sim_time}-${entry.type}-${i}`} entry={entry} />
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
