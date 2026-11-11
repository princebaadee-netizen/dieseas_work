import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDeleteDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  busy?: boolean
  /** A reason the delete cannot go ahead, such as a category still in use. */
  blockedReason?: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * The shared delete confirmation (Project Plan section 2.3).
 * When `blockedReason` is set the confirm button is disabled, which is how
 * the "category is still in use" rule is shown to the administrator.
 */
export function ConfirmDeleteDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  busy = false,
  blockedReason,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) {
        onCancel()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, busy, onCancel])

  if (!open) return null

  const blocked = Boolean(blockedReason)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-description"
        className="w-full max-w-md rounded-card bg-white p-6 shadow-xl"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={`rounded-full p-2 ${blocked ? 'bg-warning-soft text-warning' : 'bg-urgent-soft text-urgent'}`}
          >
            <AlertTriangle className="size-5" />
          </span>
          <div className="flex-1">
            <h2 id="confirm-delete-title" className="font-display text-lg font-semibold text-ink">
              {title}
            </h2>
            <p id="confirm-delete-description" className="mt-1 text-sm text-muted">
              {description}
            </p>
          </div>
        </div>

        {blockedReason ? (
          <p className="mt-4 rounded-lg bg-warning-soft/70 px-3 py-2 text-sm text-warning">
            {blockedReason}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={blocked || busy}
            className="rounded-lg bg-urgent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-urgent/90 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {busy ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
