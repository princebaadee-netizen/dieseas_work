import { ArrowRight, Shapes } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CategoryWithCount } from '@/types'

interface CategoryCardProps {
  category: CategoryWithCount
  headingLevel?: 2 | 3
}

/**
 * A card for browsing by category (Project Plan section 2.2).
 * Shows the name, description and disease count.
 */
export function CategoryCard({ category, headingLevel = 3 }: CategoryCardProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3'

  return (
    <article className="group flex h-full flex-col rounded-card border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-lifted">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary-light p-2 text-primary-dark">
          <Shapes aria-hidden="true" className="size-5" />
        </div>
        <div>
          <Heading className="font-display font-semibold text-ink">
            <Link
              to={`/category/${category.slug}`}
              className="rounded transition-colors hover:text-primary"
            >
              {category.name}
            </Link>
          </Heading>
          <p className="text-sm text-muted">
            {category.diseaseCount} {category.diseaseCount === 1 ? 'disease' : 'diseases'}
          </p>
        </div>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{category.description}</p>
      <Link
        to={`/category/${category.slug}`}
        aria-label={`View diseases in ${category.name}`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-dark"
      >
        View diseases
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </article>
  )
}
