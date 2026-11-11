import { useState } from 'react'
import { Link, useLoaderData, useNavigate, useParams, useRevalidator } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { adminCreateDisease, adminUpdateDisease } from '@/services/adminService'
import type { DiseaseInput } from '@/services/validation'
import type { adminDiseaseFormLoader } from '@/routes/loaders'
import { usePageTitle } from '@/utilities/usePageTitle'
import { DiseaseForm } from '@/components/admin/DiseaseForm'
import { NoticeBar } from '@/components/admin/NoticeBar'
import { UnsavedChangesDialog } from '@/components/admin/UnsavedChangesDialog'
import { useUnsavedChanges } from '@/components/admin/useUnsavedChanges'

/**
 * The add and edit disease page (Project Plan section 6 stage D).
 * The same page handles both, because the plan asks for one form.
 */
export function AdminDiseaseForm() {
  const { categories, disease } = useLoaderData() as Awaited<
    ReturnType<typeof adminDiseaseFormLoader>
  >
  const { id } = useParams()
  const editingId = id ? Number(id) : null
  const isEditing = editingId !== null && Number.isFinite(editingId)

  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const { setDirty, blocker } = useUnsavedChanges()

  const navigate = useNavigate()
  const revalidator = useRevalidator()
  usePageTitle(isEditing ? 'Edit disease' : 'Add disease')

  async function submit(input: DiseaseInput) {
    const result =
      isEditing && editingId !== null
        ? await adminUpdateDisease(editingId, input)
        : await adminCreateDisease(input)

    if (result.success) {
      setNotice({ tone: 'success', text: result.message })
      setDirty(false)

      if (!isEditing) {
        navigate(`/admin/diseases/${result.data.id}/edit`, { replace: true })
      } else {
        revalidator.revalidate()
      }
    }

    return result
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/diseases"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to diseases
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
          {isEditing ? `Edit ${disease?.name}` : 'Add a disease'}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isEditing
            ? 'Changes appear on the public site as soon as you save.'
            : 'The whole record is saved together, so it appears on the site in one go.'}
        </p>
      </div>

      {notice ? (
        <NoticeBar tone={notice.tone} message={notice.text} onDismiss={() => setNotice(null)} />
      ) : null}

      <DiseaseForm
        key={disease ? `edit-${disease.id}` : 'new'}
        categories={categories}
        disease={disease ?? undefined}
        onSubmit={submit}
        onCancel={() => navigate('/admin/diseases')}
        onDirtyChange={setDirty}
      />

      <UnsavedChangesDialog
        blocker={blocker}
        onKeepEditing={() => blocker.reset?.()}
        onLeave={() => blocker.proceed?.()}
      />
    </div>
  )
}
