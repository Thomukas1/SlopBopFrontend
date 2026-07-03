import { useState, useEffect } from 'react';
import { TextField, TextAreaField } from '../../primitives/form';
import type { RequestStatus } from '../../services/slopbop';
import { useSubmitSongRequest } from '../../hooks/useSubmitSongRequest';
import { useToast } from '../../context/ToastContext';

// Field length caps, mirroring the backend's validation rules.
const AUTHOR_MAX = 18;
const LYRICS_MAX = 280;

interface Props {
  artistId: string;
  albumId: string;
  artistName?: string;
  status: RequestStatus;
  /** Refetch the album so status is re-evaluated (deadline hits, or a 409 closes it). */
  onClosed: () => void;
}

// Song requests for this album. Rendered on the album page, where both the
// artist and album ids are known and travel with the payload. The form only
// shows while the window is open; otherwise a reason-keyed notice takes its
// place. A 409 on submit means the window closed under us — surface it and
// refetch so the form disappears.
export default function Requests(props: Props) {
  return (
    <div className="frosted-card">
      {props.status.open ? <RequestForm {...props} /> : <ClosedNotice status={props.status} />}
    </div>
  );
}

function RequestForm({ artistId, albumId, artistName, status, onClosed }: Props) {
  const { submit, submitting, fieldErrors } = useSubmitSongRequest();
  const { showToast } = useToast();

  const [author, setAuthor] = useState('');
  const [lyrics, setLyrics] = useState('');

  const authorValid = author.trim().length > 0 && author.length <= AUTHOR_MAX;
  const lyricsValid = lyrics.trim().length > 0 && lyrics.length <= LYRICS_MAX;
  const allValid = authorValid && lyricsValid;

  async function handleSend() {
    if (!allValid) return;
    try {
      const outcome = await submit({ artistId, albumId, author, lyrics });
      if (outcome.ok) {
        setAuthor('');
        setLyrics('');
        showToast('Request sent successfully!', 'success');
      } else if (outcome.kind === 'closed') {
        // Window closed between load and submit — tell the user and refresh so
        // the form gives way to the closed notice.
        showToast(outcome.message, 'warning');
        onClosed();
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
        Help {artistName ?? 'this artist'} produce this album by requesting a
        song with your own custom lyrics.
      </p>

      <div className="flex items-center justify-between text-xs font-semibold text-accent">
        <span>{status.track_count} / {status.max_tracks} songs</span>
        {status.deadline && (
          <Countdown deadline={status.deadline} onExpire={onClosed} />
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
          value={lyrics}
          onChange={setLyrics}
          maxLength={LYRICS_MAX}
          rows={5}
          placeholder="Write the lyrics you'd like them to sing…"
          help={`${lyrics.length}/${LYRICS_MAX}`}
          error={fieldErrors.lyrics}
        />

        <button
          type="button"
          className="special full-width"
          disabled={!allValid || submitting}
          onClick={handleSend}
        >
          {submitting ? 'Sending…' : 'Send request'}
        </button>
      </div>
    </div>
  );
}

function ClosedNotice({ status }: { status: RequestStatus }) {
  let message: string;
  switch (status.reason) {
    case 'deadline_passed':
      message = status.deadline
        ? `Requests closed on ${formatDate(status.deadline)}`
        : 'Requests are closed for this album';
      break;
    case 'album_full':
      message = `This album is full (${status.track_count}/${status.max_tracks})`;
      break;
    default: // 'not_configured' or any unknown reason
      message = 'Not accepting song requests';
  }
  return <p className="text-sm text-muted">{message}</p>;
}

// Live countdown to the deadline, ticking each second. Once it elapses it calls
// onExpire (once) so the parent refetches and the form closes.
function Countdown({ deadline, onExpire }: { deadline: string; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(() => Date.parse(deadline) - Date.now());

  useEffect(() => {
    const target = Date.parse(deadline);
    let fired = false;
    const tick = () => {
      const ms = target - Date.now();
      setRemaining(ms);
      if (ms <= 0 && !fired) {
        fired = true;
        onExpire();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline, onExpire]);

  if (remaining <= 0) return <span>Closing…</span>;
  return <span>{formatRemaining(remaining)} left</span>;
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
