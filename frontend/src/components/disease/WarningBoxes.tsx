import type { ReactNode } from 'react'
import { AlertTriangle, ShieldAlert } from 'lucide-react'

interface WarningBoxProps {
  title: string
  items: string[]
  children?: ReactNode
}

/** Amber warning box for precautions (Project Plan sections 2.2 and 2.5). */
export function WarningBox({ title, items, children }: WarningBoxProps) {
  if (items.length === 0 && !children) return null

  return (
    <section className="rounded-card border border-warning/40 bg-warning-soft/60 p-6 shadow-card">
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-warning" />
        <div className="w-full">
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          {items.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {items.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-ink/90">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-warning" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {children ? <div className="mt-3">{children}</div> : null}
        </div>
      </div>
    </section>
  )
}

interface UrgentCareBoxProps {
  title: string
  items: string[]
  children?: ReactNode
}

/** Red urgent care box for when to seek professional care (Project Plan sections 2.2 and 2.5). */
export function UrgentCareBox({ title, items, children }: UrgentCareBoxProps) {
  if (items.length === 0 && !children) return null

  return (
    <section className="rounded-card border border-urgent/40 bg-urgent-soft/60 p-6 shadow-card">
      <div className="flex items-start gap-3">
        <ShieldAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-urgent" />
        <div className="w-full">
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-ink/90">Seek emergency or urgent care as advised.</p>
          {items.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {items.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-ink/90">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-urgent" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {children ? <div className="mt-3">{children}</div> : null}
        </div>
      </div>
    </section>
  )
}
