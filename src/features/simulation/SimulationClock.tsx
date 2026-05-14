function formatUtc(d: Date) {
  const yy = String(d.getUTCFullYear() % 100).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${yy}/${mm}/${dd} ${h}:${m}`;
}

export function SimulationClock({
  weather,
  simTime,
}: {
  weather: string | null;
  simTime: string;
}) {
  return (
    <div className="flex flex-col items-center gap-xs">
      <span className="text-secondary text-xs text-white uppercase tracking-wide">Latest Snapshot</span>
      <p className="font-display text-xl tabular-nums">{formatUtc(new Date(simTime))}</p>
      {weather && (
        <p className="text-secondary text-lg">{weather}</p>
      )}
    </div>
  );
}
