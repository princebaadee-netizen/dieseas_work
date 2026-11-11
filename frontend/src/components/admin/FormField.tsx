import type { ReactNode } from 'react'
import { useId } from 'react'

interface FormFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: (props: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode
}

/**
 * A labelled form field with error and hint text
 * (Project Plan section 2.3). Every field is labelled, and errors are
 * announced and linked with `aria-describedby`.
 */
export function FormField({ label, error, hint, required, children }: FormFieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required ? <span className="ml-1 text-urgent">*</span> : null}
      </label>
      <div className="mt-1.5">{children({ id, describedBy, invalid: Boolean(error) })}</div>
      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-urgent">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** The shared input styling, used by every admin field. */
export const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-slate-100'

/** The shared textarea styling. */
export const textareaClass = `${inputClass} min-h-24 resize-y leading-relaxed`
