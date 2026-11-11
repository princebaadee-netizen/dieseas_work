import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import { usePageTitle } from '@/utilities/usePageTitle'
import { getDisease } from '@/services'
import type { Disease } from '@/types'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { LoadingSkeleton } from '@/components/shared/LoadingIndicator'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { EmptyState } from '@/components/shared/EmptyState'
import { DISCLAIMER_TEXT } from '@/components/shared/disclaimerText'
import { WarningBox, UrgentCareBox } from '@/components/disease/WarningBoxes'
import { SourceNote } from '@/components/disease/SourceNote'

/**
 * The remedy page (Project Plan section 2.2).
 * Overview, care options, amber precautions, red urgent care box, source/date.
 */
export function Remedy() {
  const { name } = useParams<{ name: string }>()
  const [disease, setDisease] = useState<Disease | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')

  usePageTitle(disease ? `${disease.name} - Treatment and care` : 'Remedy information')

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
      const result = await getDisease(name)

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

      setDisease(result.data)
      setLoading(false)
    }

    void load()
    return () => {
      active = false
    }
  }, [name])

  if (loading) {
    return <LoadingSkeleton rows={6} />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />
  }

  if (notFound || !disease) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Remedy not found' }]} />
        <EmptyState
          title="We could not find that remedy page"
          description="Try searching for a disease or go back to the home page."
          headingLevel={1}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/" className="text-sm text-primary hover:underline">
                Go home
              </Link>
              <Link to="/categories" className="text-sm text-primary hover:underline">
                Browse categories
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
          { label: disease.category.name, to: `/category/${disease.category.slug}` },
          { label: disease.name, to: `/disease/${disease.slug}` },
          { label: 'Treatment and care' },
        ]}
      />

      <header className="space-y-2">
        <p className="text-sm text-muted">Treatment and care</p>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{disease.name}</h1>
        <p className="max-w-3xl text-muted">
          Reviewed treatment information, care options, precautions and advice on when to seek
          professional care.
        </p>
        <Link
          to={`/disease/${disease.slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to disease information
        </Link>
      </header>

      {disease.remedy ? (
        <div className="space-y-6">
          <section className="rounded-card border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary-light p-2 text-primary-dark">
                <ClipboardList aria-hidden="true" className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">Overview</h2>
                <p className="mt-3 leading-relaxed text-muted">{disease.remedy.overview}</p>
              </div>
            </div>
          </section>

          <section className="rounded-card border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">Care options</h2>
            <ul className="mt-4 space-y-2">
              {disease.remedy.careOptions.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-muted">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <WarningBox title="Precautions" items={disease.remedy.precautions} />
          <UrgentCareBox title="When to seek professional care" items={disease.remedy.urgentSigns} />
          <SourceNote source={disease.remedy.source} lastReviewed={disease.remedy.lastReviewed} />
        </div>
      ) : (
        <EmptyState
          title="Remedy information is being prepared"
          description="This disease does not have a remedy entry yet. The content will be added and reviewed before publication."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link to={`/disease/${disease.slug}`} className="text-sm text-primary hover:underline">
                Read disease information
              </Link>
              <Link to="/categories" className="text-sm text-primary hover:underline">
                Browse categories
              </Link>
            </div>
          }
        />
      )}

      <section className="rounded-card border border-slate-200 bg-white p-5 shadow-card">
        <p className="text-xs leading-relaxed text-muted">{DISCLAIMER_TEXT}</p>
      </section>
    </div>
  )
}
