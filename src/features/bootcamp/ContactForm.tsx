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
      `?subject=${encodeURIComponent('SlopBop — Creative Bootcamp inquiry')}` +
      `&body=${encodeURIComponent(`${message}\n\nReply to: ${email}`)}`;
    window.location.href = mailto;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-lg px-md">
      <h2 className="font-display text-2xl">Write Us</h2>

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
