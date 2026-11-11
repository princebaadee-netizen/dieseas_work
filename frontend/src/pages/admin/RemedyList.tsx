import { useState } from 'react'
import { Link, useLoaderData, useNavigate, useRevalidator } from 'react-router-dom'
import { Clock, Pencil, Plus, Trash2 } from 'lucide-react'
import { adminDeleteRemedy } from '@/services/adminService'
import type { Disease } from '@/types'
import type { adminRemedyListLoader } from '@/routes/loaders'
import { usePageTitle } from '@/utilities/usePageTitle'
import { formatDateShort, isReviewOutdated, reviewAgeLabel } from '@/utilities/date'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog'
import { NoticeBar } from '@/components/admin/NoticeBar'
import { Tag } from '@/components/shared/Tag'

/**
 * The admin remedy list (Project Plan section 6 stage E).
 *
 * Each disease shows whether it has a remedy, and how long ago that remedy
 * was last reviewed, so old content is easy to spot.
 */
export function AdminRemedyList() {
  const diseases = useLoaderData() as Awaited<ReturnType<typeof adminRemedyListLoader>>
  const revalidator = useRevalidator()
  const navigate = useNavigate()

  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Disease | null>(null)
  const [deleting, setDeleting] = useState(false)

  usePageTitle('Remedies')

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)

    const result = await adminDeleteRemedy(pendingDelete.id)
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
      key: 'disease',
      header: 'Disease',
      render: (disease) => (
        <div className="min-w-0">
          <p className="font-medium text-ink">{disease.name}</p>
          <p className="mt-0.5 text-xs text-muted">{disease.category.name}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (disease) =>
        disease.remedy ? (
          <Tag tone="success">Written</Tag>
        ) : (
          <Tag tone="warning">Not written yet</Tag>
        ),
    },
    {
      key: 'reviewed',
      header: 'Last reviewed',
      render: (disease) =>
        disease.remedy ? (
          <div>
            <p className="whitespace-nowrap">{formatDateShort(disease.remedy.lastReviewed)}</p>
            <p
              className={`mt-0.5 flex items-center gap-1 text-xs ${
                isReviewOutdated(disease.remedy.lastReviewed) ? 'text-warning' : 'text-muted'
              }`}
            >
              <Clock aria-hidden="true" className="size-3" />
              {reviewAgeLabel(disease.remedy.lastReviewed)}
            </p>
          </div>
        ) : (
          <span className="text-muted">-</span>
        ),
    },
    {
      key: 'source',
      header: 'Source',
      render: (disease) => (
        <span className="block max-w-56 truncate text-muted" title={disease.remedy?.source}>
          {disease.remedy?.source ?? '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (disease) => (
        <div className="flex items-center gap-2">
          <Link
            to={
              disease.remedy
                ? `/admin/remedies/${disease.id}/edit`
                : `/admin/remedies/new?disease=${disease.id}`
            }
            aria-label={`${disease.remedy ? 'Edit' : 'Write'} the remedy for ${disease.name}`}
            className="rounded-lg border border-slate-300 p-2 text-muted transition-colors hover:border-primary hover:text-primary"
          >
            <Pencil aria-hidden="true" className="size-4" />
          </Link>
          {disease.remedy ? (
            <button
              type="button"
              onClick={() => setPendingDelete(disease)}
              aria-label={`Delete the remedy for ${disease.name}`}
              className="rounded-lg border border-slate-300 p-2 text-muted transition-colors hover:border-urgent/40 hover:bg-urgent-soft/40 hover:text-urgent"
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </button>
          ) : null}
        </div>
      ),
      className: 'whitespace-nowrap',
    },
  ]

  const withRemedy = diseases.filter((disease) => disease.remedy !== null).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Remedies</h1>
          <p className="mt-1 text-sm text-muted">
            {withRemedy} of {diseases.length} diseases have a remedy written.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/remedies/new')}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <Plus aria-hidden="true" className="size-4" />
          Write a remedy
        </button>
      </div>

      {notice ? (
        <NoticeBar tone={notice.tone} message={notice.text} onDismiss={() => setNotice(null)} />
      ) : null}

      <DataTable
        columns={columns}
        rows={diseases}
        rowKey={(disease) => disease.id}
        searchPlaceholder="Search remedies"
        searchText={(disease) =>
          `${disease.name} ${disease.category.name} ${disease.remedy?.source ?? ''}`
        }
        emptyTitle="No diseases yet"
        emptyDescription="Add a disease first, then write its remedy."
      />

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        title={`Remove the remedy for ${pendingDelete?.name ?? 'this disease'}?`}
        description="The disease stays on the site, but the public page will say that no remedy is available yet."
        confirmLabel="Remove remedy"
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
