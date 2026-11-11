import { useState } from 'react'
import { Link, useLoaderData, useNavigate, useRevalidator } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { adminDeleteDisease } from '@/services/adminService'
import type { Disease } from '@/types'
import type { adminDiseasesLoader } from '@/routes/loaders'
import { usePageTitle } from '@/utilities/usePageTitle'
import { formatDateShort } from '@/utilities/date'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog'
import { NoticeBar } from '@/components/admin/NoticeBar'
import { Tag } from '@/components/shared/Tag'

/**
 * The admin disease list (Project Plan section 6 stage D).
 *
 * The list can be searched, edited and deleted. Deleting always asks for
 * confirmation first.
 */
export function AdminDiseaseList() {
  const diseases = useLoaderData() as Awaited<ReturnType<typeof adminDiseasesLoader>>
  const revalidator = useRevalidator()
  const navigate = useNavigate()

  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Disease | null>(null)
  const [deleting, setDeleting] = useState(false)

  usePageTitle('Diseases')

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)

    const result = await adminDeleteDisease(pendingDelete.id)
    setDeleting(false)

    if (!result.success) {
      setNotice({ tone: 'error', text: result.message })
      setPendingDelete(null)
      return
    }

    setNotice({ tone: 'success', text: result.message })
    setPendingDelete(null)
    revalidator.revalidate()
  }

  const columns: Column<Disease>[] = [
    {
      key: 'name',
      header: 'Disease',
      render: (disease) => (
        <div className="min-w-0">
          <p className="font-medium text-ink">{disease.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted">{disease.shortSummary}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (disease) => <Tag tone="neutral">{disease.category.name}</Tag>,
    },
    {
      key: 'remedy',
      header: 'Remedy',
      render: (disease) =>
        disease.remedy ? <Tag tone="success">Written</Tag> : <Tag tone="warning">Missing</Tag>,
    },
    {
      key: 'featured',
      header: 'Home page',
      render: (disease) =>
        disease.featured ? <Tag tone="brand">Featured</Tag> : <span className="text-muted">-</span>,
    },
    {
      key: 'updated',
      header: 'Updated',
      render: (disease) => (
        <span className="whitespace-nowrap text-muted">{formatDateShort(disease.updatedAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (disease) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/diseases/${disease.id}/edit`}
            aria-label={`Edit ${disease.name}`}
            className="rounded-lg border border-slate-300 p-2 text-muted transition-colors hover:border-primary hover:text-primary"
          >
            <Pencil aria-hidden="true" className="size-4" />
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(disease)}
            aria-label={`Delete ${disease.name}`}
            className="rounded-lg border border-slate-300 p-2 text-muted transition-colors hover:border-urgent/40 hover:bg-urgent-soft/40 hover:text-urgent"
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </button>
        </div>
      ),
      className: 'whitespace-nowrap',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Diseases</h1>
          <p className="mt-1 text-sm text-muted">
            {diseases.length} {diseases.length === 1 ? 'disease' : 'diseases'} in the system.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/diseases/new')}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <Plus aria-hidden="true" className="size-4" />
          Add disease
        </button>
      </div>

      {notice ? (
        <NoticeBar tone={notice.tone} message={notice.text} onDismiss={() => setNotice(null)} />
      ) : null}

      <DataTable
        columns={columns}
        rows={diseases}
        rowKey={(disease) => disease.id}
        searchPlaceholder="Search diseases"
        searchText={(disease) => `${disease.name} ${disease.category.name}`}
        emptyTitle="No diseases yet"
        emptyDescription="Add the first disease to start building the site."
      />

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        title={`Delete ${pendingDelete?.name ?? 'this disease'}?`}
        description="The disease and its remedy will be removed from the site. This cannot be undone."
        confirmLabel="Delete disease"
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
