import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import BopMeter from './BopMeter';
import './music-player.css';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function MusicPlayer() {
  const {
    track,
    playing,
    currentTime,
    duration,
    expanded,
    togglePlay,
    seek,
    skip,
    collapse,
  } = useMusicPlayer();

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => seek(Number(e.target.value)),
    [seek],
  );

  if (!track || !expanded) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-modal bg-black overflow-y-auto">
      {/* Header */}
      <div className="flex justify-end p-lg">
        <button type="button" onClick={collapse} className="cursor-pointer">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
          </svg>
        </button>
      </div>

      {/* Cover art */}
      <div className="flex items-center justify-center px-xl">
        <img
          src={track.coverUrl || '/Images/default_song_cover.png'}
          alt={track.title}
          className="w-full max-w-player aspect-square object-cover rounded-lg"
        />
      </div>

      {/* Title + artist */}
      <div className="flex flex-col items-center px-lg mt-lg gap-xs">
        <p className="text-center text-2xl font-bold truncate w-full">{track.title}</p>
        {track.artistId && track.artistName && (
          <Link
            to={`/artists/${track.artistId}`}
            onClick={collapse}
            className="text-sm text-muted underline"
          >
            {track.artistName}
          </Link>
        )}
      </div>

      {/* Controls + slider */}
      <div className="flex flex-col gap-md p-xl">
        <div className="flex items-center justify-center gap-3xl">
          <button
            type="button"
            onClick={() => skip(-15)}
            className="text-muted text-sm font-bold cursor-pointer active:scale-90 transition-base"
          >
            -15s
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center cursor-pointer
                       active:scale-90 transition-base"
          >
            {playing ? (
              <svg viewBox="0 0 24 24" fill="var(--black)" className="w-7 h-7">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="var(--black)" className="w-7 h-7 ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => skip(15)}
            className="text-muted text-sm font-bold cursor-pointer active:scale-90 transition-base"
          >
            +15s
          </button>
        </div>

        <div className="flex flex-col gap-xs">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="music-player-slider w-full"
            style={{ '--progress': `${progress}%` } as React.CSSProperties}
          />
          <div className="flex justify-between text-xs text-muted">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <BopMeter />

      {/* Lyrics */}
      {track.lyrics && (
        <div className="px-xl pb-3xl">
          <h3 className="font-display text-lg mb-md">Lyrics</h3>
          <p className="text-sm text-muted whitespace-pre-line leading-relaxed">
            {track.lyrics}
          </p>
        </div>
      )}
    </div>
  );
}
