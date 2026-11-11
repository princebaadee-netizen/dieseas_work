import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FolderSearch } from 'lucide-react'
import { usePageTitle } from '@/utilities/usePageTitle'
import { getCategory } from '@/services'
import type { Category, Disease } from '@/types'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { LoadingSkeleton } from '@/components/shared/LoadingIndicator'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { EmptyState } from '@/components/shared/EmptyState'
import { SearchResultCard } from '@/components/search/SearchResultCard'

/**
 * A single category page (Project Plan section 2.1).
 * Diseases in one category, alphabetical sort, friendly not-found page.
 */
export function Category() {
  const { name } = useParams<{ name: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')

  usePageTitle(category?.name ?? 'Category')

  useEffect(() => {
    let active = true

    async function load() {
      if (!name) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setLoading(true)
      setNotFound(false)
      setError('')
      const result = await getCategory(name)

      if (!active) return

      if (!result.success) {
        if (result.message.toLowerCase().includes('find')) {
          setNotFound(true)
        } else {
          setError(result.message)
        }
        setLoading(false)
        return
      }

      setCategory(result.data.category)
      setDiseases(result.data.diseases)
      setLoading(false)
    }

    void load()
    return () => {
      active = false
    }
  }, [name])

  if (loading) {
    return <LoadingSkeleton rows={4} />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />
  }

  if (notFound || !category) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Category not found' }]} />
        <EmptyState
          title="We could not find that category"
          description="The category may have been renamed or removed. Browse all categories to find what you need."
          headingLevel={1}
          icon={<FolderSearch aria-hidden="true" className="size-6" />}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/categories" className="text-sm text-primary hover:underline">
                All categories
              </Link>
              <Link to="/" className="text-sm text-primary hover:underline">
                Go home
              </Link>
            </div>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Categories', to: '/categories' },
          { label: category.name },
        ]}
      />

      <header>
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{category.name}</h1>
        <p className="mt-2 max-w-3xl leading-relaxed text-muted">{category.description}</p>
        <p className="mt-3 text-sm text-muted">
          {diseases.length} {diseases.length === 1 ? 'disease' : 'diseases'}, listed alphabetically
        </p>
      </header>

      {diseases.length === 0 ? (
        <EmptyState
          title="No diseases in this category yet"
          description="Information for this category is still being prepared. Try another category in the meantime."
          action={
            <Link to="/categories" className="text-sm text-primary hover:underline">
              All categories
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {diseases.map((disease) => (
            <SearchResultCard key={disease.id} disease={disease} headingLevel={2} />
          ))}
        </div>
      )}
    </div>
  )
}
