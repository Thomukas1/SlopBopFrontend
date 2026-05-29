import { useState } from 'react';
import { Artist, Location } from '../../services/slopbop';
import { WorldBoard } from './WorldBoard';
import { LocationPanel } from './LocationPanel';
import { ArtistSheet } from './ArtistSheet';
import { SimHud } from './SimHud';
import { WelcomeModal, useWelcomeModal } from './WelcomeModal';

export default function MapPage() {
  const { open: welcomeOpen, dismiss: dismissWelcome, reopen: reopenWelcome } = useWelcomeModal();

  const [selected, setSelected] = useState<Location | null>(null);
  const [selectedOccupants, setSelectedOccupants] = useState<Artist[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);

  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [artistSheetOpen, setArtistSheetOpen] = useState(false);

  const openArtist = (artist: Artist) => {
    setPanelOpen(false);
    setSelectedArtist(artist);
    setArtistSheetOpen(true);
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center overflow-hidden bg-surface">
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%)' }}
      />

      <WorldBoard
        onSelectLocation={(loc, occupants) => {
          setSelected(loc);
          setSelectedOccupants(occupants);
          setPanelOpen(true);
        }}
        onSelectArtist={openArtist}
      />

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
