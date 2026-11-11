import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Disease } from '@/types'
import { Tag } from '@/components/shared/Tag'

interface SearchResultCardProps {
  disease: Disease
  headingLevel?: 2 | 3
}

/**
 * A card for search results (Project Plan sections 2.3 and 2.2).
 * Shows name, summary, category tag and a "Read more" link.
 */
export function SearchResultCard({ disease, headingLevel = 3 }: SearchResultCardProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3'

  return (
    <article className="group rounded-card border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-lifted sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading className="font-display text-lg font-semibold text-ink sm:text-xl">
            <Link
              to={`/disease/${disease.slug}`}
              className="rounded transition-colors hover:text-primary"
            >
              {disease.name}
            </Link>
          </Heading>
          <div className="mt-1.5">
            <Tag tone="brand">{disease.category.name}</Tag>
          </div>
        </div>
        <Link
          to={`/disease/${disease.slug}`}
          aria-label={`Read more about ${disease.name}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-dark"
        >
          Read more
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{disease.shortSummary}</p>
    </article>
  )
}
