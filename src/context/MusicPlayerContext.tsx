import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from 'react';

export interface TrackStats {
  bops: number;
  slops: number;
  total_votes: number;
}

export interface Track {
  id: string;
  title: string;
  coverUrl?: string;
  audioUrl: string;
  duration?: number;
  lyrics?: string;
  author?: string;
  stats?: TrackStats;
  artistId?: string;
  artistName?: string;
}

interface MusicPlayerContextValue {
  track: Track | null;
  playing: boolean;
  loading: boolean;
  currentTime: number;
  duration: number;
  expanded: boolean;
  hasNext: boolean;
  hasPrev: boolean;
  play: (track: Track) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  skip: (delta: number) => void;
  next: () => void;
  prev: () => void;
  expand: () => void;
  collapse: () => void;
  close: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // The active queue is a snapshot taken at play() time. Held in refs (not
  // state) so the `ended` handler — registered once on mount — can advance it
  // without going stale, and so re-sorting the source list can't disturb it.
  const queueRef = useRef<Track[]>([]);
  const indexRef = useRef(0);

  // …but the position also has to be *rendered* (the prev/next stickers appear
  // and disappear with it), and refs don't re-render. Mirrored into state, which
  // only ever changes when the queue or the index does — go() owns both.
  const [queueIndex, setQueueIndex] = useState(0);
  const [queueLength, setQueueLength] = useState(0);

  // Load a track into the audio element and start it. Stable so the mount
  // effect's `ended` handler can call it to auto-advance the queue.
  const loadAndPlay = useCallback((t: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = t.audioUrl;
    setTrack(t);
    setCurrentTime(0);
    setDuration(t.duration ?? 0);
    setPlaying(true);
    setLoading(true);
    // Start within the user gesture so autoplay policy doesn't block it.
    audio.play().catch(() => {
      setPlaying(false);
      setLoading(false);
    });
  }, []);

  // Jump to a queue position. The single place the index moves, so the ref and
  // the rendered mirror can't drift apart. Out-of-range is a no-op.
  const go = useCallback((i: number) => {
    if (i < 0 || i >= queueRef.current.length) return;
    indexRef.current = i;
    setQueueIndex(i);
    loadAndPlay(queueRef.current[i]);
  }, [loadAndPlay]);

  // Create a persistent audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    // Advance to the next queued track, or stop at the end of the queue.
    const onEnded = () => {
      if (indexRef.current + 1 < queueRef.current.length) {
        go(indexRef.current + 1);
      } else {
        setPlaying(false);
      }
    };
    // Buffering / readiness — these drive the loading indicator.
    const onWaiting = () => setLoading(true);
    const onPlaying = () => setLoading(false);
    const onCanPlay = () => setLoading(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('canplay', onCanPlay);
      audio.pause();
    };
    // go is stable, so the audio element is still set up once.
  }, [go]);

  // Sync play/pause for toggles on the already-loaded track. The initial
  // playback is kicked off directly in play() so it stays inside the user
  // gesture (browsers block deferred autoplay).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (playing) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing, track]);

  // Play an ordered list as a queue, starting at `startIndex`; each track
  // auto-advances to the next when it ends.
  //
  // `startIndex` is a playhead position, not a slice point — callers pass the
  // *whole* list they're rendering and the row that was pressed, so pressing
  // row 4 leaves rows 1-3 behind the playhead and prev/next can walk the full
  // list either way. This is what makes the queue de-facto songlist-shaped:
  // whatever list you press in becomes the queue, replacing the previous one.
  //
  // The list is snapshotted here, so the caller re-sorting/filtering its source
  // afterwards won't affect what's playing — a new queue only forms on the next
  // playQueue() call. Trade-off: re-sorting mid-playback leaves prev/next
  // walking the order that was on screen when playback started.
  const playQueue = useCallback((tracks: Track[], startIndex = 0) => {
    if (!tracks.length) return;
    queueRef.current = tracks;
    setQueueLength(tracks.length);
    setExpanded(false);
    go(Math.max(0, Math.min(startIndex, tracks.length - 1)));
  }, [go]);

  // Convenience: play a single track as a one-item queue.
  const play = useCallback((t: Track) => playQueue([t], 0), [playQueue]);

  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

  const next = useCallback(() => go(indexRef.current + 1), [go]);
  const prev = useCallback(() => go(indexRef.current - 1), [go]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const skip = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + delta, audio.duration || 0));
  }, []);

  const expand = useCallback(() => setExpanded(true), []);
  const collapse = useCallback(() => setExpanded(false), []);

  const close = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    queueRef.current = [];
    indexRef.current = 0;
    setQueueIndex(0);
    setQueueLength(0);
    setPlaying(false);
    setLoading(false);
    setCurrentTime(0);
    setTrack(null);
    setExpanded(false);
  }, []);

  return (
    <MusicPlayerContext.Provider
      value={{
        track,
        playing,
        loading,
        currentTime,
        duration,
        expanded,
        hasNext: queueIndex < queueLength - 1,
        hasPrev: queueIndex > 0,
        play,
        playQueue,
        togglePlay,
        seek,
        skip,
        next,
        prev,
        expand,
        collapse,
        close,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  return ctx;
}
