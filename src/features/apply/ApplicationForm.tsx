import { useMemo, useState } from 'react';
import {
  Field,
  TextField,
  TextAreaField,
  ButtonGroup,
  Dropdown,
  MultiSelect,
  type ButtonGroupOption,
} from '../../primitives/form';
import { AuditionSection } from './AuditionSection';
import { toZodiacOptions } from './zodiac';
import { useFormConfig } from '../../hooks/useFormConfig';
import { useSubmitApplication } from '../../hooks/useSubmitApplication';
import { useToast } from '../../context/ToastContext';
import { pickAuditionQuestions, type ApplicationPayload } from '../../services/slopbop';

// Field length caps, mirroring the backend's validation rules.
const NICKNAME_MAX = 32;
const BIO_MAX = 140;
const SINGER_MAX = 32;
const AUDITION_MAX = 300;
const X_HANDLE_MAX = 32;
const EMAIL_MAX = 100;

// Allowed-character / format rules, mirroring the backend.
const NICKNAME_RE = /^[a-zA-Z0-9_-]+$/;
const X_HANDLE_RE = /^[a-zA-Z0-9_]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [favoriteSinger, setFavoriteSinger] = useState('');
  const [auditionAnswers, setAuditionAnswers] = useState(['', '', '', '']);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [xHandle, setXHandle] = useState('');
  const [email, setEmail] = useState('');

  // One random question per bucket, picked once config is in hand and held for
  // the form's lifetime (re-rolls only on remount, which is expected).
  const auditionQuestions = useMemo(
    () => (config ? pickAuditionQuestions(config.questions) : null),
    [config],
  );

  const setAnswer = (index: number, value: string) =>
    setAuditionAnswers(prev => prev.map((a, i) => (i === index ? value : a)));

  // Per-field validity. Optional fields are valid when blank; a non-blank but
  // malformed optional field is invalid and blocks submission.
  const nicknameValid = NICKNAME_RE.test(nickname) && nickname.length <= NICKNAME_MAX;
  const bioValid = bio.trim().length > 0 && bio.length <= BIO_MAX;
  const genderValid = gender !== null;
  const zodiacValid = zodiac !== null;
  const singerValid = favoriteSinger.trim().length > 0 && favoriteSinger.length <= SINGER_MAX;
  // Required → at least one; the upper bound is enforced by the MultiSelect.
  const genresValid = favoriteGenres.length > 0;
  // Per-question completion drives the step buttons; the tier is valid only
  // once every question is complete.
  const auditionComplete = auditionAnswers.map(a => a.trim().length > 0 && a.length <= AUDITION_MAX);
  const auditionValid = !!auditionQuestions && auditionComplete.every(Boolean);
  const xHandleValid = xHandle === '' || (xHandle.length <= X_HANDLE_MAX && X_HANDLE_RE.test(xHandle));
  const emailValid = email === '' || (email.length <= EMAIL_MAX && EMAIL_RE.test(email));

  const allValid =
    nicknameValid && bioValid && genderValid && zodiacValid &&
    singerValid && genresValid && auditionValid && xHandleValid && emailValid;

  async function handleApply() {
    if (!allValid || !gender || !zodiac || !auditionQuestions) return;

    // The form still omits some required tiers (scale, genres); they're sent
    // empty and the backend's 400 will flag them.
    const payload: ApplicationPayload = {
      nickname,
      gender,
      bio,
      scale_answers: [],
      audition_answers: auditionQuestions.map((question, i) => ({
        question,
        answer: auditionAnswers[i],
      })),
      zodiac_sign: zodiac,
      favorite_genres: favoriteGenres,
      favorite_singer: favoriteSinger,
      x_handle: xHandle || null,
      email: email || null,
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
            options={toZodiacOptions(config.zodiac)}
            value={zodiac}
            onChange={setZodiac}
            placeholder="Select"
            error={!!fieldErrors.zodiac_sign}
          />
        </Field>

        <TextField
          label="Favorite artist"
          required
          value={favoriteSinger}
          onChange={setFavoriteSinger}
          maxLength={SINGER_MAX}
          placeholder="e.g. Björk"
          error={fieldErrors.favorite_singer}
        />

        <Field
          label="Favorite genres"
          required
          help={`${favoriteGenres.length}/${config.genres.max_select} selected`}
          error={fieldErrors.favorite_genres}
        >
          <MultiSelect
            options={config.genres.options}
            value={favoriteGenres}
            onChange={setFavoriteGenres}
            max={config.genres.max_select}
            addPlaceholder="Add a genre…"
          />
        </Field>

        {auditionQuestions && (
          <AuditionSection
            questions={auditionQuestions}
            answers={auditionAnswers}
            complete={auditionComplete}
            onAnswerChange={setAnswer}
            maxLength={AUDITION_MAX}
            error={fieldErrors.audition_answers}
          />
        )}

        <TextField
          label="X handle"
          value={xHandle}
          onChange={value => setXHandle(value.replace(/^@+/, ''))}
          maxLength={X_HANDLE_MAX}
          prefix="@"
          placeholder="handle"
          help="optional"
          error={fieldErrors.x_handle}
        />

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          maxLength={EMAIL_MAX}
          placeholder="you@example.com"
          help="optional"
          error={fieldErrors.email}
        />

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
