import { useState } from 'react';
import { TextField, TextAreaField } from '../form';
import { useSubmitSongRequest } from '../../hooks/useSubmitSongRequest';
import { useToast } from '../../context/ToastContext';

// Field length caps, mirroring the backend's validation rules.
const AUTHOR_MAX = 18;
const TEXT_MAX = 260;

// Device-level one-per-person dedup. The submission endpoint has no auth, so the
// server can't enforce "one per person" — we remember which collections this
// device has already submitted to and show the thank-you notice on return visits.
// Best-effort only (cleared with site data), which is the intent.
const SUBMITTED_KEY = 'slopbop_submissions';

function getSubmittedCollections(): Record<string, true> {
  try {
    return JSON.parse(localStorage.getItem(SUBMITTED_KEY) || '{}');
  } catch {
    return {};
  }
}

function markSubmitted(collectionId: string) {
  const submitted = getSubmittedCollections();
  submitted[collectionId] = true;
  localStorage.setItem(SUBMITTED_KEY, JSON.stringify(submitted));
}

interface Props {
  /** The collection (album or mixtape) this submission is written against. */
  collectionId: string;
  /** Submissions received so far — shown centered at the top of the card. */
  trackCount: number;
  /** Capacity — the denominator of the count header. */
  maxTracks: number;
  /** Refetch the collection so the window is re-evaluated (capacity hit, or a
   * 409 closes it). */
  refresh: () => void;
}

/**
 * The generic "write a song" card, shared verbatim by albums and mixtapes. It's
 * a self-contained card: a centered `count / max songs` header, then the two
 * fields + submit (or a thank-you once this device has submitted). It owns only
 * the submission itself — the POST, validation, and per-device dedup.
 *
 * Everything *around* it — the intro copy, any deadline countdown, the lifecycle
 * gating that decides whether the card shows at all — lives in the per-type
 * manager that renders it (album `Submissions`, `MixtapeSubmissions`), so this
 * stays identical for every collection type.
 */
export default function SongSubmissionForm({ collectionId, trackCount, maxTracks, refresh }: Props) {
  const [submitted, setSubmitted] = useState(() => !!getSubmittedCollections()[collectionId]);
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
      const outcome = await submit(collectionId, { author, text });
      if (outcome.ok) {
        markSubmitted(collectionId);
        setAuthor('');
        setText('');
        showToast('Submission sent successfully!', 'success');
        setSubmitted(true);
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
    <div className="frosted-card flex flex-col gap-lg">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-base">Write a song</h3>
        <span className="text-sm font-semibold text-accent">{trackCount} / {maxTracks} songs</span>
      </div>

      {submitted ? (
        <SubmittedNotice />
      ) : (
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
      )}
    </div>
  );
}

// Shown in place of the form once this device has submitted. Any capacity gauge
// above still carries the count, so this only has to confirm the state.
function SubmittedNotice() {
  return (
    <div className="flex flex-col items-center gap-xs text-center rounded-lg border border-accent/30 bg-accent/5 py-lg px-md">
      <span className="text-2xl">🎉</span>
      <p className="text-sm font-semibold text-accent">Thanks for your submission!</p>
      <p className="text-xs text-muted">Only one submission per person is allowed.</p>
    </div>
  );
}
