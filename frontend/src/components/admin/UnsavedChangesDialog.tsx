import type { Blocker } from 'react-router-dom'
import { useAdminAuth } from './useAdminAuth'

interface UnsavedChangesDialogProps {
  blocker: Blocker
  onKeepEditing: () => void
  onLeave: () => void
}

/** The in-app "you have unsaved changes" prompt. */
export function UnsavedChangesDialog({
  blocker,
  onKeepEditing,
  onLeave,
}: UnsavedChangesDialogProps) {
  const { signOut } = useAdminAuth()

  if (blocker.state !== 'blocked') return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unsaved-title"
        className="w-full max-w-md rounded-card bg-white p-6 shadow-xl"
      >
        <h2 id="unsaved-title" className="font-display text-lg font-semibold text-ink">
          You have unsaved changes
        </h2>
        <p className="mt-1 text-sm text-muted">
          If you leave now, the changes you made will be lost. Sign out first if you need to
          protect your work.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onKeepEditing}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-slate-50"
          >
            Keep editing
          </button>
          <button
            type="button"
            onClick={async () => {
              await signOut()
              onLeave()
            }}
            className="rounded-lg bg-urgent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-urgent/90"
          >
            Sign out and leave
          </button>
        </div>
      </div>
    </div>
  )
}
