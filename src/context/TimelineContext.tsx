import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Environment, toSimWallClock } from '../services/slopbop';

type Mode = 'live' | 'scrubbed';

interface TimelineState {
  mode: Mode;
  // The sim's clock — captured once from the first /sim/current response and
  // static for the sim's life. Null until that first load lands.
  timezone: string | null;
  city: string | null;
  // Naive sim-local wall-clock string, "YYYY-MM-DDTHH:MM". Empty until the
  // timezone is known. In live mode it tracks "now" in `timezone`; in scrubbed
  // mode it is the position the user scrubbed to.
  at: string;
  setEnvironment: (env: Environment) => void;
  setLive: () => void;
  setScrubbedAt: (at: string) => void;
}

const TimelineContext = createContext<TimelineState | null>(null);

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('live');
  const [timezone, setTimezone] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [at, setAt] = useState<string>('');

  // Live clock: re-derive "now" on the sim's wall clock. Identical string
  // values are a setState no-op, so this only re-renders once per minute.
  useEffect(() => {
    if (mode !== 'live' || !timezone) return;
    const tick = () => setAt(toSimWallClock(new Date(), timezone));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [mode, timezone]);

  const setEnvironment = useCallback((env: Environment) => {
    setTimezone(env.timezone);
    setCity(env.city);
  }, []);

  const setLive = useCallback(() => {
    setMode('live');
  }, []);

  const setScrubbedAt = useCallback((next: string) => {
    setMode('scrubbed');
    setAt(next);
  }, []);

  return (
    <TimelineContext.Provider
      value={{ mode, timezone, city, at, setEnvironment, setLive, setScrubbedAt }}
    >
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimeline(): TimelineState {
  const ctx = useContext(TimelineContext);
  if (!ctx) throw new Error('useTimeline must be used within TimelineProvider');
  return ctx;
}
