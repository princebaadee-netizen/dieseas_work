import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { usePageTitle } from '@/utilities/usePageTitle'
import { getDisease } from '@/services'
import type { Disease } from '@/types'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { LoadingSkeleton } from '@/components/shared/LoadingIndicator'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { EmptyState } from '@/components/shared/EmptyState'
import { DISCLAIMER_TEXT } from '@/components/shared/disclaimerText'
import { DiseaseHeader } from '@/components/disease/DiseaseHeader'
import { InfoSection } from '@/components/disease/InfoSection'
import { QuickJumpMenu } from '@/components/disease/QuickJumpMenu'
import { TreatmentCallToAction } from '@/components/disease/TreatmentCallToAction'
import { UrgentCareBox } from '@/components/disease/WarningBoxes'

/**
 * The disease information page (Project Plan section 2.2).
 * Sections in order: Description, Symptoms, Causes, Risk factors, Prevention.
 */
export function Disease() {
  const { name } = useParams<{ name: string }>()
  const [disease, setDisease] = useState<Disease | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')

  usePageTitle(disease?.name ?? 'Disease information')

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
    return (
      <div className="space-y-4">
        <LoadingSkeleton rows={6} />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />
  }

  if (notFound || !disease) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Disease not found' }]} />
        <EmptyState
          title="We could not find that disease"
          description="Try searching for a different name or browse by category."
          headingLevel={1}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/categories" className="text-sm text-primary hover:underline">
                Browse categories
              </Link>
              <Link to="/search?q=malaria" className="text-sm text-primary hover:underline">
                Search malaria
              </Link>
            </div>
          }
        />
      </div>
    )
  }

  const jumpItems = [
    { id: 'description', label: 'Description' },
    { id: 'symptoms', label: 'Symptoms' },
    { id: 'causes', label: 'Causes' },
    { id: 'risk-factors', label: 'Risk factors' },
    { id: 'prevention', label: 'Prevention' },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: disease.category.name, to: `/category/${disease.category.slug}` },
          { label: disease.name },
        ]}
      />

      <DiseaseHeader disease={disease} />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="order-2 hidden lg:block">
          <QuickJumpMenu items={jumpItems} />
        </div>

        <div className="order-1 space-y-6">
          <section
            id="description"
            className="scroll-mt-28 rounded-card border border-slate-200 bg-white p-6 shadow-card sm:p-8"
          >
            <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">Description</h2>
            <p className="mt-3 leading-relaxed text-muted">{disease.description}</p>
          </section>

          <InfoSection id="symptoms" title="Symptoms" items={disease.symptoms} />
          <InfoSection id="causes" title="Causes" items={disease.causes} />
          <InfoSection id="risk-factors" title="Risk factors" items={disease.riskFactors} />
          <InfoSection id="prevention" title="Prevention" items={disease.prevention} />

          <TreatmentCallToAction diseaseSlug={disease.slug} hasRemedy={disease.remedy !== null} />

          {disease.remedy ? (
            <UrgentCareBox
              title="When to seek professional care"
              items={disease.remedy.urgentSigns}
            />
          ) : null}

          <section className="rounded-card border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-xs leading-relaxed text-muted">{DISCLAIMER_TEXT}</p>
          </section>

          <Link
            to={`/disease/${disease.slug}/remedy`}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
          >
            <ArrowLeft aria-hidden="true" className="size-4 rotate-180" />
            {disease.remedy ? 'View treatment and care' : 'View remedy page'}
          </Link>
        </div>
      </div>
    </div>
  )
}
