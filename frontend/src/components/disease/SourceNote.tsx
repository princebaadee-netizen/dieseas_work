import { FileText } from 'lucide-react'
import { formatDate, isReviewOutdated, reviewAgeLabel } from '@/utilities/date'

interface SourceNoteProps {
  source: string
  lastReviewed: string
  showOutdatedNotice?: boolean
}

/**
 * Source and review date. Shows a gentle notice when review is over a year old
 * (Project Plan section 2.2 and milestones 4, 7).
 */
export function SourceNote({ source, lastReviewed, showOutdatedNotice = true }: SourceNoteProps) {
  const outdated = isReviewOutdated(lastReviewed)

  return (
    <section className="rounded-card border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start gap-3">
        <FileText aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted" />
        <div>
          <h2 className="font-display text-base font-semibold text-ink">Source and review</h2>
          <p className="mt-1 text-sm text-muted">
            <span className="font-medium text-ink">Source:</span> {source}
          </p>
          <p className="mt-1 text-sm text-muted">
            <span className="font-medium text-ink">Last reviewed:</span> {formatDate(lastReviewed)} (
            {reviewAgeLabel(lastReviewed)})
          </p>
          {showOutdatedNotice && outdated ? (
            <p className="mt-2 text-sm text-warning">
              This page may be out of date. It was last reviewed over a year ago and should be
              rechecked.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
