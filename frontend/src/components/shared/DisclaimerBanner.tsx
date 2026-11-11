import { Info } from 'lucide-react'
import { DISCLAIMER_BANNER_TEXT } from './disclaimerText'

/**
 * The slim, calm strip under the navbar.
 *
 * Uses the shared disclaimer wording so it reads the same everywhere.
 */
export function DisclaimerBanner() {
  return (
    <aside
      aria-label="Medical disclaimer"
      className="border-b border-primary-light-alt bg-primary-light/60"
    >
      <div className="mx-auto flex max-w-6xl items-start gap-2 px-4 py-2 sm:px-6">
        <Info
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-primary-dark"
        />
        <p className="text-xs leading-relaxed text-primary-dark sm:text-sm">
          {DISCLAIMER_BANNER_TEXT}
        </p>
      </div>
    </aside>
  )
}
