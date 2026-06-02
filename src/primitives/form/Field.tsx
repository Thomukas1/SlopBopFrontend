import { ReactNode } from 'react';

interface FieldProps {
  label: string;
  // Associates the <label> with the control. Omit for controls without a
  // single focusable element (e.g. a button group).
  htmlFor?: string;
  required?: boolean;
  // Inline validation message; takes precedence over `help`.
  error?: string;
  help?: string;
  children: ReactNode;
}

// Labeling shell shared by every form field: renders the label (with the
// required marker), the control, and an error or help line beneath it.
export function Field({ label, htmlFor, required, error, help, children }: FieldProps) {
  return (
    <div className="field-wrapper">
      <label htmlFor={htmlFor} className={required ? 'required' : undefined}>
        {label}
      </label>
      {children}
      {error
        ? <p className="field-error">{error}</p>
        : help && <p className="field-help">{help}</p>}
    </div>
  );
}
