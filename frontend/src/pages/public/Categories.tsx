import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shapes } from 'lucide-react'
import { usePageTitle } from '@/utilities/usePageTitle'
import { getCategories } from '@/services'
import type { CategoryWithCount } from '@/types'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { LoadingSkeleton } from '@/components/shared/LoadingIndicator'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { EmptyState } from '@/components/shared/EmptyState'
import { CategoryCard } from '@/components/search/CategoryCard'

/**
 * The all categories page (Project Plan section 2.1).
 * A grid of categories with disease counts, calculated from the data.
 */
export function Categories() {
  usePageTitle('Categories')

  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')
      const result = await getCategories()

      if (!active) return

      if (!result.success) {
        setError(result.message)
        setLoading(false)
        return
      }

      setCategories(result.data)
      setLoading(false)
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  const totalDiseases = categories.reduce((sum, category) => sum + category.diseaseCount, 0)

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Categories' }]} />

      <header>
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">All categories</h1>
        <p className="mt-2 text-muted">
          Browse the information by type of condition. Every count comes from the records
          themselves.
        </p>
      </header>

      {loading ? <LoadingSkeleton rows={3} /> : null}
      {error && !loading ? <ErrorMessage message={error} onRetry={() => window.location.reload()} /> : null}

      {!loading && !error && categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Categories will appear here once they are added."
          icon={<Shapes aria-hidden="true" className="size-6" />}
          action={
            <Link to="/" className="text-sm text-primary hover:underline">
              Go home
            </Link>
          }
        />
      ) : null}

      {!loading && !error && categories.length > 0 ? (
        <>
          <p className="text-sm text-muted">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'} covering{' '}
            {totalDiseases} {totalDiseases === 1 ? 'disease' : 'diseases'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} headingLevel={2} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
