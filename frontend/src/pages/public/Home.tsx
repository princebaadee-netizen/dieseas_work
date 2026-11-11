import { Link } from 'react-router-dom'
import { ArrowRight, SearchCheck, Stethoscope, BookOpen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePageTitle } from '@/utilities/usePageTitle'
import { SearchBar } from '@/components/search/SearchBar'
import { DiseaseCard } from '@/components/disease/DiseaseCard'
import { CategoryCard } from '@/components/search/CategoryCard'
import { LoadingSkeleton } from '@/components/shared/LoadingIndicator'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { getCategories, getFeaturedDiseases } from '@/services'
import type { CategoryWithCount, Disease } from '@/types'

/**
 * The home page (Project Plan section 2.2).
 * Hero with search, popular diseases, browse by category, how it works.
 */
export function Home() {
  usePageTitle()

  const [featured, setFeatured] = useState<Disease[]>([])
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')
      const [featuredResult, categoriesResult] = await Promise.all([
        getFeaturedDiseases(),
        getCategories(),
      ])

      if (!active) return

      if (!featuredResult.success) {
        setError(featuredResult.message)
        setLoading(false)
        return
      }
      if (!categoriesResult.success) {
        setError(categoriesResult.message)
        setLoading(false)
        return
      }

      setFeatured(featuredResult.data)
      setCategories(categoriesResult.data)
      setLoading(false)
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-12">
      <section className="prose-read mx-auto text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
          Clear health information in one place
        </h1>
        <p className="mt-4 text-lg text-muted">
          Search for a disease to read about its symptoms, causes, risk factors, prevention and
          treatment options. Educational only, never a substitute for a doctor.
        </p>
        <div className="mt-8 mx-auto max-w-2xl">
          <SearchBar />
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">Popular diseases</h2>
            <p className="mt-1 text-muted">A short list of conditions our team has highlighted.</p>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark"
          >
            Browse all categories
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        {loading ? <div className="mt-5"><LoadingSkeleton rows={4} /></div> : null}
        {error && !loading ? <div className="mt-5"><ErrorMessage message={error} onRetry={() => window.location.reload()} /></div> : null}
        {!loading && !error ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((disease) => (
              <DiseaseCard key={disease.id} disease={disease} />
            ))}
          </div>
        ) : null}
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">Browse by category</h2>
            <p className="mt-1 text-muted">Find information by type of condition.</p>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark"
          >
            See all categories
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        {loading ? <div className="mt-5"><LoadingSkeleton rows={3} /></div> : null}
        {!loading && !error ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-card border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">How it works</h2>
          <p className="mt-1 text-muted">Find the information you need in three steps.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <article className="flex gap-4">
            <div className="rounded-lg bg-primary-light p-2.5 text-primary-dark">
              <SearchCheck aria-hidden="true" className="size-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-ink">1. Search</h3>
              <p className="mt-1 text-sm text-muted">Look up a disease by name or symptom.</p>
            </div>
          </article>
          <article className="flex gap-4">
            <div className="rounded-lg bg-primary-light p-2.5 text-primary-dark">
              <BookOpen aria-hidden="true" className="size-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-ink">2. Read</h3>
              <p className="mt-1 text-sm text-muted">Learn about symptoms, causes, risk factors and prevention.</p>
            </div>
          </article>
          <article className="flex gap-4">
            <div className="rounded-lg bg-primary-light p-2.5 text-primary-dark">
              <Stethoscope aria-hidden="true" className="size-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-ink">3. Know when to seek care</h3>
              <p className="mt-1 text-sm text-muted">Spot urgent signs and know when to speak to a health professional.</p>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
