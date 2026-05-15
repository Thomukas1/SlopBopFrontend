import { useState } from 'react';
import { useSelectedSim } from '../../hooks/useSelectedSim';
import { useWorldMap } from '../../hooks/useWorldMap';
import { StatBar } from '../../primitives/StatBar';
import { Location, SnapshotState } from '../../services/slopbop';
import { ActivityLog } from './ActivityLog';
import { BarsModal } from './BarsModal';

const STAT_STYLE: Record<string, { emoji: string; color: string }> = {
  energy: { emoji: '⚡', color: '#4ade80' },
};

const DEFAULT_STAT_STYLE = { emoji: '•', color: 'var(--blue-secondary)' };

function titleCaseSnake(s: string) {
  const spaced = s.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// `busy_until` is a naive sim-local string "YYYY-MM-DDTHH:MM" — take the HH:MM
// part directly, never via new Date().
function formatUntil(simTime: string) {
  return simTime.split('T')[1] ?? simTime;
}

function findLocation(map: Location[] | null, name: string | null): Location | undefined {
  if (!map || !name) return undefined;
  return map.find(l => l.name === name);
}

function ActionRow({ label, busyUntil, emoji, name, prefix = '' }: {
  label: string;
  busyUntil: string | null;
  emoji: string;
  name: string;
  prefix?: string;
}) {
  return (
    <div className="flex flex-col gap-xs">
      <div className="text-md text-white">
        {label}
        {busyUntil && <span> (until {formatUntil(busyUntil)})</span>}
      </div>
      <p className="text-lg">
        {prefix}<span className="mr-1">{emoji}</span>{name}
      </p>
    </div>
  );
}

function renderActionSection(state: SnapshotState, locationDef: Location | undefined) {
  switch (state.current_action) {
    case null:
      return null;
    case 'move':
      return (
        <ActionRow
          label="Moving to"
          busyUntil={state.busy_until}
          emoji="🚶"
          name={state.current_target ? titleCaseSnake(state.current_target) : '—'}
          prefix="→ "
        />
      );
    case 'interact': {
      const interactionDef =
        locationDef && state.current_target
          ? locationDef.interactions[state.current_target]
          : undefined;
      return (
        <ActionRow
          label="Current Action"
          busyUntil={state.busy_until}
          emoji={interactionDef?.emoji ?? '✨'}
          name={state.current_target ? titleCaseSnake(state.current_target) : '—'}
        />
      );
    }
  }
}

export function ArtistStateCard({ artistId }: { artistId: string }) {
  const { sim } = useSelectedSim();
  const { map } = useWorldMap();
  const [logOpen, setLogOpen] = useState(false);
  const [barsOpen, setBarsOpen] = useState(false);

  const state: SnapshotState | null = sim?.artists[artistId] ?? null;
  if (!sim || !state) return null;

  const locationDef = findLocation(map, state.location);
  const locationName = locationDef?.name
    ? titleCaseSnake(locationDef.name)
    : (state.location ?? 'Somewhere');
  const locationEmoji = locationDef?.emoji ?? '📍';

  const stats = Object.entries(state.stats ?? {});

  return (
    <div className="frosted-card p-lg flex flex-col gap-xl">
      {state.current_action !== 'move' && (
        <div className="flex items-baseline gap-sm">
          <span className="text-md text-white">Location:</span>
          <p className="text-lg">
            <span className="mr-1">{locationEmoji}</span>{locationName}
          </p>
        </div>
      )}

      {renderActionSection(state, locationDef)}

      {stats.length > 0 && (
        <div className="flex flex-col gap-sm">
          {stats.map(([name, value]) => {
            const style = STAT_STYLE[name] ?? DEFAULT_STAT_STYLE;
            return (
              <StatBar
                key={name}
                emoji={style.emoji}
                name={name}
                value={value}
                color={style.color}
              />
            );
          })}
        </div>
      )}

      <div className="flex gap-md">
        <button
          onClick={() => setBarsOpen(true)}
          className="flex-1 rounded-lg border border-border py-sm text-sm active:opacity-70"
        >
          <span className="mr-1">🎵</span>View Bars
        </button>
        <button
          onClick={() => setLogOpen(true)}
          className="flex-1 rounded-lg border border-border py-sm text-sm active:opacity-70"
        >
          <span className="mr-1">🔍</span>Activity Log
        </button>
      </div>

      <ActivityLog
        open={logOpen}
        onClose={() => setLogOpen(false)}
        simulationId={sim.simulation_id}
        artistId={artistId}
      />

      <BarsModal
        open={barsOpen}
        onClose={() => setBarsOpen(false)}
        simulationId={sim.simulation_id}
        artistId={artistId}
      />
    </div>
  );
}
