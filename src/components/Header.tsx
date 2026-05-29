import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// import { ConnectWalletButton } from '../primitives/buttons/ConnectWalletButton';
// ^ hidden for MVP — restore when there's a reason to connect a wallet.
import { ImageButton } from '../primitives/buttons/ImageButton';
import { useSim } from '../context/SimContext';
import { isSimLive } from '../services/slopbop';

const SCROLL_UP_THRESHOLD = 30;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "YYYY-MM-DD" → "14 May 2026". Naive sim-local date — display its parts
// directly, never via new Date().
function formatSimDate(date: string) {
  const [y, mo, d] = date.split('-');
  return `${Number(d)} ${MONTHS[Number(mo) - 1]} ${Number(y)}`;
}

// The sim's clock: which day, how far into it, and whether it's still unfolding.
// `sim_time` is the cutoff — it advances on its own as the live day plays out.
function SimClock() {
  const { sim } = useSim();

  if (!sim) {
    return (
      <div className="flex flex-col leading-tight">
        <span className="text-muted text-xs uppercase tracking-wide">Simulation</span>
        <span className="font-display text-sm">—</span>
      </div>
    );
  }

  const live = isSimLive(sim);
  const time = sim.sim_time.split('T')[1] ?? sim.sim_time;
  // City names the clock's place, so a sim time that differs from the viewer's
  // own wall clock isn't read as wrong. First segment only — "Vilnius, Lithuania"
  // → "Vilnius" — to stay compact in the header.
  const city = sim.environment?.city.split(',')[0];

  return (
    <div className="flex flex-col leading-tight">
      <span className="text-muted text-xs uppercase tracking-wide">
        {formatSimDate(sim.date)}
        {city && ` · ${city}`}
      </span>
      <span className="font-display text-sm tabular-nums flex items-center gap-sm">
        {time}
        <span className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: live ? '#4ade80' : '#6b7280' }}
          />
          {live ? 'Live' : 'Ended'}
        </span>
      </span>
    </div>
  );
}

export function Header() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollUpAccumulator = useRef(0);
  const navigate = useNavigate();

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
            isLink
            ariaLabel="Go to home"
            className="image-button lg"
          >
            <img src="/Branding/logo.png" alt="SlopBop Logo" className="header-logo" />
          </ImageButton>

          <SimClock />
        </div>

        <div className="flex items-center">
          <button
            type="button"
            className="primary"
            onClick={() => navigate('/about')}
          >
            About
          </button>
        </div>
      </div>
    </div>
  );
}
