import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

type Mode = 'live' | 'scrubbed';

interface TimelineState {
  mode: Mode;
  at: Date;
  setLive: () => void;
  setScrubbedAt: (at: Date) => void;
}

const TimelineContext = createContext<TimelineState | null>(null);

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('live');
  const [at, setAt] = useState<Date>(() => new Date());

  useEffect(() => {
    if (mode !== 'live') return;
    const id = setInterval(() => setAt(new Date()), 1000);
    return () => clearInterval(id);
  }, [mode]);

  const setLive = useCallback(() => {
    setMode('live');
    setAt(new Date());
  }, []);

  const setScrubbedAt = useCallback((next: Date) => {
    setMode('scrubbed');
    setAt(next);
  }, []);

  return (
    <TimelineContext.Provider value={{ mode, at, setLive, setScrubbedAt }}>
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimeline(): TimelineState {
  const ctx = useContext(TimelineContext);
  if (!ctx) throw new Error('useTimeline must be used within TimelineProvider');
  return ctx;
}
