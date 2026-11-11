import type { ReactNode } from 'react'

interface StatTileProps {
  label: string
  value: number | string
  hint?: string
  tone?: 'neutral' | 'brand' | 'warning'
  icon?: ReactNode
}

/** A single number on the admin dashboard (Project Plan section 2.3). */
export function StatTile({ label, value, hint, tone = 'neutral', icon }: StatTileProps) {
  const tones = {
    neutral: 'bg-white border-slate-200',
    brand: 'bg-primary-light/50 border-primary-light-alt',
    warning: 'bg-warning-soft/60 border-warning/30',
  } as const

  return (
    <article className={`rounded-card border p-5 shadow-card ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
        </div>
        {icon ? <div className="rounded-lg bg-white/70 p-2 text-primary-dark">{icon}</div> : null}
      </div>
    </article>
  )
}
