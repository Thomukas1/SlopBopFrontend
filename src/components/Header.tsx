import { useState, useEffect, useRef } from 'react';
import { ConnectWalletButton } from '../primitives/buttons/ConnectWalletButton';
import { ImageButton } from '../primitives/buttons/ImageButton';
import { useTimeline } from '../context/TimelineContext';

const SCROLL_UP_THRESHOLD = 30;

// `at` is a naive sim-local string "YYYY-MM-DDTHH:MM" — display its parts
// directly; never run it through new Date() (that would re-apply the browser's
// local zone and double-shift it).
function formatSimClock(at: string) {
  if (!at) return '—';
  const [date, time] = at.split('T');
  const [y, mo, d] = date.split('-');
  return `${y.slice(2)}/${mo}/${d} ${time}`;
}

function LocalTime() {
  const { at, city } = useTimeline();
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-gray text-xs uppercase tracking-wide">
        {city ? `Local Time in ${city}` : 'Local Time'}
      </span>
      <span className="font-display text-sm tabular-nums">{formatSimClock(at)}</span>
    </div>
  );
}

export function Header() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollUpAccumulator = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const delta = lastScrollY.current - currentScrollY;

      if (currentScrollY < 50) {
        setVisible(true);
        scrollUpAccumulator.current = 0;
      } else if (currentScrollY >= maxScroll - 5) {
        scrollUpAccumulator.current = 0;
      } else if (delta > 0) {
        scrollUpAccumulator.current += delta;
        if (scrollUpAccumulator.current >= SCROLL_UP_THRESHOLD) {
          setVisible(true);
        }
      } else {
        scrollUpAccumulator.current = 0;
        setVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`header ${visible ? 'visible' : 'hidden'}`}>
      <div className="flex justify-between items-center gap-lg">
        <div className="flex items-center gap-lg">
          <ImageButton
            href="/"
            ariaLabel="Go to home"
            className="image-button lg"
          >
            <img src="/Branding/logo.png" alt="SlopBop Logo" className="header-logo" />
          </ImageButton>

          <LocalTime />
        </div>

        <div className="items-center">
          <ConnectWalletButton />
        </div>
      </div>
    </div>
  );
}
