import type { ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export type NoticeTone = 'success' | 'error' | 'info'

interface NoticeBarProps {
  tone?: NoticeTone
  message: string
  onDismiss?: () => void
  children?: ReactNode
}

const TONES = {
  success: {
    wrapper: 'border-success/40 bg-success-soft/60 text-success',
    Icon: CheckCircle2,
  },
  error: {
    wrapper: 'border-urgent/40 bg-urgent-soft/60 text-urgent',
    Icon: AlertCircle,
  },
  info: {
    wrapper: 'border-primary-light-alt bg-primary-light/50 text-primary-dark',
    Icon: Info,
  },
} as const

/** The shared notice bar for admin success, error and information messages. */
export function NoticeBar({ tone = 'info', message, onDismiss, children }: NoticeBarProps) {
  const { wrapper, Icon } = TONES[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-card border px-4 py-3 ${wrapper}`}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="w-full">
        <p className="text-sm font-medium">{message}</p>
        {children ? <div className="mt-1 text-sm">{children}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="shrink-0 rounded p-0.5 transition-opacity hover:opacity-70"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
