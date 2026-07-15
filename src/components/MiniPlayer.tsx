import { useCallback, useRef, useState } from 'react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useSongVote } from '../hooks/useSongVote';
import type { VoteType } from '../services/slopbop';
import Img from '../primitives/Img';

// Pre-computed spark trajectories — a fan of upward vectors so the burst
// sprays across the top of the bar. Colours alternate lime / white to pop.
const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (-90 + (i - 5.5) * 14) * (Math.PI / 180);
  const dist = 65 + (i % 3) * 28;
  return {
    '--tx': `${Math.cos(angle) * dist}px`,
    '--ty': `${Math.sin(angle) * dist}px`,
    '--d': `${(i % 4) * 0.03}s`,
    '--c': i % 2 ? 'var(--white)' : 'var(--accent)',
  } as React.CSSProperties;
});

export default function MiniPlayer() {
  const { track, playing, currentTime, duration, togglePlay, expand, close, expanded } = useMusicPlayer();
  const { userVote, voting, vote } = useSongVote(track?.id, track?.stats);
  const [celebrating, setCelebrating] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const handleVote = useCallback(
    (e: React.MouseEvent, type: VoteType) => {
      e.stopPropagation();
      if (userVote || voting) return;
      // Fire the burst optimistically the moment they tap — the vote request
      // resolves in the background and the buttons hide on `voting` instantly.
      setCelebrating(true);
      vote(type);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCelebrating(false), 1100);
    },
    [userVote, voting, vote],
  );

  if (!track || expanded) return null;

  const showVote = !userVote && !voting;
  // Same source of truth as the full player's bar — just read-only here.
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="mini-player fixed bottom-[60px] left-0 right-0 z-modal-backdrop
                 bg-accent border-t border-border
                 flex items-center gap-sm px-md py-sm cursor-pointer
                 active:opacity-80 transition-base"
      onClick={expand}
    >
      {celebrating && (
        <div className="vote-burst" aria-hidden="true">
          <span className="vote-burst-glow" />
          {SPARKS.map((style, i) => (
            <span key={i} className="vote-burst-spark" style={style} />
          ))}
          <span className="vote-burst-text">Thanks for your vote!</span>
        </div>
      )}

      <Img
        src={track.coverUrl || '/Images/default_song_cover.png'}
        alt={track.title}
        className="w-10 h-10 rounded-sm flex-shrink-0"
      />

      {!showVote && (
        <span className="text-sm font-medium truncate flex-1 text-alt">{track.title}</span>
      )}

      {showVote && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        flex items-center gap-sm">
          <button
            type="button"
            onClick={(e) => handleVote(e, 'slop')}
            aria-label="Vote slop"
            className="px-sm py-xs rounded-lg bg-danger text-white text-sm font-bold
                       cursor-pointer active:scale-90 transition-base"
          >
            SLOP 🤮
          </button>
          <button
            type="button"
            onClick={(e) => handleVote(e, 'bop')}
            aria-label="Vote bop"
            className="px-sm py-xs rounded-lg bg-black text-accent text-sm font-bold
                       cursor-pointer active:scale-90 transition-base"
          >
            BOP 🤩
          </button>
        </div>
      )}

      <div className="flex items-center flex-shrink-0 ml-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="w-9 h-9 rounded-full bg-white flex items-center justify-center
                     cursor-pointer active:scale-90 transition-base mr-sm"
        >
          {playing ? (
            <svg viewBox="0 0 24 24" fill="var(--black)" className="w-4 h-4">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="var(--black)" className="w-4 h-4 ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          className="w-8 h-8 flex items-center justify-center
                     cursor-pointer active:scale-90 transition-base"
        >
          <img src="/Icons/CloseIcon.PNG" alt="Close" className="w-5 h-5" />
        </button>
      </div>

      {/* Slim non-interactive playback progress — Spotify-style, on the bar's
          bottom edge. Dark fill so it reads against the lime bar. */}
      <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-black/15">
        <div className="h-full bg-black/70" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
