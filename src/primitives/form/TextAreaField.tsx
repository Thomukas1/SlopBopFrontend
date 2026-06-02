import { useId } from 'react';
import { Field } from './Field';

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  // Hard caps how many characters can be typed (matches the backend rule).
  maxLength?: number;
  rows?: number;
  required?: boolean;
  error?: string;
  help?: string;
  placeholder?: string;
}

// Labeled multi-line text input. `maxLength` is enforced by the browser.
export function TextAreaField({
  label,
  value,
  onChange,
  maxLength,
  rows = 3,
  required,
  error,
  help,
  placeholder,
}: TextAreaFieldProps) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} required={required} error={error} help={help}>
      <textarea
        id={id}
        value={value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={error ? 'error' : undefined}
      />
    </Field>
  );
}
