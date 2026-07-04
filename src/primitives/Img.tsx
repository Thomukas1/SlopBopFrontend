import { useEffect, useRef, useState } from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  /** Box classes (size, aspect ratio, rounding) applied to the frame wrapper. */
  className?: string;
  /** object-fit / object-position classes applied to the <img> itself. Defaults to `object-cover`. */
  imgClassName?: string;
  /**
   * Optional tiny/low-res image URL shown blurred while the full image loads (true "blur-up").
   * When omitted, an animated shimmer skeleton is shown instead.
   */
  placeholderSrc?: string;
};

/**
 * Remote image with a placeholder + fade-in.
 *
 * Fixes the "reveals slowly from the top" effect on slow connections by decoding
 * off-thread (`decoding="async"`) and fading the whole image in at once, over a
 * shimmer (or a blurred low-res `placeholderSrc`). `loading="lazy"` means offscreen
 * images (grids, lists) aren't fetched until they scroll into view.
 *
 * Note: this improves *perceived* speed only — it can't shrink the download.
 * Serving smaller variants + `Cache-Control` headers from the server is the real fix.
 */
export default function Img({
  className = '',
  imgClassName = 'object-cover',
  placeholderSrc,
  loading = 'lazy',
  onLoad,
  onError,
  alt = '',
  src,
  ...rest
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Cached images may finish before React attaches onLoad — reveal them immediately.
  useEffect(() => {
    setLoaded(false);
    const img = ref.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, [src]);

  return (
    <span className={`img-frame ${className}`}>
      {placeholderSrc ? (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className={`img-blur ${imgClassName}`}
          data-hidden={loaded || undefined}
        />
      ) : (
        <span className="img-shimmer" data-hidden={loaded || undefined} aria-hidden="true" />
      )}
      <img
        {...rest}
        ref={ref}
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        className={`img-el ${imgClassName}`}
        data-loaded={loaded || undefined}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setLoaded(true); // reveal broken-image state rather than a permanent shimmer
          onError?.(e);
        }}
      />
    </span>
  );
}
