import { useEffect, useState, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { useSimArtistNotes } from '../../hooks/useSimArtistNotes';
import { useTimeline } from '../../context/TimelineContext';

interface Props {
  open: boolean;
  onClose: () => void;
  simulationId: string;
  artistId: string;
}

function formatDate(d: Date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function noteTimestamp(simTime: string): number {
  return new Date(simTime.endsWith('Z') ? simTime : simTime + 'Z').getTime();
}

function unescapeNewlines(text: string): string {
  return text.replace(/\\n/g, '\n');
}

export function BarsModal({ open, onClose, simulationId, artistId }: Props) {
  const { at } = useTimeline();
  const { notes, loading } = useSimArtistNotes(simulationId, artistId, { live: open });
  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(id);
    }
    setEntered(false);
    const id = window.setTimeout(() => setMounted(false), 250);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  if (!mounted) return null;

  const now = at.getTime();
  const visible = notes.filter(n => noteTimestamp(n.sim_time) <= now);

  return createPortal(
    <div
      className={`bars-modal-backdrop${entered ? ' open' : ''}`}
      onClick={onClose}
    >
      <div
        className={`bars-modal${entered ? ' open' : ''}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Song ideas"
      >
        <div className="bars-modal-header">
          <div className="bars-modal-title">Song ideas</div>
          <div className="bars-modal-date">{formatDate(at)}</div>
        </div>
        <div className="bars-modal-content">
          {loading && visible.length === 0 ? (
            <div className="bars-empty">…</div>
          ) : visible.length === 0 ? (
            <div className="bars-empty">No bars yet.</div>
          ) : (
            visible.map((n, i) => (
              <Fragment key={`${n.sim_time}-${i}`}>
                {i > 0 && <div className="bars-divider">⁂</div>}
                <div className="bars-note">{unescapeNewlines(n.note)}</div>
              </Fragment>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
