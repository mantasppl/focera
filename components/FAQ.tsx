import type { ToolFaq } from "@/data/tools";
import { cn } from "@/lib/utils";

type FAQProps = {
  items: ToolFaq[];
  title?: string;
  className?: string;
};

export default function FAQ({
  items,
  title = "FAQ",
  className,
}: FAQProps) {
  if (!items.length) return null;

  return (
    <section className={cn("faq", className)} aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="faq__title">
        {title}
      </h2>
      <div className="faq__list">
        {items.map((item) => (
          <details key={item.question} className="faq__item">
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
