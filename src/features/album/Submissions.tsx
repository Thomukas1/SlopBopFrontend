import { useState, useEffect } from 'react';
import { TextField, TextAreaField } from '../../primitives/form';
import type { RequestStatus } from '../../services/slopbop';
import { useSubmitSongRequest } from '../../hooks/useSubmitSongRequest';
import { useToast } from '../../context/ToastContext';

// Field length caps, mirroring the backend's validation rules.
const AUTHOR_MAX = 18;
const TEXT_MAX = 260;

// Device-level one-per-person dedup. The submission endpoint has no auth, so the
// server can't enforce "one per person" — we remember which albums this device
// has already submitted to and hide the form on return visits. Best-effort only
// (cleared with site data), which is the intent.
const SUBMITTED_KEY = 'slopbop_submissions';

function getSubmittedAlbums(): Record<string, true> {
  try {
    return JSON.parse(localStorage.getItem(SUBMITTED_KEY) || '{}');
  } catch {
    return {};
  }
}

function markSubmitted(albumId: string) {
  const submitted = getSubmittedAlbums();
  submitted[albumId] = true;
  localStorage.setItem(SUBMITTED_KEY, JSON.stringify(submitted));
}

interface Props {
  albumId: string;
  artistName?: string;
  status: RequestStatus;
  /** Number of songs published on the album (released or upcoming). Once the
   * first one exists, submissions are done and the whole panel hides. */
  songCount: number;
  /** Refetch the album so the window is re-evaluated (start/deadline hits, or a
   * 409 closes it). */
  refresh: () => void;
}

// Song submissions for this album, rendered on the album page. Its lifecycle:
//
//   window open        → info panel + form (or "already submitted" once you have)
//   window not started → countdown to the opening
//   closed, songs → 0  → "being produced" wait (submissions came in, no song yet)
//   first song exists  → nothing at all (its job is done)
//   never any activity → nothing at all
//
// The panel owns its own top divider so that hiding it also removes the divider —
// the album page just drops <Submissions/> in and lets it decide whether to show.
export default function Submissions({ albumId, artistName, status, songCount, refresh }: Props) {
  const [submitted, setSubmitted] = useState(() => !!getSubmittedAlbums()[albumId]);

  let body: React.ReactNode = null;
  if (songCount > 0) {
    // First song is published — the submission phase is over. Render nothing.
    body = null;
  } else if (status.open) {
    body = (
      <InfoPanel status={status} artistName={artistName} refresh={refresh}>
        {submitted ? (
          <SubmittedNotice />
        ) : (
          <SubmissionForm
            albumId={albumId}
            refresh={refresh}
            onSubmitted={() => setSubmitted(true)}
          />
        )}
      </InfoPanel>
    );
  } else if (status.reason === 'not_started') {
    body = <PendingNotice status={status} onStart={refresh} />;
  } else if (status.track_count > 0) {
    // Closed with submissions in hand but no song published yet — the production
    // wait before the first track is generated.
    body = <ProducingNotice />;
  }

  if (!body) return null;

  return (
    <>
      <div className="border-t border-white/10" />
      <div className="frosted-card">{body}</div>
    </>
  );
}

// The persistent header shown while the window is open: intro, capacity gauge and
// deadline countdown. Stays put whether the viewer sees the form or the
// already-submitted notice, so they always know how this period is tracking.
function InfoPanel({
  status,
  artistName,
  refresh,
  children,
}: {
  status: RequestStatus;
  artistName?: string;
  refresh: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-lg">
      <p className="text-sm text-secondary leading-relaxed">
        Help {artistName ?? 'this artist'} produce this album by submitting a
        song with your own custom lyrics.
      </p>

      <div className="flex items-center justify-between text-xs font-semibold text-accent">
        <span>{status.track_count} / {status.max_tracks} songs</span>
        {status.submission_deadline && (
          <Countdown
            target={status.submission_deadline}
            onExpire={refresh}
            render={r => `${r} left`}
          />
        )}
      </div>

      {children}
    </div>
  );
}

interface FormProps {
  albumId: string;
  refresh: () => void;
  onSubmitted: () => void;
}

function SubmissionForm({ albumId, refresh, onSubmitted }: FormProps) {
  const { submit, submitting, fieldErrors } = useSubmitSongRequest();
  const { showToast } = useToast();

  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');

  const authorValid = author.trim().length > 0 && author.length <= AUTHOR_MAX;
  const textValid = text.trim().length > 0 && text.length <= TEXT_MAX;
  const allValid = authorValid && textValid;

  async function handleSend() {
    if (!allValid) return;
    try {
      const outcome = await submit(albumId, { author, text });
      if (outcome.ok) {
        markSubmitted(albumId);
        setAuthor('');
        setText('');
        showToast('Submission sent successfully!', 'success');
        onSubmitted();
      } else if (outcome.kind === 'closed') {
        // Window closed between load and submit — tell the user and refresh so
        // the form gives way to the closed notice.
        showToast(outcome.message, 'warning');
        refresh();
      } else {
        showToast('Please fix the highlighted fields and try again.', 'warning');
      }
    } catch {
      showToast('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="form">
      <TextField
        label="Your name"
        required
        value={author}
        onChange={setAuthor}
        maxLength={AUTHOR_MAX}
        help={`${author.length}/${AUTHOR_MAX}`}
        error={fieldErrors.author}
      />

      <TextAreaField
        label="Lyrics"
        required
        value={text}
        onChange={setText}
        maxLength={TEXT_MAX}
        rows={5}
        placeholder="Write the lyrics you'd like them to sing…"
        help={`${text.length}/${TEXT_MAX}`}
        error={fieldErrors.text}
      />

      <button
        type="button"
        className="special full-width"
        disabled={!allValid || submitting}
        onClick={handleSend}
      >
        {submitting ? 'Submitting…' : 'Submit'}
      </button>
    </div>
  );
}

// Shown in place of the form once this device has submitted. The info panel above
// still carries the count and countdown, so this only has to confirm the state.
function SubmittedNotice() {
  return (
    <div className="flex flex-col items-center gap-xs text-center rounded-lg border border-accent/30 bg-accent/5 py-lg px-md">
      <span className="text-2xl">🎉</span>
      <p className="text-sm font-semibold text-accent">Thanks for your submission!</p>
      <p className="text-xs text-muted">Only one submission per person is allowed.</p>
    </div>
  );
}

// The window is configured but hasn't opened yet. Show a countdown to the start;
// when it elapses, refresh so the form takes over.
function PendingNotice({ status, onStart }: { status: RequestStatus; onStart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-sm text-center">
      <p className="text-sm text-secondary leading-relaxed">
        The song submissions for this album opens in…
      </p>
      {status.submission_start ? (
        <Countdown
          target={status.submission_start}
          onExpire={onStart}
          render={r => (
            <span className="text-2xl font-bold text-accent">{r}</span>
          )}
        />
      ) : (
        <p className="text-xs text-muted">Check back soon.</p>
      )}
    </div>
  );
}

// Submissions are in and closed, but no song has been generated yet — the album
// is being produced. Disappears entirely once the first song publishes.
function ProducingNotice() {
  return (
    <div className="flex flex-col items-center gap-md text-center py-sm">
      <div className="spinner large processing" />
      <p className="text-sm text-secondary leading-relaxed">
        The album is being produced — hang tight!
      </p>
    </div>
  );
}

// Live countdown to a target time, ticking each second. Once it elapses it calls
// onExpire (once) so the parent refetches and the stage advances.
function Countdown({
  target,
  onExpire,
  render,
}: {
  target: string;
  onExpire: () => void;
  render: (remaining: string) => React.ReactNode;
}) {
  const [remaining, setRemaining] = useState(() => Date.parse(target) - Date.now());

  useEffect(() => {
    const at = Date.parse(target);
    let fired = false;
    const tick = () => {
      const ms = at - Date.now();
      setRemaining(ms);
      if (ms <= 0 && !fired) {
        fired = true;
        onExpire();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, onExpire]);

  if (remaining <= 0) return <span>Updating…</span>;
  return <span>{render(formatRemaining(remaining))}</span>;
}

function formatRemaining(ms: number): string {
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
