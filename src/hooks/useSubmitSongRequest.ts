import { useState, useCallback } from 'react';
import {
  submitSongRequest,
  SongRequestPayload,
  SongRequestResult,
  SongRequestOutcome,
} from '../services/slopbop';

// Command-shaped mutation hook: POST a song request and surface the result.
// `fieldErrors` maps payload field names → messages from a 400; map them onto
// inputs. A 404 / 500 / network error rejects — callers should show a generic
// retry.
export function useSubmitSongRequest() {
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SongRequestResult | null>(null);

  const submit = useCallback(
    async (albumId: string, payload: SongRequestPayload): Promise<SongRequestOutcome> => {
      setSubmitting(true);
      setFieldErrors({});
      try {
        const outcome = await submitSongRequest(albumId, payload);
        if (outcome.ok) setResult(outcome.data);
        else if (outcome.kind === 'validation') setFieldErrors(outcome.errors);
        return outcome;
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { submit, submitting, fieldErrors, result };
}
