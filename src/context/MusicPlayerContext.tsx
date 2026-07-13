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
  play: (track: Track) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  skip: (delta: number) => void;
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
  // Set by loadAndPlay so the play/pause sync effect skips its redundant
  // play() on the render where playback was already kicked off directly —
  // a second play() on a still-loading iOS element re-introduces the clip.
  const justLoadedRef = useRef(false);

  // Load a track into the audio element and start it. Stable so the mount
  // effect's `ended` handler can call it to auto-advance the queue.
  const loadAndPlay = useCallback((t: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    // iOS/WebKit reuses one persistent element (needed to keep the autoplay
    // unlock from the user gesture). Reassigning `src` alone doesn't fully tear
    // down the previous media pipeline there, so playback starts on a
    // partially-buffered stream and clips the first ~1-2s. pause()+load()
    // forces a clean reset so it starts at 0 — desktop/Android don't need it
    // but it's harmless for them.
    audio.pause();
    audio.src = t.audioUrl;
    audio.load();
    setTrack(t);
    setCurrentTime(0);
    setDuration(t.duration ?? 0);
    setPlaying(true);
    setLoading(true);
    justLoadedRef.current = true;
    // Start within the user gesture so autoplay policy doesn't block it.
    audio.play().catch(() => {
      setPlaying(false);
      setLoading(false);
    });
  }, []);

  // Create a persistent audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    // Advance to the next queued track, or stop at the end of the queue.
    const onEnded = () => {
      const next = indexRef.current + 1;
      if (next < queueRef.current.length) {
        indexRef.current = next;
        loadAndPlay(queueRef.current[next]);
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
    // loadAndPlay is stable, so the audio element is still set up once.
  }, [loadAndPlay]);

  // Sync play/pause for toggles on the already-loaded track. The initial
  // playback is kicked off directly in play() so it stays inside the user
  // gesture (browsers block deferred autoplay).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    // loadAndPlay already started this track directly; don't fire a second
    // play() on the same render (it re-clips the start on iOS).
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      return;
    }
    if (playing) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing, track]);

  // Play an ordered list as a queue, starting at `startIndex`; each track
  // auto-advances to the next when it ends. The list is snapshotted here, so
  // the caller re-sorting/filtering its source afterwards won't affect what's
  // playing — a new queue only forms on the next playQueue() call.
  const playQueue = useCallback((tracks: Track[], startIndex = 0) => {
    if (!tracks.length) return;
    const i = Math.max(0, Math.min(startIndex, tracks.length - 1));
    queueRef.current = tracks;
    indexRef.current = i;
    setExpanded(false);
    loadAndPlay(tracks[i]);
  }, [loadAndPlay]);

  // Convenience: play a single track as a one-item queue.
  const play = useCallback((t: Track) => playQueue([t], 0), [playQueue]);

  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

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
        play,
        playQueue,
        togglePlay,
        seek,
        skip,
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
