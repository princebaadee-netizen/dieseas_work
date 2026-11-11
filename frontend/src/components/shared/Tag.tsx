import type { ReactNode } from 'react'

export type TagTone = 'brand' | 'neutral' | 'warning' | 'urgent' | 'success'

const TONES: Record<TagTone, string> = {
  brand: 'bg-primary-light text-primary-dark',
  neutral: 'bg-slate-100 text-muted',
  warning: 'bg-warning-soft text-warning',
  urgent: 'bg-urgent-soft text-urgent',
  success: 'bg-success-soft text-success',
}

interface TagProps {
  tone?: TagTone
  children: ReactNode
  className?: string
}

/** A small label, for example a category tag under a disease name. */
export function Tag({ tone = 'brand', children, className = '' }: TagProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
