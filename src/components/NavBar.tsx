import { useLocation, useNavigate } from 'react-router-dom';

type Tab = { path: string; emoji: string; label: string };

const TABS: Tab[] = [
  { path: '/', emoji: '🎪', label: 'About' },
  { path: '/roster', emoji: '🎭', label: 'Roster' },
  { path: '/bootcamp', emoji: '👩‍🎤', label: 'Bootcamp' },
  // Deferred features — routes still work, just hidden from the nav for now.
  // Restore by re-adding these entries when Map and Apply come back.
  // { path: '/map', emoji: '🗺️', label: 'Map' },
  // { path: '/apply', emoji: '🎙️', label: 'Apply' },
];

export function NavBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-fixed h-[60px] bg-surface-2 border-t border-border">
      <div className="max-w-[430px] mx-auto h-full flex items-center justify-around">
        {TABS.map(({ path, emoji, label }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
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
