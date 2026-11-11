import { AlertTriangle, RotateCcw } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
}

/**
 * The shared error state.
 *
 * The message never contains technical detail, so the wording is written for
 * a visitor rather than a developer.
 */
export function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={[
        'flex flex-col items-start gap-3 rounded-card border border-urgent/30 bg-urgent-soft/40 p-5 sm:flex-row sm:items-center sm:justify-between',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-urgent" />
        <div>
          <p className="font-medium text-ink">Something went wrong</p>
          <p className="mt-0.5 text-sm text-muted">{message}</p>
        </div>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-urgent/40 bg-white px-3 py-1.5 text-sm font-medium text-urgent transition-colors hover:bg-urgent-soft"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Try again
        </button>
      ) : null}
    </div>
  )
}
