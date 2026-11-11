import { useMemo, useState } from 'react'
import { Link, useLoaderData, useNavigate, useParams, useRevalidator, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { adminCreateRemedy, adminUpdateRemedy } from '@/services/adminService'
import type { Disease, ServiceResult } from '@/types'
import type { RemedyInput } from '@/services/validation'
import type { adminRemedyFormLoader } from '@/routes/loaders'
import { usePageTitle } from '@/utilities/usePageTitle'
import { RemedyForm } from '@/components/admin/RemedyForm'
import { NoticeBar } from '@/components/admin/NoticeBar'
import { UnsavedChangesDialog } from '@/components/admin/UnsavedChangesDialog'
import { useUnsavedChanges } from '@/components/admin/useUnsavedChanges'
import { inputClass } from '@/components/admin/FormField'

/**
 * The add and edit remedy page (Project Plan section 6 stage E).
 *
 * A remedy always belongs to one disease, so the disease is chosen first and
 * the form then writes the remedy for it.
 */
export function AdminRemedyForm() {
  const diseases = useLoaderData() as Awaited<ReturnType<typeof adminRemedyFormLoader>>
  const { id } = useParams()
  const [searchParams] = useSearchParams()

  const editingId = id ? Number(id) : null
  const isEditing = editingId !== null && Number.isFinite(editingId)

  const [pickedId, setPickedId] = useState<number | null>(null)
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const { setDirty, blocker } = useUnsavedChanges()

  const navigate = useNavigate()
  const revalidator = useRevalidator()
  usePageTitle(isEditing ? 'Edit remedy' : 'Write a remedy')

  const queryId = Number(searchParams.get('disease'))
  const selectedId = isEditing
    ? editingId
    : pickedId ?? (Number.isFinite(queryId) && queryId > 0 ? queryId : null)

  const selected = useMemo(
    () => diseases.find((disease) => disease.id === selectedId) ?? null,
    [diseases, selectedId],
  )

  const available = useMemo(
    () => diseases.filter((disease) => disease.remedy === null || disease.id === selectedId),
    [diseases, selectedId],
  )

  async function submit(input: RemedyInput): Promise<ServiceResult<Disease>> {
    if (selectedId === null) {
      return { success: false, message: 'Choose a disease for this remedy.' }
    }

    const result = isEditing
      ? await adminUpdateRemedy(selectedId, input)
      : await adminCreateRemedy(selectedId, input)

    if (result.success) {
      setNotice({ tone: 'success', text: result.message })
      setDirty(false)
      revalidator.revalidate()
    }

    return result
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/remedies"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to remedies
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
          {isEditing ? `Edit the remedy for ${selected?.name}` : 'Write a remedy'}
        </h1>
        <p className="mt-1 text-sm text-muted">
          The remedy is attached to one disease and appears on its public page.
        </p>
      </div>

      {notice ? (
        <NoticeBar tone={notice.tone} message={notice.text} onDismiss={() => setNotice(null)} />
      ) : null}

      {!isEditing ? (
        <div className="rounded-card border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <label htmlFor="disease-picker" className="text-sm font-medium text-ink">
            Which disease is this for?
            <span className="ml-1 text-urgent">*</span>
          </label>
          <select
            id="disease-picker"
            value={pickedId ?? (Number.isFinite(queryId) && queryId > 0 ? queryId : '')}
            onChange={(event) => {
              const next = Number(event.target.value)
              setPickedId(Number.isFinite(next) && next > 0 ? next : null)
              setDirty(false)
            }}
            className={`mt-1.5 ${inputClass}`}
          >
            <option value="">Choose a disease</option>
            {available.map((disease) => (
              <option key={disease.id} value={disease.id}>
                {disease.name}
                {disease.remedy ? ' (already has a remedy)' : ''}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-muted">
            Only one remedy is allowed per disease. Diseases that already have one are marked.
          </p>
        </div>
      ) : null}

      {selected ? (
        <RemedyForm
          key={selected.id}
          disease={selected}
          onSubmit={submit}
          onCancel={() => navigate('/admin/remedies')}
          onDirtyChange={setDirty}
        />
      ) : (
        <p className="rounded-card border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-muted">
          Choose a disease above to start writing its remedy.
        </p>
      )}

      <UnsavedChangesDialog
        blocker={blocker}
        onKeepEditing={() => blocker.reset?.()}
        onLeave={() => blocker.proceed?.()}
      />
    </div>
  )
}
