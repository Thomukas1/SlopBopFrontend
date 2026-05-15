// `simTime` is a naive sim-local string "YYYY-MM-DDTHH:MM" — display its parts
// directly, never via new Date() (the browser would double-shift it).
function formatSimTime(simTime: string) {
  const [date, time] = simTime.split('T');
  const [y, mo, d] = date.split('-');
  return `${y.slice(2)}/${mo}/${d} ${time}`;
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
      <p className="font-display text-xl tabular-nums">{formatSimTime(simTime)}</p>
      {weather && (
        <p className="text-secondary text-lg">{weather}</p>
      )}
    </div>
  );
}
