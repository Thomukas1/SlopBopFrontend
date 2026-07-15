import { useState } from 'react';
import { FAQItem } from './FAQItem';
import { FAQ_ITEMS } from './faq-data';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="flex flex-col gap-md px-md">
      <div className="frosted-card !p-lg flex flex-col">
        {FAQ_ITEMS.map((item, i) => (
          <FAQItem
            key={i}
            question={item.question}
            answer={item.answer}
            open={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </section>
  );
}
