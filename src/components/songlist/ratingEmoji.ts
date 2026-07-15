// Maps a bop-approval percentage (0–100) to a verdict emoji. Shared by every
// surface that summarises a song's rating so the tiers can't drift apart.
export function ratingEmoji(pct: number): string {
  if (pct >= 90) return '🥶';
  if (pct >= 70) return '🔥';
  if (pct >= 40) return '😪';
  return '💩';
}
