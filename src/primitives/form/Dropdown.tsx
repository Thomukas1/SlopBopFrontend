import { useEffect, useRef, useState } from 'react';

interface DropdownProps {
  options: string[];
  // `null` when nothing is selected — the placeholder shows instead.
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  id?: string;
}

// Custom single-select dropdown with a height-capped, scrollable options panel
// — a native <select> popup can't be sized/scrolled this way. Closes on
// outside click, Escape, or selection.
export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select',
  error,
  id,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const select = (option: string) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`dropdown${open ? ' open' : ''}`}>
      <button
        type="button"
        id={id}
        className={`dropdown-trigger${value ? '' : ' placeholder'}${error ? ' error' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span>{value ?? placeholder}</span>
        <span className="dropdown-caret" aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="dropdown-panel" role="listbox">
          {options.map(option => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              className={`dropdown-option${value === option ? ' selected' : ''}`}
              onClick={() => select(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
