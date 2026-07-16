import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type Tab = { path: string; emoji: string; label: string };

const TABS: Tab[] = [
  { path: '/', emoji: '🎪', label: 'About' },
  { path: '/roster', emoji: '🎭', label: 'Roster' },
  { path: '/commission', emoji: '👩🏻‍🎤', label: 'Commission' },
  // Deferred features — routes still work, just hidden from the nav for now.
  // Restore by re-adding these entries when Map and Apply come back.
  // { path: '/map', emoji: '🗺️', label: 'Map' },
  // { path: '/apply', emoji: '🎙️', label: 'Apply' },
];

export function NavBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Channel-change static: themed noise bands pop in to cover the page (the CSS
  // for `.tv-switching` lives in transitions.css), swap the route ~230ms in
  // (while the bands fully cover the screen) so the cut is hidden, then clear
  // the class after the burst ends. Reduced-motion users skip it.
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const handleNav = (path: string) => {
    if (path === pathname) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      navigate(path);
      return;
    }

    const root = document.documentElement;
    timers.current.forEach(clearTimeout);
    // Restart the burst cleanly if one's still mid-flight.
    root.classList.remove('tv-switching');
    void root.offsetWidth; // force reflow so the animation re-triggers
    root.classList.add('tv-switching');

    timers.current = [
      window.setTimeout(() => navigate(path), 250),
      window.setTimeout(() => root.classList.remove('tv-switching'), 510),
    ];
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-fixed h-[60px] bg-surface-2 border-t border-border">
      <div className="max-w-[430px] mx-auto h-full flex items-center justify-around">
        {TABS.map(({ path, emoji, label }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              type="button"
              onClick={() => handleNav(path)}
              className={`flex flex-col items-center gap-0.5 px-8 h-full justify-center transition-base ${
                active ? 'text-accent' : 'text-muted'
              }`}
            >
              <span className="text-xl leading-none">{emoji}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
