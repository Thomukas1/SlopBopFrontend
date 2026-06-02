import { useState } from 'react';
import {
  Field,
  TextField,
  TextAreaField,
  ButtonGroup,
  Dropdown,
  type ButtonGroupOption,
} from '../../primitives/form';
import { useFormConfig } from '../../hooks/useFormConfig';
import { useSubmitApplication } from '../../hooks/useSubmitApplication';
import { useToast } from '../../context/ToastContext';
import type { ApplicationPayload } from '../../services/slopbop';

// Field length caps, mirroring the backend's validation rules.
const NICKNAME_MAX = 32;
const BIO_MAX = 140;
// Allowed nickname characters, per the backend.
const NICKNAME_RE = /^[a-zA-Z0-9_-]+$/;

type Gender = 'male' | 'female';

const GENDER_OPTIONS: ButtonGroupOption<Gender>[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export default function ApplicationForm() {
  const { config, loading, error } = useFormConfig();
  const { submit, submitting, fieldErrors } = useSubmitApplication();
  const { showToast } = useToast();

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [zodiac, setZodiac] = useState<string | null>(null);

  // Per-field validity. Optional fields are valid from the start; required
  // fields gate the Apply button below.
  const nicknameValid = NICKNAME_RE.test(nickname) && nickname.length <= NICKNAME_MAX;
  const bioValid = bio.trim().length > 0 && bio.length <= BIO_MAX;
  const genderValid = gender !== null;
  const zodiacValid = zodiac !== null;
  const allValid = nicknameValid && bioValid && genderValid && zodiacValid;

  async function handleApply() {
    if (!allValid || !gender || !zodiac) return;

    // The form only collects a subset of the application so far; the remaining
    // required fields are sent empty and the backend's 400 will flag them.
    const payload: ApplicationPayload = {
      nickname,
      gender,
      bio,
      scale_answers: [],
      audition_answers: [],
      zodiac_sign: zodiac,
      favorite_genres: [],
      favorite_singer: '',
    };

    try {
      const outcome = await submit(payload);
      if (outcome.ok) {
        showToast(`Welcome, ${outcome.data.nickname} — ${outcome.data.archetype}!`, 'success');
      } else {
        showToast('Some fields need work — more steps coming soon.', 'warning');
      }
    } catch {
      showToast('Something went wrong. Please try again.');
    }
  }

  if (loading) {
    return <p className="text-center text-secondary py-4xl">Loading form…</p>;
  }
  if (error || !config) {
    return <p className="text-center text-error py-4xl">{error ?? 'Failed to load form'}</p>;
  }

  return (
    <div className="flex flex-col gap-xl py-lg px-md">
      <header className="flex flex-col gap-sm">
        <h1 className="font-display text-xl">Become an Artist</h1>
        <p className="text-sm text-secondary leading-relaxed">
          Apply to join the simulation. Fill in your details and we'll see what
          kind of artist you'd be.
        </p>
      </header>

      <div className="form">
        <TextField
          label="Nickname"
          required
          value={nickname}
          onChange={setNickname}
          maxLength={NICKNAME_MAX}
          placeholder="e.g. neon_kid"
          help="Letters, numbers, dashes and underscores."
          error={fieldErrors.nickname}
        />

        <TextAreaField
          label="Bio"
          required
          value={bio}
          onChange={setBio}
          maxLength={BIO_MAX}
          rows={3}
          placeholder="A line or two about you."
          error={fieldErrors.bio}
        />

        <Field label="Gender" required error={fieldErrors.gender}>
          <ButtonGroup
            options={GENDER_OPTIONS}
            value={gender}
            onChange={setGender}
            columns={2}
          />
        </Field>

        <Field label="Zodiac sign" required error={fieldErrors.zodiac_sign}>
          <Dropdown
            options={config.zodiac}
            value={zodiac}
            onChange={setZodiac}
            placeholder="Select"
            error={!!fieldErrors.zodiac_sign}
          />
        </Field>

        <button
          type="button"
          className="special full-width"
          disabled={!allValid || submitting}
          onClick={handleApply}
        >
          {submitting ? 'Applying…' : 'Apply'}
        </button>
      </div>
    </div>
  );
}
