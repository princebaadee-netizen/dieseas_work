import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Save } from 'lucide-react'
import type { Category, Disease, FieldErrors, ServiceResult } from '@/types'
import type { DiseaseInput } from '@/services/validation'
import { hasErrors, validateDisease } from '@/services/validation'
import { slugify } from '@/utilities/slug'
import { FormField, inputClass, textareaClass } from './FormField'
import { RepeatableListInput } from './RepeatableListInput'

interface DiseaseFormProps {
  categories: Category[]
  /** Present when editing. */
  disease?: Disease
  onSubmit: (input: DiseaseInput) => Promise<ServiceResult<Disease>>
  onCancel: () => void
  /** Tells the page when the administrator has unsaved edits. */
  onDirtyChange?: (dirty: boolean) => void
}

type FormValues = DiseaseInput

const EMPTY: FormValues = {
  name: '',
  categorySlug: '',
  shortSummary: '',
  description: '',
  symptoms: [''],
  causes: [''],
  riskFactors: [''],
  prevention: [''],
  featured: false,
}

/**
 * The add and edit disease form (Project Plan section 6 stage D).
 *
 * The slug is generated from the name and shown as a preview, so the
 * administrator can see the web address before saving.
 */
export function DiseaseForm({
  categories,
  disease,
  onSubmit,
  onCancel,
  onDirtyChange,
}: DiseaseFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [submittedSnapshot, setSubmittedSnapshot] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const featuredId = useId()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isDirty, touchedFields },
  } = useForm<FormValues>({
    defaultValues: disease
      ? {
          name: disease.name,
          categorySlug: disease.category.slug,
          shortSummary: disease.shortSummary,
          description: disease.description,
          symptoms: disease.symptoms.length > 0 ? disease.symptoms : [''],
          causes: disease.causes.length > 0 ? disease.causes : [''],
          riskFactors: disease.riskFactors.length > 0 ? disease.riskFactors : [''],
          prevention: disease.prevention.length > 0 ? disease.prevention : [''],
          featured: disease.featured,
        }
      : EMPTY,
  })

  // React Compiler skips memoising this component because react-hook-form
  // returns functions it cannot track. That is expected and safe here: the
  // form owns its own state and the children below are not memoised.
  // oxlint-disable-next-line react/incompatible-library
  const name = watch('name')
  const slugPreview = slugify(name)

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  // The same rules the service uses, so the administrator sees the problem
  // while typing rather than only after a round trip
  // (Project Plan section 5.6).
  const currentValues = watch() as FormValues
  const localErrors = validateDisease(currentValues)
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

    const errors = validateDisease(values)
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

      <div className="rounded-card border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Basics</h2>
        <p className="mt-1 text-sm text-muted">
          The name and summary appear in search results and on cards.
        </p>

        <div className="mt-5 space-y-5">
          <FormField label="Name" required error={visibleErrors.name}>
            {({ id, describedBy, invalid }) => (
              <input
                {...register('name')}
                id={id}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={inputClass}
                placeholder="Malaria"
              />
            )}
          </FormField>

          <p className="-mt-3 text-xs text-muted">
            Web address:{' '}
            <span className="font-mono text-ink">/disease/{slugPreview || 'your-disease-name'}</span>
          </p>

          <FormField label="Category" required error={visibleErrors.categorySlug}>
            {({ id, describedBy, invalid }) => (
              <select
                {...register('categorySlug')}
                id={id}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={inputClass}
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          <FormField
            label="Short summary"
            required
            error={visibleErrors.shortSummary}
            hint="One or two sentences. Up to 300 characters."
          >
            {({ id, describedBy, invalid }) => (
              <textarea
                {...register('shortSummary')}
                id={id}
                rows={2}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={textareaClass}
                placeholder="A short plain-language summary of the condition."
              />
            )}
          </FormField>

          <FormField
            label="Description"
            required
            error={visibleErrors.description}
            hint="The full explanation shown on the disease page. Up to 2000 characters."
          >
            {({ id, describedBy, invalid }) => (
              <textarea
                {...register('description')}
                id={id}
                rows={6}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={textareaClass}
                placeholder="Explain what the condition is, in plain language."
              />
            )}
          </FormField>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <input
            {...register('featured')}
            id={featuredId}
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
          />
          <div className="min-w-0">
            <label htmlFor={featuredId} className="text-sm font-medium text-ink">
              Show on the home page
            </label>
            <p className="mt-1 text-xs text-muted">
              Featured diseases appear in the &ldquo;Popular diseases&rdquo; list on the home
              page, in alphabetical order. Leave this off for a condition that is still being
              prepared.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-card border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Details</h2>
        <p className="mt-1 text-sm text-muted">
          Each list becomes its own section on the disease page.
        </p>

        <div className="mt-5 space-y-6">
          <RepeatableListInput
            label="Symptoms"
            itemLabel="symptom"
            items={watch('symptoms') ?? []}
            onChange={(items) => setValue('symptoms', items, { shouldDirty: true, shouldTouch: true })}
            error={visibleErrors.symptoms}
            placeholder="For example: Fever"
          />
          <RepeatableListInput
            label="Causes"
            itemLabel="cause"
            items={watch('causes') ?? []}
            onChange={(items) => setValue('causes', items, { shouldDirty: true, shouldTouch: true })}
            error={visibleErrors.causes}
            placeholder="For example: A mosquito bite"
          />
          <RepeatableListInput
            label="Risk factors"
            itemLabel="risk factor"
            items={watch('riskFactors') ?? []}
            onChange={(items) => setValue('riskFactors', items, { shouldDirty: true, shouldTouch: true })}
            error={visibleErrors.riskFactors}
            placeholder="For example: Living in a warm, wet area"
          />
          <RepeatableListInput
            label="Prevention"
            itemLabel="prevention step"
            items={watch('prevention') ?? []}
            onChange={(items) => setValue('prevention', items, { shouldDirty: true, shouldTouch: true })}
            error={visibleErrors.prevention}
            placeholder="For example: Use a mosquito net at night"
          />
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
          {busy ? 'Saving...' : disease ? 'Save changes' : 'Add disease'}
        </button>
      </div>

      {isDirty ? (
        <p className="text-right text-xs text-muted">You have unsaved changes.</p>
      ) : null}
    </form>
  )
}
