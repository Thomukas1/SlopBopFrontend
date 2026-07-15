import type { RequestStatus } from '../../services/slopbop';
import SongSubmissionForm from '../../components/SongSubmissionForm';

interface Props {
  mixtapeId: string;
  artistName?: string;
  status: RequestStatus;
  /** Refetch the mixtape so the window is re-evaluated (a 409 closes it, or the
   * final slot fills). */
  refresh: () => void;
}

// Song submissions for a mixtape — the free, always-open counterpart to the
// album's staged Submissions. There's no window or deadline: intake stays open
// until capacity, and songs land one at a time as they're produced (so this sits
// *below* the song list rather than replacing it). Its states:
//
//   open (count < max) → intro + the generic form card (or the thank-you notice)
//   full  → a "tape is full" notice
//   otherwise          → nothing (e.g. not yet configured with max_tracks)
//
// Owns its own top divider so hiding it also removes the divider.
export default function MixtapeSubmissions({ mixtapeId, artistName, status, refresh }: Props) {
  let body: React.ReactNode = null;
  if (status.open) {
    // Intro copy sits above the generic form card (which carries the count
    // header). No deadline strip — a mixtape has no window, just capacity.
    body = (
      <div className="flex flex-col gap-md">
        <p className="text-sm text-secondary leading-relaxed">
          Get on this mixtape by {artistName ?? 'this artist'} — submit a song with
          your own custom lyrics and it'll show up here once it's recorded.
        </p>

        <SongSubmissionForm
          collectionId={mixtapeId}
          trackCount={status.track_count}
          maxTracks={status.max_tracks}
          refresh={refresh}
        />
      </div>
    );
  } else if (status.reason === 'full') {
    body = (
      <div className="frosted-card flex flex-col items-center gap-xs text-center py-sm">
        <span className="text-2xl">🎤</span>
        <p className="text-sm font-semibold text-accent">This mixtape is full!</p>
        <p className="text-xs text-muted">All {status.max_tracks} slots have been taken.</p>
      </div>
    );
  }

  if (!body) return null;

  return (
    <>
      <div className="border-t border-divider" />
      {body}
    </>
  );
}
