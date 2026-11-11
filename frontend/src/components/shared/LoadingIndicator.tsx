import { Loader2 } from 'lucide-react'

interface LoadingIndicatorProps {
  label?: string
  className?: string
}

/** The shared loading state used wherever a result is being fetched. */
export function LoadingIndicator({ label = 'Loading…', className = '' }: LoadingIndicatorProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={['flex items-center justify-center gap-3 py-12 text-muted', className]
        .filter(Boolean)
        .join(' ')}
    >
      <Loader2 aria-hidden="true" className="size-5 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

/** A row of placeholder blocks, used while a list is loading. */
export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="rounded-card border border-slate-200 bg-white p-5">
          <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  )
}
