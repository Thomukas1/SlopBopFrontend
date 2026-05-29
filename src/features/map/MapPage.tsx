import { useState, useEffect } from 'react';
import { useWorldMap } from '../../hooks/useWorldMap';
import { useArtists } from '../../hooks/useArtists';
import { useSim } from '../../context/SimContext';
import { Artist, Location } from '../../services/slopbop';
import { computeBounds } from './grid';
import { GridLines } from './GridLines';
import { LocationIcon } from './LocationIcon';
import { AgentMarker } from './AgentMarker';
import { LocationPanel } from './LocationPanel';
import { ArtistSheet } from './ArtistSheet';
import { SimHud } from './SimHud';
import { WelcomeModal, useWelcomeModal } from './WelcomeModal';

// Tracks the viewport size so the board can be scaled to fit it.
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

// Full-screen world map (route: /). Unlike the rest of the app it is NOT
// clamped to the 430px column — it fills the whole viewport. The board is
// sized to its tiles (computeBounds) and then scaled so the entire world is
// always visible at once, filling the screen with no scrolling.
export default function MapPage() {
  const { map: locations, loading: mapLoading } = useWorldMap();
  const { artists, loading: artistsLoading } = useArtists();
  const { sim } = useSim();
  const { w: vw, h: vh } = useViewportSize();
  const { open: welcomeOpen, dismiss: dismissWelcome, reopen: reopenWelcome } = useWelcomeModal();

  // The tapped location, kept set while its panel animates closed so the
  // panel content doesn't blank out mid-slide.
  const [selected, setSelected] = useState<Location | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // The tapped agent — from a free marker or a location's occupant list —
  // shown in a bottom sheet. Likewise kept set during the close animation.
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [artistSheetOpen, setArtistSheetOpen] = useState(false);

  // Opening an artist closes the location panel beneath it: the location
  // modal sits above the sheet's z-index, so they can't both be visible.
  const openArtist = (artist: Artist) => {
    setPanelOpen(false);
    setSelectedArtist(artist);
    setArtistSheetOpen(true);
  };

  const loading = mapLoading || artistsLoading;

  // The board is sized from the *locations* only, so it stays stable as
  // agents move around inside it. MARGIN_TILES gives agents room to roam
  // a little past the outermost location without leaving the board.
  const bounds = computeBounds((locations ?? []).map(l => l.position));

  // Contain-fit: scale so the whole board fits, filling whichever axis is
  // tighter. Allowed to scale above 1 so a small world still fills the view.
  const scale = Math.min(vw / bounds.width, vh / bounds.height);

  // Split placed agents into those standing on a location's tile (shown as
  // that location's occupants) and those on a vacant tile (shown as a free
  // marker, exactly as before). Agents always sit on an integer tile.
  const artistById = new Map(artists.map(a => [a.artist_id, a]));
  const locationByTile = new Map(
    (locations ?? []).map(l => [tileKey(l.position), l]),
  );
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

  const selectedOccupants = selected
    ? occupantsByLocation.get(selected._id) ?? []
    : [];

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center overflow-hidden bg-surface">
      {loading ? (
        <p className="text-muted text-sm">Loading world...</p>
      ) : (
        <div
          className="relative shrink-0 bg-cover bg-center"
          style={{
            width: bounds.width,
            height: bounds.height,
            transform: `scale(${scale})`,
            backgroundImage: "url('/Images/world-map.png')",
          }}
        >
          <GridLines />
          {locations?.map(loc => (
            <LocationIcon
              key={loc._id}
              location={loc}
              bounds={bounds}
              occupantCount={occupantsByLocation.get(loc._id)?.length ?? 0}
              onClick={() => {
                setSelected(loc);
                setPanelOpen(true);
              }}
            />
          ))}
          {looseAgents.map(({ artist, tile }) => (
            <AgentMarker
              key={artist.artist_id}
              artist={artist}
              tile={tile}
              bounds={bounds}
              onClick={() => openArtist(artist)}
            />
          ))}
        </div>
      )}

      <SimHud />

      <button
        type="button"
        onClick={reopenWelcome}
        aria-label="About this simulation"
        className="absolute right-3 top-20 z-20 w-8 h-8 rounded-full border border-white/15 bg-white/10 backdrop-blur-sm shadow-md flex items-center justify-center text-sm transition-base active:scale-90"
      >
        ℹ️
      </button>

      <WelcomeModal open={welcomeOpen} onDismiss={dismissWelcome} />

      <LocationPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        location={selected}
        occupants={selectedOccupants}
        onSelectArtist={openArtist}
      />

      <ArtistSheet
        open={artistSheetOpen}
        onClose={() => setArtistSheetOpen(false)}
        artist={selectedArtist}
      />
    </div>
  );
}
