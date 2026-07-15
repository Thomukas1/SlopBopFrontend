import React from 'react';

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}

export function FAQItem({ question, answer, open, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-white/15 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-md py-md text-left"
        aria-expanded={open}
      >
        <span className="font-display text-base">{question}</span>
        <span
          className={`text-base shrink-0 transition-transform duration-base ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>
      <div
        className={`overflow-hidden transition-[max-height] duration-base ${
          open ? 'max-h-[600px]' : 'max-h-0'
        }`}
      >
        <div className="text-sm leading-relaxed pb-md">
          {answer}
        </div>
      </div>
    </div>
  );
}
