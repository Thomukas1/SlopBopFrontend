import { API_URL } from './client';

// A song request submitted against an artist. Wire format is camelCase; the
// backend is the trust boundary, so these mirror its validation rules in the
// comments only. `lyrics` preserves internal line breaks (server normalizes
// \r\n / \r → \n and trims only the outer edges).
export interface SongRequestPayload {
  artistId: string; // required, non-empty
  albumId: string;  // required, non-empty — requests are album-scoped
  author: string;   // required, ≤ 18 chars (trimmed)
  lyrics: string;   // required, ≤ 280 chars
}

// Returned on a successful 201.
export interface SongRequestResult {
  request_id: string;
}

// Why an album isn't accepting requests. Shared by the album detail's
// `request_status.reason` and the submit endpoint's 409 body.
export type RequestClosedReason =
  | 'deadline_passed' // past request_deadline
  | 'album_full'      // track_count reached max_tracks
  | 'not_configured'; // max_tracks + request_deadline never authored

// Discriminated outcome of submit:
//   ok         → the new request id
//   validation → field→message map from a 400 (same shape as the application form)
//   closed     → the window closed server-side between load and submit (409); the
//                caller should surface the message and refresh the album
// A 404 (artist/album not found), 500, or network error rejects.
export type SongRequestOutcome =
  | { ok: true; data: SongRequestResult }
  | { ok: false; kind: 'validation'; errors: Record<string, string> }
  | { ok: false; kind: 'closed'; reason: RequestClosedReason; message: string };

// POST a song request. Bypasses `apiFetch` because the 400/409 responses carry
// bodies (field errors / closed reason) we need to read rather than discard.
export async function submitSongRequest(
  payload: SongRequestPayload,
): Promise<SongRequestOutcome> {
  const res = await fetch(`${API_URL}/slopbop/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (res.status === 201) {
    return { ok: true, data: { request_id: data.request_id } };
  }
  if (res.status === 400) {
    return {
      ok: false,
      kind: 'validation',
      errors: (data.errors ?? {}) as Record<string, string>,
    };
  }
  if (res.status === 409) {
    return {
      ok: false,
      kind: 'closed',
      reason: data.reason as RequestClosedReason,
      message: data.error || 'Song requests are closed for this album',
    };
  }
  throw new Error(data.error || 'Request failed');
}
