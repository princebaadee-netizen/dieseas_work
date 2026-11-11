import { X } from 'lucide-react'
import type { CategoryWithCount } from '@/types'

interface CategoryFilterProps {
  categories: CategoryWithCount[]
  activeSlug?: string
  onChange: (slug?: string) => void
}

/**
 * The category filter shown on the search results page
 * (Project Plan section 2.2). Collapsible on phones, side panel on desktop.
 */
export function CategoryFilter({ categories, activeSlug, onChange }: CategoryFilterProps) {
  return (
    <aside className="rounded-card border border-slate-200 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="font-display text-sm font-semibold text-ink">Filter by category</h2>
        {activeSlug ? (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-slate-100 hover:text-ink"
          >
            <X aria-hidden="true" className="size-3.5" />
            Clear
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2 p-3 lg:flex-col">
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={[
            'rounded-lg px-3 py-2 text-left text-sm transition-colors',
            !activeSlug
              ? 'bg-primary-light text-primary-dark font-medium'
              : 'text-ink hover:bg-slate-100',
          ].join(' ')}
        >
          All categories
        </button>
        {categories.map((category) => {
          const isActive = category.slug === activeSlug
          return (
            <button
              type="button"
              key={category.slug}
              onClick={() => onChange(category.slug)}
              className={[
                'flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
                isActive
                  ? 'bg-primary-light text-primary-dark font-medium'
                  : 'text-ink hover:bg-slate-100',
              ].join(' ')}
            >
              <span>{category.name}</span>
              <span className="ml-2 text-xs text-muted">{category.diseaseCount}</span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
