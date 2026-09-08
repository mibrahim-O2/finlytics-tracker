import Reveal from './Reveal';

/** Consistent eyebrow + title + subtitle block for landing sections. */
export default function SectionHeading({ eyebrow, title, sub, align = 'left' }) {
  return (
    <Reveal className={`mb-10 max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-teal">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {sub && <p className="mt-3 text-sm leading-relaxed text-text-primary/60">{sub}</p>}
    </Reveal>
  );
}
