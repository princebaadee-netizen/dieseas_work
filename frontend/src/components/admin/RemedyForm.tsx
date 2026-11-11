import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Save, ShieldAlert } from 'lucide-react'
import type { Disease, FieldErrors, ServiceResult } from '@/types'
import type { RemedyInput } from '@/services/validation'
import { hasErrors, validateRemedy } from '@/services/validation'
import { FormField, inputClass, textareaClass } from './FormField'
import { RepeatableListInput } from './RepeatableListInput'

interface RemedyFormProps {
  disease: Disease
  onSubmit: (input: RemedyInput) => Promise<ServiceResult<Disease>>
  onCancel: () => void
  /** Tells the page when the administrator has unsaved edits. */
  onDirtyChange?: (dirty: boolean) => void
}

type FormValues = RemedyInput

/**
 * The add and edit remedy form (Project Plan section 6 stage E).
 *
 * The remedy always belongs to one disease, and the source plus the last
 * reviewed date are required so old content can be spotted later.
 */
export function RemedyForm({ disease, onSubmit, onCancel, onDirtyChange }: RemedyFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [submittedSnapshot, setSubmittedSnapshot] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const existing = disease.remedy

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isDirty, touchedFields },
  } = useForm<FormValues>({
    defaultValues: existing
      ? {
          overview: existing.overview,
          careOptions: existing.careOptions.length > 0 ? existing.careOptions : [''],
          precautions: existing.precautions.length > 0 ? existing.precautions : [''],
          urgentSigns: existing.urgentSigns.length > 0 ? existing.urgentSigns : [''],
          source: existing.source,
          lastReviewed: existing.lastReviewed,
        }
      : {
          overview: '',
          careOptions: [''],
          precautions: [''],
          urgentSigns: [''],
          source: '',
          lastReviewed: '',
        },
  })

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  // The same rules the service uses, so the administrator sees the problem
  // while typing rather than only after a round trip
  // (Project Plan section 5.6).
  // React Compiler skips memoising this component because react-hook-form
  // returns functions it cannot track. That is expected and safe here: the
  // form owns its own state and the children below are not memoised.
  // oxlint-disable-next-line react/incompatible-library
  const currentValues = watch() as FormValues
  const localErrors = validateRemedy(currentValues)
  const touched = touchedFields as Record<string, boolean | undefined>

  const shownLocal: FieldErrors = {}
  for (const [key, message] of Object.entries(localErrors)) {
    if (submitAttempted || touched[key]) shownLocal[key] = message
  }

  const changedSinceSubmit =
    submittedSnapshot !== null && JSON.stringify(currentValues) !== submittedSnapshot
  const visibleErrors: FieldErrors = changedSinceSubmit
    ? shownLocal
    : { ...shownLocal, ...fieldErrors }

  async function submit(values: FormValues) {
    setSubmitAttempted(true)
    setFormError(null)
    setFieldErrors({})

    const errors = validateRemedy(values)
    if (hasErrors(errors)) {
      setSubmittedSnapshot(JSON.stringify(values))
      setFieldErrors(errors)
      setFormError('Please fix the highlighted fields.')
      return
    }

    setBusy(true)
    setSubmittedSnapshot(JSON.stringify(values))

    const result = await onSubmit(values)
    setBusy(false)

    if (result.success) {
      reset(values)
      return
    }

    setFormError(result.message)
    if (result.fields) setFieldErrors(result.fields)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6" noValidate>
      {formError ? (
        <p role="alert" className="rounded-card border border-urgent/40 bg-urgent-soft/50 px-4 py-3 text-sm text-urgent">
          {formError}
        </p>
      ) : null}

      <div className="rounded-card border border-warning/40 bg-warning-soft/50 p-4">
        <p className="flex items-start gap-2 text-sm text-warning">
          <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            Do not write dosages or specific instructions. Describe the kind of treatment in general
            terms and point the reader to a health professional.
          </span>
        </p>
      </div>

      <div className="rounded-card border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          Remedy for {disease.name}
        </h2>
        <p className="mt-1 text-sm text-muted">
          This remedy is attached to {disease.name} and appears on its public page.
        </p>

        <div className="mt-5 space-y-5">
          <FormField
            label="Overview"
            required
            error={visibleErrors.overview}
            hint="How the condition is usually managed, in plain language. Up to 1500 characters."
          >
            {({ id, describedBy, invalid }) => (
              <textarea
                {...register('overview')}
                id={id}
                rows={5}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={textareaClass}
                placeholder="Treatment usually focuses on rest, fluids and advice from a health professional."
              />
            )}
          </FormField>

          <RepeatableListInput
            label="Care options"
            itemLabel="care option"
            // React Compiler skips memoising this component because
            // react-hook-form returns functions it cannot track. Expected and
            // safe: the form owns its own state and the children are not
            // memoised.
            // oxlint-disable-next-line react/incompatible-library
            items={watch('careOptions') ?? []}
            onChange={(items) => setValue('careOptions', items, { shouldDirty: true, shouldTouch: true })}
            error={visibleErrors.careOptions}
            placeholder="For example: Rest and fluids"
          />

          <RepeatableListInput
            label="Precautions"
            itemLabel="precaution"
            items={watch('precautions') ?? []}
            onChange={(items) => setValue('precautions', items, { shouldDirty: true, shouldTouch: true })}
            error={visibleErrors.precautions}
            placeholder="For example: Avoid crowded places while unwell"
          />

          <RepeatableListInput
            label="Urgent signs"
            itemLabel="urgent sign"
            items={watch('urgentSigns') ?? []}
            onChange={(items) => setValue('urgentSigns', items, { shouldDirty: true, shouldTouch: true })}
            error={visibleErrors.urgentSigns}
            placeholder="For example: Difficulty breathing"
          />
        </div>
      </div>

      <div className="rounded-card border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Source and review</h2>
        <p className="mt-1 text-sm text-muted">
          Every entry needs a source and a review date so it can be checked later.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField
            label="Source or reviewer"
            required
            error={visibleErrors.source}
            hint="Where this information came from."
          >
            {({ id, describedBy, invalid }) => (
              <input
                {...register('source')}
                id={id}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={inputClass}
                placeholder="Ministry of Health guidance, 2025"
              />
            )}
          </FormField>

          <FormField
            label="Last reviewed"
            required
            error={visibleErrors.lastReviewed}
            hint="The date the content was last checked."
          >
            {({ id, describedBy, invalid }) => (
              <input
                {...register('lastReviewed')}
                id={id}
                type="date"
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={inputClass}
              />
            )}
          </FormField>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          <Save aria-hidden="true" className="size-4" />
          {busy ? 'Saving...' : existing ? 'Save changes' : 'Add remedy'}
        </button>
      </div>

      {isDirty ? <p className="text-right text-xs text-muted">You have unsaved changes.</p> : null}
    </form>
  )
}
