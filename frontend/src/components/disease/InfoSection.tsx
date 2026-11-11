interface InfoSectionProps {
  id: string
  title: string
  items: string[]
  emptyMessage?: string
}

/**
 * A reusable section for symptoms, causes, risk factors and prevention
 * (Project Plan section 2.4).
 */
export function InfoSection({ id, title, items, emptyMessage = 'No information listed.' }: InfoSectionProps) {
  const hasItems = items.length > 0

  return (
    <section id={id} className="scroll-mt-28 rounded-card border border-slate-200 bg-white p-6 shadow-card sm:p-8">
      <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">{title}</h2>
      {hasItems ? (
        <ul className="mt-4 space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-muted">
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">{emptyMessage}</p>
      )}
    </section>
  )
}
