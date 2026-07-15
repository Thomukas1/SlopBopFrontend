import { useState } from 'react';
import { TextField, TextAreaField } from '../../primitives/form';

// Interim transport: no backend inbox endpoint yet, so submitting opens the
// visitor's mail client pre-addressed to us. Swap for a POST when the ordering
// flow is built out.
const CONTACT_EMAIL = 'slopboptv@gmail.com';

export function ContactForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const canSend = email.trim() !== '' && message.trim() !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    const mailto =
      `mailto:${CONTACT_EMAIL}` +
      `?subject=${encodeURIComponent('SlopBop — Commission inquiry')}` +
      `&body=${encodeURIComponent(`${message}\n\nReply to: ${email}`)}`;
    window.location.href = mailto;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-lg px-md">
      <div className="flex flex-col gap-sm">
        <h2 className="font-display text-2xl">Commission an artist</h2>
        <p className="text-sm leading-relaxed text-muted">
          Every commission is bespoke — no price list. Tell us about your group and the occasion,
          and we'll take it from there.
        </p>
      </div>

      <TextField
        label="Your email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        help="We'll reply to you here."
        required
      />

      <TextAreaField
        label="Your message"
        value={message}
        onChange={setMessage}
        rows={6}
        placeholder="Tell us about your group and the album you have in mind."
        required
      />

      <button type="submit" className="special full-width" disabled={!canSend}>
        Send
      </button>
    </form>
  );
}
