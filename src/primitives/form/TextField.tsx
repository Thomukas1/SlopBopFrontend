import { useId } from 'react';
import { Field } from './Field';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  // Hard caps how many characters can be typed (matches the backend rule).
  maxLength?: number;
  required?: boolean;
  error?: string;
  help?: string;
  placeholder?: string;
  type?: 'text' | 'email';
}

// Labeled single-line text input. `maxLength` is enforced by the browser, so
// the value can never exceed it.
export function TextField({
  label,
  value,
  onChange,
  maxLength,
  required,
  error,
  help,
  placeholder,
  type = 'text',
}: TextFieldProps) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} required={required} error={error} help={help}>
      <input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={error ? 'error' : undefined}
      />
    </Field>
  );
}
