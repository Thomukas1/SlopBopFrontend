import { useState } from 'react';
import { FormSection, StepNav, TextAreaField } from '../../primitives/form';

interface AuditionSectionProps {
  questions: string[];
  answers: string[];
  // Per-question completion, mirrored by the step buttons turning green.
  complete: boolean[];
  onAnswerChange: (index: number, value: string) => void;
  maxLength: number;
  // Group-level error from the backend (audition_answers).
  error?: string;
}

// The audition tier as a stepped questionnaire: numbered buttons switch between
// questions, one is shown at a time, and each turns green once answered. The
// section is valid only when every step is complete (gated by the parent).
export function AuditionSection({
  questions,
  answers,
  complete,
  onAnswerChange,
  maxLength,
  error,
}: AuditionSectionProps) {
  const [active, setActive] = useState(0);

  return (
    <FormSection
      title="Open Questions"
      description="Answer each question in your own words. This will strongly affect artist's personality"
      error={error}
    >
      <TextAreaField
        label={questions[active]}
        largeLabel
        required
        value={answers[active]}
        onChange={value => onAnswerChange(active, value)}
        maxLength={maxLength}
        rows={4}
      />
      <div className="flex justify-center">
        <StepNav
          count={questions.length}
          active={active}
          complete={complete}
          onSelect={setActive}
          ariaLabel="Audition questions"
        />
      </div>
    </FormSection>
  );
}
