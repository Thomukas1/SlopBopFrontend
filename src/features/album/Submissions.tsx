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
  /** Refetch the album so the window is re-evaluated (start/deadline hits, or a
   * 409 closes it). */
  refresh: () => void;
}

// Song submissions for this album. Rendered on the album page. The stage shown
// depends on the evaluated window: a countdown before it opens, the form while
// it's open, or a reason-keyed notice once closed. A device that has already
// submitted sees a thank-you notice instead of the form.
export default function Submissions({ albumId, artistName, status, refresh }: Props) {
  const [submitted, setSubmitted] = useState(() => !!getSubmittedAlbums()[albumId]);

  let body: React.ReactNode;
  if (submitted) {
    body = <SubmittedNotice />;
  } else if (status.open) {
    body = (
      <SubmissionForm
        albumId={albumId}
        artistName={artistName}
        status={status}
        refresh={refresh}
        onSubmitted={() => setSubmitted(true)}
      />
    );
  } else if (status.reason === 'not_started') {
    body = <PendingNotice status={status} onStart={refresh} />;
  } else {
    body = <ClosedNotice status={status} />;
  }

  return <div className="frosted-card">{body}</div>;
}

interface FormProps extends Props {
  onSubmitted: () => void;
}

function SubmissionForm({ albumId, artistName, status, refresh, onSubmitted }: FormProps) {
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
          {submitting ? 'Sending…' : 'Send submission'}
        </button>
      </div>
    </div>
  );
}

function SubmittedNotice() {
  return (
    <p className="text-sm text-secondary leading-relaxed">
      Thanks — you've already submitted a song for this album. Only one
      submission per person is allowed.
    </p>
  );
}

// The window is configured but hasn't opened yet. Show a countdown to the start;
// when it elapses, refresh so the form takes over.
function PendingNotice({ status, onStart }: { status: RequestStatus; onStart: () => void }) {
  return (
    <div className="flex flex-col gap-sm">
      <p className="text-sm text-secondary leading-relaxed">
        Submissions for this album haven't opened yet.
      </p>
      {status.submission_start ? (
        <div className="text-xs font-semibold text-accent">
          <Countdown
            target={status.submission_start}
            onExpire={onStart}
            render={r => `Opens in ${r}`}
          />
        </div>
      ) : (
        <p className="text-xs text-muted">Check back soon.</p>
      )}
    </div>
  );
}

function ClosedNotice({ status }: { status: RequestStatus }) {
  let message: string;
  switch (status.reason) {
    case 'deadline_passed':
      message = status.submission_deadline
        ? `Submissions closed on ${formatDate(status.submission_deadline)}`
        : 'Submissions are closed for this album';
      break;
    case 'album_full':
      message = `This album is full (${status.track_count}/${status.max_tracks})`;
      break;
    default: // 'not_configured' or any unknown reason
      message = 'Not accepting song submissions';
  }
  return <p className="text-sm text-muted">{message}</p>;
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
  render: (remaining: string) => string;
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

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
