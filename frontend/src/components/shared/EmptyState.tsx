import type { ReactNode } from 'react'
import { SearchX } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
  headingLevel?: 1 | 2 | 3
}

const headingClasses: Record<1 | 2 | 3, string> = {
  1: 'font-display text-2xl font-semibold text-ink',
  2: 'font-display text-xl font-semibold text-ink',
  3: 'font-display text-lg font-semibold text-ink',
}

/**
 * The shared empty state, used for no results, empty lists and missing data.
 *
 * The heading level is configurable so the page heading order stays correct
 * (a page title is h1, so content below it starts at h2).
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className = '',
  headingLevel = 2,
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3'

  return (
    <div
      className={[
        'flex flex-col items-center rounded-card border border-dashed border-slate-300 bg-white px-6 py-12 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-3 rounded-full bg-slate-100 p-3 text-muted">
        {icon ?? <SearchX aria-hidden="true" className="size-6" />}
      </div>
      <Heading className={headingClasses[headingLevel]}>{title}</Heading>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
