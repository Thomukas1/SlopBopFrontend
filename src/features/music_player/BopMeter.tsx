import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { useSongVote } from '../../hooks/useSongVote';

export default function BopMeter() {
  const { track } = useMusicPlayer();
  const { stats, userVote, voting, vote } = useSongVote(track?.id, track?.stats);

  if (!stats) return null;

  const bopPercent = stats.total_votes > 0
    ? Math.round((stats.bops / stats.total_votes) * 100)
    : 0;

  return (
    <div className="bop-meter-strip relative overflow-hidden py-xl my-md">
      <div className="bop-meter-bg absolute inset-0 -z-10" />

      <div className="flex flex-col items-center gap-sm px-xl relative">
        <p className="font-display text-2xl">
          {bopPercent}% BOP
        </p>

        <p className="text-xs text-muted">
          {stats.total_votes} Voted
        </p>

        <div className="flex gap-md w-full max-w-player">
          <button
            type="button"
            disabled={!!userVote || voting}
            onClick={() => vote('slop')}
            className={`flex-1 py-sm rounded-lg font-bold text-sm transition-base cursor-pointer
              ${userVote === 'slop'
                ? 'bg-danger text-black'
                : userVote
                  ? 'bg-surface text-muted cursor-not-allowed'
                  : 'bg-danger text-black active:scale-95'
              }`}
          >
            SLOP 🤮
          </button>
          <button
            type="button"
            disabled={!!userVote || voting}
            onClick={() => vote('bop')}
            className={`flex-1 py-sm rounded-lg font-bold text-sm transition-base cursor-pointer
              ${userVote === 'bop'
                ? 'bg-accent text-black'
                : userVote
                  ? 'bg-surface text-muted cursor-not-allowed'
                  : 'bg-accent text-black active:scale-95'
              }`}
          >
            BOP 🤩
          </button>
        </div>
      </div>
    </div>
  );
}
