/**
 * Deterministic genre → colour, in the spirit of Pokémon type pills.
 *
 * Each genre name is hashed into a single HUE. The fill holds saturation and
 * lightness CONSTANT — that fixed pair is what keeps the pills feeling like one
 * family and anchored to the theme, instead of a random rainbow that drifts out
 * of context. (Consistency needs one of hue / saturation / lightness to stay
 * put; here we vary only hue.) The fill constants echo the theme's lime accent
 * (`--p-lime`, ~hsl(80 92% 59%)): vivid, medium-light chips.
 *
 * The LABEL is the complementary hue, kept VIVID — a deep jewel tone on bright
 * fills, a bright vivid tone on dark fills, chosen by luminance so it never
 * disappears. We deliberately avoid near-white / near-black labels (they read
 * as washed and boring); legibility on the awkward mid-luminance fills instead
 * comes from a thin contrasting {@link GenreColor.outline} — the Pokémon-pill
 * halo — which lets the label stay colourful without sacrificing readability.
 */

// Fill: vivid + medium-light, matched to the accent's energy.
const FILL_SATURATION = 68;
const FILL_LIGHTNESS = 62;

// Label: complementary hue, fully saturated. Two vivid candidates — a deep tone
// and a bright tone — and we keep whichever contrasts more with the fill.
const LABEL_SATURATION = 100;
const LABEL_DEEP_LIGHTNESS = 22;
const LABEL_BRIGHT_LIGHTNESS = 72;

/** Stable, order-independent string hash (djb2-ish). */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // keep it a 32-bit int
  }
  return Math.abs(hash);
}

/** HSL (h∈[0,360), s/l∈[0,100]) → sRGB channels in [0,255]. */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}

/** WCAG relative luminance of an sRGB colour. */
function relativeLuminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio between two luminances. */
function contrast(a: number, b: number): number {
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

export interface GenreColor {
  /** Pill fill colour. */
  bg: string;
  /** Label colour — the complement, at whichever vivid tone reads best on the fill. */
  fg: string;
  /** Thin halo behind the label, opposite the label's luminance, for legibility. */
  outline: string;
}

export function genreColor(genre: string): GenreColor {
  const hue = hashString(genre.trim().toLowerCase()) % 360;
  const fillLum = relativeLuminance(hslToRgb(hue, FILL_SATURATION, FILL_LIGHTNESS));

  const labelHue = (hue + 180) % 360;
  const deepLum = relativeLuminance(hslToRgb(labelHue, LABEL_SATURATION, LABEL_DEEP_LIGHTNESS));
  const brightLum = relativeLuminance(hslToRgb(labelHue, LABEL_SATURATION, LABEL_BRIGHT_LIGHTNESS));

  const useDeep = contrast(fillLum, deepLum) >= contrast(fillLum, brightLum);
  const labelLightness = useDeep ? LABEL_DEEP_LIGHTNESS : LABEL_BRIGHT_LIGHTNESS;

  return {
    bg: `hsl(${hue} ${FILL_SATURATION}% ${FILL_LIGHTNESS}%)`,
    fg: `hsl(${labelHue} ${LABEL_SATURATION}% ${labelLightness}%)`,
    // Deep labels get a light halo; bright labels get a dark one.
    outline: useDeep ? 'rgba(255, 255, 255, 0.55)' : 'rgba(5, 22, 72, 0.6)',
  };
}
