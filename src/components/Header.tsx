import { useState, useEffect, useRef } from 'react';
import { ConnectWalletButton } from '../primitives/buttons/ConnectWalletButton';
import { ImageButton } from '../primitives/buttons/ImageButton';
import { useTimeline } from '../context/TimelineContext';

const SCROLL_UP_THRESHOLD = 30;

function formatServerTime(d: Date) {
  const yy = String(d.getUTCFullYear() % 100).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  const s = String(d.getUTCSeconds()).padStart(2, '0');
  return `${yy}/${mm}/${dd} ${h}:${m}:${s}`;
}

function ServerTime() {
  const { at } = useTimeline();
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-gray text-xs uppercase tracking-wide">Server Time</span>
      <span className="font-display text-sm tabular-nums">{formatServerTime(at)}</span>
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

          <ServerTime />
        </div>

        <div className="items-center">
          <ConnectWalletButton />
        </div>
      </div>
    </div>
  );
}
