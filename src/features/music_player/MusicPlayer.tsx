import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import BopMeter from './BopMeter';
import Img from '../../primitives/Img';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function safeFilename(title: string): string {
  const cleaned = title.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '');
  return `${cleaned || 'song'}.mp3`;
}

// Some lyrics land in the DB with literal escape sequences ("\n", "\r\n", "\t")
// instead of real whitespace — usually a bad lyrics.txt write upstream. Convert
// them back to real characters so `whitespace-pre-line` can break on them.
function normalizeLyrics(lyrics: string): string {
  return lyrics.replace(/\\r\\n|\\n|\\r/g, '\n').replace(/\\t/g, '\t');
}

export default function MusicPlayer() {
  const {
    track,
    playing,
    loading,
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

  const [downloading, setDownloading] = useState(false);

  // Songs are free to use — pull the file cross-origin (gateway allows it)
  // and hand the user a real download with a sensible filename. Falls back
  // to opening the URL if the fetch is blocked.
  const handleDownload = useCallback(async () => {
    if (!track || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(track.audioUrl);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = safeFilename(track.title);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(track.audioUrl, '_blank', 'noopener');
    } finally {
      setDownloading(false);
    }
  }, [track, downloading]);

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

      {/* Content column — constrained to the cover's width and centered, so
          on desktop the meta/controls don't sprawl to the screen edges. */}
      <div className="mx-auto w-full max-w-player px-lg">
        {/* Artist (left) + download (right) — above the cover */}
        <div className="flex items-center justify-between gap-md mb-md">
        {track.artistId && track.artistName ? (
          <Link
            to={`/artists/${track.artistId}`}
            onClick={collapse}
            className="text-sm text-muted underline truncate"
          >
            by {track.artistName}
          </Link>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          aria-label="Download song"
          className="flex-shrink-0 cursor-pointer active:scale-90 transition-base disabled:opacity-50"
        >
          {downloading ? (
            <svg viewBox="0 0 24 24" className="w-7 h-7 animate-spin" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
              <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7"
            >
              <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
          )}
        </button>
      </div>

        {/* Cover art */}
        <Img
          src={track.coverUrl || '/Images/default_song_cover.png'}
          alt={track.title}
          className="w-full aspect-square rounded-lg"
        />

        {/* Title — centered under the cover */}
        <p className="mt-lg text-center text-2xl font-bold truncate">{track.title}</p>
      </div>

      {/* Controls + slider — full screen width */}
      <div className="flex flex-col gap-md px-xl py-xl">
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
            {loading ? (
              <svg viewBox="0 0 24 24" className="w-7 h-7 animate-spin" fill="none">
                <circle cx="12" cy="12" r="9" stroke="var(--black)" strokeWidth="2" strokeOpacity="0.25" />
                <path d="M12 3a9 9 0 0 1 9 9" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : playing ? (
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
          <div
            className="music-player-progress"
            style={{ '--progress': `${progress}%` } as React.CSSProperties}
          >
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="music-player-slider"
            />
          </div>
          <div className="flex justify-between text-xs text-muted">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <BopMeter />

      {/* Lyrics — centered column (aligned with the content above), but the
          text itself stays left-aligned. */}
      {track.lyrics && (
        <div className="mx-auto w-full max-w-player px-lg pb-3xl">
          <h3 className="font-display text-lg mb-md">Lyrics</h3>
          <p className="text-sm text-muted whitespace-pre-line leading-relaxed">
            {normalizeLyrics(track.lyrics)}
          </p>
        </div>
      )}
    </div>
  );
}
