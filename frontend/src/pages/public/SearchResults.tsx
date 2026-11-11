import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePageTitle } from '@/utilities/usePageTitle'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchResultCard } from '@/components/search/SearchResultCard'
import { CategoryFilter } from '@/components/search/CategoryFilter'
import { LoadingSkeleton } from '@/components/shared/LoadingIndicator'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { EmptyState } from '@/components/shared/EmptyState'
import { getCategories, searchDiseases } from '@/services'
import type { CategoryWithCount, Disease } from '@/types'

/**
 * The search results page (Project Plan section 2.2).
 * Query and filter are kept in the URL so results can be refreshed and shared.
 */
export function SearchResults() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const category = params.get('category') ?? undefined

  usePageTitle(query ? `Search: ${query}` : 'Search')

  const [results, setResults] = useState<Disease[]>([])
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')

      const [searchResult, categoriesResult] = await Promise.all([
        searchDiseases({ text: query, category }),
        getCategories(),
      ])

      if (!active) return

      if (!searchResult.success) {
        setError(searchResult.message)
        setLoading(false)
        return
      }
      if (!categoriesResult.success) {
        setError(categoriesResult.message)
        setLoading(false)
        return
      }

      setResults(searchResult.data.matches)
      setTotal(searchResult.data.total)
      setCategories(categoriesResult.data)
      setLoading(false)
    }

    void load()
    return () => {
      active = false
    }
  }, [query, category])

  function handleFilterChange(slug?: string) {
    const next = new URLSearchParams(params)
    if (slug) {
      next.set('category', slug)
    } else {
      next.delete('category')
    }
    setParams(next, { replace: true })
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Search results</h1>
        <div className="mt-4 max-w-2xl">
          <SearchBar defaultValue={query} showSuggestions={true} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="order-2 lg:order-1">
          {categories.length > 0 ? (
            <CategoryFilter
              categories={categories}
              activeSlug={category}
              onChange={handleFilterChange}
            />
          ) : null}
        </div>

        <div className="order-1 lg:order-2">
          {!loading && !error ? (
            <p className="mb-4 text-sm text-muted">
              {total === 0
                ? 'No results'
                : `${total} ${total === 1 ? 'result' : 'results'}`}
              {query ? ` for “${query}”` : ''}
              {category
                ? ` in ${categories.find((c) => c.slug === category)?.name ?? 'category'}`
                : ''}
            </p>
          ) : null}

          {loading ? <LoadingSkeleton rows={4} /> : null}
          {error && !loading ? <ErrorMessage message={error} onRetry={() => window.location.reload()} /> : null}

          {!loading && !error && results.length === 0 ? (
            <EmptyState
              title="No diseases matched that search"
              description="Try a different spelling, search by a symptom like 'fever', or browse by category."
              icon={<Search aria-hidden="true" className="size-6" />}
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/categories" className="text-sm text-primary hover:underline">
                    Browse categories
                  </Link>
                  <Link to="/" className="text-sm text-primary hover:underline">
                    Go home
                  </Link>
                </div>
              }
            />
          ) : null}

          {!loading && !error && results.length > 0 ? (
            <div className="space-y-4">
              {results.map((disease) => (
                <SearchResultCard key={disease.id} disease={disease} headingLevel={2} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
