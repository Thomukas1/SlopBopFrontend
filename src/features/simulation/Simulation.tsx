import { useSelectedSim } from '../../hooks/useSelectedSim';
import { SimulationClock } from './SimulationClock';
import { ArtistsGrid } from './ArtistsGrid';

export function Simulation() {
  const { sim, loading } = useSelectedSim();

  if (loading && !sim) {
    return <p className="text-secondary text-sm">Loading simulation...</p>;
  }

  if (!sim) {
    return <p className="text-secondary text-sm">No simulations available yet.</p>;
  }

  return (
    <div className="flex flex-col gap-xl">
      <SimulationClock weather={sim.weather} simTime={sim.sim_time} />
      <ArtistsGrid artistIds={Object.keys(sim.artists)} />
    </div>
  );
}
