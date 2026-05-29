interface SongStats {
  bops: number;
  slops: number;
  total_votes: number;
}

interface Props {
  coverUrl?: string;
  title: string;
  duration?: number;
  stats?: SongStats;
  onClick: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function ratingEmoji(pct: number): string {
  if (pct >= 90) return '🥶';
  if (pct >= 70) return '🔥';
  if (pct >= 40) return '😪';
  return '💩';
}

export default function SingleCard({ coverUrl, title, duration, stats, onClick }: Props) {
  const approval =
    stats && stats.total_votes > 0
      ? Math.round((stats.bops / stats.total_votes) * 100)
      : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-sm w-full text-left cursor-pointer active:opacity-70 transition-base"
    >
      <img
        src={coverUrl || '/Images/default_song_cover.png'}
        alt={title}
        className="w-10 h-10 object-cover rounded-sm flex-shrink-0"
      />
      <div className="flex flex-col flex-1 min-w-0">
        <p className="text-sm truncate">{title}</p>
        {approval !== null && (
          <span className="text-xs text-muted">{approval}% {ratingEmoji(approval)}</span>
        )}
      </div>
      {duration != null && (
        <span className="text-sm text-muted flex-shrink-0">{formatDuration(duration)}</span>
      )}
    </button>
  );
}
