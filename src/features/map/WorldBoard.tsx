import { useState, useEffect } from 'react';
import { useWorldMap } from '../../hooks/useWorldMap';
import { useArtists } from '../../hooks/useArtists';
import { useSim } from '../../context/SimContext';
import { Artist, Location } from '../../services/slopbop';
import { computeBounds, TILE_SIZE, WorldBounds } from './grid';
import { GridLines } from './GridLines';
import { LocationIcon } from './LocationIcon';
import { AgentMarker } from './AgentMarker';

function useViewportSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
}

const tileKey = (t: [number, number]) => `${t[0]},${t[1]}`;

export function WorldBoard({
  onSelectLocation,
  onSelectArtist,
}: {
  onSelectLocation: (loc: Location, occupants: Artist[]) => void;
  onSelectArtist: (artist: Artist) => void;
}) {
  const { map: locations, loading: mapLoading } = useWorldMap();
  const { artists, loading: artistsLoading } = useArtists();
  const { sim } = useSim();
  const { w: vw, h: vh } = useViewportSize();

  const loading = mapLoading || artistsLoading;

  const bounds = computeBounds((locations ?? []).map(l => l.position));
  const scale = Math.min(vw / bounds.width, vh / bounds.height);

  const extraX = Math.ceil((vw / scale - bounds.width) / (2 * TILE_SIZE));
  const extraY = Math.ceil((vh / scale - bounds.height) / (2 * TILE_SIZE));
  const displayBounds: WorldBounds = {
    minX: bounds.minX - extraX,
    minY: bounds.minY - extraY,
    cols: bounds.cols + extraX * 2,
    rows: bounds.rows + extraY * 2,
    width: (bounds.cols + extraX * 2) * TILE_SIZE,
    height: (bounds.rows + extraY * 2) * TILE_SIZE,
  };

  const artistById = new Map(artists.map(a => [a.artist_id, a]));
  const locationByTile = new Map((locations ?? []).map(l => [tileKey(l.position), l]));
  const occupantsByLocation = new Map<string, Artist[]>();
  const looseAgents: { artist: Artist; tile: [number, number] }[] = [];

  if (sim) {
    for (const [id, snap] of Object.entries(sim.artists)) {
      const artist = artistById.get(id);
      if (!artist || !snap?.position) continue;
      const loc = locationByTile.get(tileKey(snap.position));
      if (loc) {
        const list = occupantsByLocation.get(loc._id) ?? [];
        list.push(artist);
        occupantsByLocation.set(loc._id, list);
      } else {
        looseAgents.push({ artist, tile: snap.position });
      }
    }
  }

  if (loading) {
    return <p className="text-muted text-sm">Loading world...</p>;
  }

  return (
    <div
      className="relative shrink-0"
      style={{
        width: displayBounds.width,
        height: displayBounds.height,
        transform: `scale(${scale})`,
      }}
    >
      <GridLines />
      <div
        className="absolute pointer-events-none"
        style={{
          left: extraX * TILE_SIZE,
          top: extraY * TILE_SIZE,
          width: bounds.width,
          height: bounds.height,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
        }}
      />
      {locations?.map(loc => (
        <LocationIcon
          key={loc._id}
          location={loc}
          bounds={displayBounds}
          occupantCount={occupantsByLocation.get(loc._id)?.length ?? 0}
          onClick={() => onSelectLocation(loc, occupantsByLocation.get(loc._id) ?? [])}
        />
      ))}
      {looseAgents.map(({ artist, tile }) => (
        <AgentMarker
          key={artist.artist_id}
          artist={artist}
          tile={tile}
          bounds={displayBounds}
          onClick={() => onSelectArtist(artist)}
        />
      ))}
    </div>
  );
}
