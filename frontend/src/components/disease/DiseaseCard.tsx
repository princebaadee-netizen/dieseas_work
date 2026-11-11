import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Disease } from '@/types'

interface DiseaseCardProps {
  disease: Disease
}

/**
 * A compact card for featured/popular diseases on the home page
 * (Project Plan section 2.2).
 */
export function DiseaseCard({ disease }: DiseaseCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-card border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-lifted">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">
            <Link
              to={`/disease/${disease.slug}`}
              className="rounded transition-colors hover:text-primary"
            >
              {disease.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted">{disease.category.name}</p>
        </div>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{disease.shortSummary}</p>
      <Link
        to={`/disease/${disease.slug}`}
        aria-label={`Read more about ${disease.name}`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-dark"
      >
        Read more
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </article>
  )
}
