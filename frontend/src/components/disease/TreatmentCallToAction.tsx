import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList } from 'lucide-react'
import { buttonClasses } from '@/components/shared/buttonClasses'

interface TreatmentCallToActionProps {
  diseaseSlug: string
  hasRemedy: boolean
}

/** Call-to-action card linking to the remedy page (Project Plan section 2.2). */
export function TreatmentCallToAction({ diseaseSlug, hasRemedy }: TreatmentCallToActionProps) {
  return (
    <section className="rounded-card border border-slate-200 bg-gradient-to-br from-primary-light/40 to-white p-6 shadow-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary-light p-2 text-primary-dark">
            <ClipboardList aria-hidden="true" className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Treatment and care</h2>
            <p className="mt-1 text-sm text-muted">
              {hasRemedy
                ? 'See reviewed treatment information, care options, precautions and when to seek care.'
                : 'Remedy information is being prepared for this disease.'}
            </p>
          </div>
        </div>
        <Link to={`/disease/${diseaseSlug}/remedy`} className={buttonClasses('primary', 'md')}>
          {hasRemedy ? 'View remedy' : 'View remedy page'}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </section>
  )
}
