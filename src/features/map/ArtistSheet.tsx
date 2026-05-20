import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BottomSheet } from '../../primitives/BottomSheet';
import { useSim } from '../../context/SimContext';
import { Artist } from '../../services/slopbop';
import { ArtistStatus } from './ArtistStatus';
import { ArtistBars } from './ArtistBars';
import { ArtistJournal } from './ArtistJournal';

type Tab = 'status' | 'bars' | 'journal';

const TABS: { id: Tab; label: string }[] = [
  { id: 'status', label: 'Status' },
  { id: 'bars', label: 'Bars' },
  { id: 'journal', label: 'Journal' },
];

// Bottom sheet for a tapped agent: identity and a "view profile" link to
// their static page, then a tabbed view of their live simulation data —
// status, song ideas (bars) and activity journal. `artist` stays set while
// the sheet animates closed so its content doesn't blank out mid-slide.
export function ArtistSheet({
  open,
  onClose,
  artist,
}: {
  open: boolean;
  onClose: () => void;
  artist: Artist | null;
}) {
  const { sim } = useSim();
  const [tab, setTab] = useState<Tab>('status');

  // Each fresh open starts on the status tab.
  useEffect(() => {
    if (open) setTab('status');
  }, [open]);

  return (
    <BottomSheet open={open} onClose={onClose} flush>
      {artist && (
        <div className="flex flex-col h-full">
          {/* Fixed header — identity, profile link, tab switcher */}
          <div className="flex flex-col gap-md px-xl pt-lg pb-md shrink-0">
            <div className="flex items-center gap-md">
              <img
                src={artist.imageUrl ?? '/Images/mystery-actor.png'}
                alt={artist.name}
                className="w-12 h-12 rounded-lg object-cover object-top shrink-0"
              />
              <span className="font-display text-lg truncate">{artist.name}</span>
            </div>

            {/* Link out to the static profile / discography page */}
            <Link
              to={`/artists/${artist._id}`}
              onClick={onClose}
              className="rounded-lg border border-border py-sm text-center text-sm font-display uppercase tracking-wide active:opacity-70 transition-opacity"
            >
              View Profile
            </Link>

            {/* Tab switcher — lightweight text buttons */}
            <div className="flex items-center justify-center gap-md font-display text-sm uppercase tracking-wide">
              {TABS.map((t, i) => (
                <Fragment key={t.id}>
                  {i > 0 && <span className="text-border">|</span>}
                  <button
                    onClick={() => setTab(t.id)}
                    className={`transition-colors ${
                      tab === t.id
                        ? 'text-blue-secondary underline underline-offset-4'
                        : 'text-gray active:opacity-70'
                    }`}
                  >
                    {t.label}
                  </button>
                </Fragment>
              ))}
            </div>
          </div>

          {/* Selected tab — the only part that scrolls */}
          <div className="flex-1 min-h-0 overflow-y-auto px-xl pb-xl">
            {tab === 'status' && <ArtistStatus artistId={artist._id} />}
            {tab === 'bars' &&
              (sim ? (
                <ArtistBars
                  simulationId={sim.simulation_id}
                  artistId={artist._id}
                  live={open}
                />
              ) : (
                <p className="text-center text-gray text-sm py-3xl">
                  Not part of a running simulation.
                </p>
              ))}
            {tab === 'journal' &&
              (sim ? (
                <ArtistJournal
                  simulationId={sim.simulation_id}
                  artistId={artist._id}
                  live={open}
                />
              ) : (
                <p className="text-center text-gray text-sm py-3xl">
                  Not part of a running simulation.
                </p>
              ))}
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
