import { useState } from 'react'
import { useLoaderData, useRevalidator } from 'react-router-dom'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminUpdateCategory,
} from '@/services/adminService'
import type { Category } from '@/types'
import type { CategoryInput } from '@/services/validation'
import type { adminCategoriesLoader } from '@/routes/loaders'
import { usePageTitle } from '@/utilities/usePageTitle'
import { slugify } from '@/utilities/slug'
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog'
import { NoticeBar } from '@/components/admin/NoticeBar'
import { FormField, inputClass, textareaClass } from '@/components/admin/FormField'
import { Tag } from '@/components/shared/Tag'

/**
 * The admin category page (Project Plan section 6 stage F).
 *
 * Categories can be added, renamed in place and deleted. A category that
 * still holds diseases cannot be deleted, and the reason is shown.
 */
export function AdminCategories() {
  const { categories, diseases } = useLoaderData() as Awaited<
    ReturnType<typeof adminCategoriesLoader>
  >
  const revalidator = useRevalidator()

  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newErrors, setNewErrors] = useState<Record<string, string>>({})
  const [adding, setAdding] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [savingEdit, setSavingEdit] = useState(false)

  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  usePageTitle('Categories')

  function countFor(category: Category): number {
    return diseases.filter((disease) => disease.category.slug === category.slug).length
  }

  async function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAdding(true)
    setNewErrors({})

    const input: CategoryInput = { name: newName, description: newDescription }
    const result = await adminCreateCategory(input)
    setAdding(false)

    if (!result.success) {
      setNotice({ tone: 'error', text: result.message })
      if (result.fields) setNewErrors(result.fields)
      return
    }

    setNotice({ tone: 'success', text: result.message })
    setNewName('')
    setNewDescription('')
    revalidator.revalidate()
  }

  function startEdit(category: Category) {
    setEditingId(category.id)
    setEditName(category.name)
    setEditDescription(category.description)
    setEditErrors({})
  }

  function cancelEdit() {
    setEditingId(null)
    setEditErrors({})
  }

  async function saveEdit() {
    if (editingId === null) return
    setSavingEdit(true)
    setEditErrors({})

    const result = await adminUpdateCategory(editingId, {
      name: editName,
      description: editDescription,
    })
    setSavingEdit(false)

    if (!result.success) {
      setNotice({ tone: 'error', text: result.message })
      if (result.fields) setEditErrors(result.fields)
      return
    }

    setNotice({ tone: 'success', text: result.message })
    cancelEdit()
    revalidator.revalidate()
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)

    const result = await adminDeleteCategory(pendingDelete.id)
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

  const pendingCount = pendingDelete ? countFor(pendingDelete) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Categories</h1>
        <p className="mt-1 text-sm text-muted">
          Categories group the diseases. A category that still holds diseases cannot be deleted.
        </p>
      </div>

      {notice ? (
        <NoticeBar tone={notice.tone} message={notice.text} onDismiss={() => setNotice(null)} />
      ) : null}

      <section
        aria-labelledby="add-category-heading"
        className="rounded-card border border-slate-200 bg-white p-5 shadow-card sm:p-6"
      >
        <h2 id="add-category-heading" className="font-display text-lg font-semibold text-ink">
          Add a category
        </h2>

        <form onSubmit={handleAdd} className="mt-4 space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Name" required error={newErrors.name}>
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  type="text"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  className={inputClass}
                  placeholder="Skin conditions"
                />
              )}
            </FormField>

            <div className="self-end pb-1 text-xs text-muted">
              Web address:{' '}
              <span className="font-mono text-ink">
                /category/{slugify(newName) || 'your-category'}
              </span>
            </div>
          </div>

          <FormField label="Description" error={newErrors.description}>
            {({ id, describedBy, invalid }) => (
              <textarea
                id={id}
                rows={2}
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className={textareaClass}
                placeholder="A short note about what belongs in this category."
              />
            )}
          </FormField>

          <button
            type="submit"
            disabled={adding}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            <Plus aria-hidden="true" className="size-4" />
            {adding ? 'Adding...' : 'Add category'}
          </button>
        </form>
      </section>

      <section aria-labelledby="manage-categories-heading" className="space-y-3">
        <h2 id="manage-categories-heading" className="font-display text-lg font-semibold text-ink">
          Manage categories
        </h2>

        <ul className="space-y-3">
          {categories.map((category) => {
            const count = countFor(category)
            const editing = editingId === category.id

            return (
              <li
                key={category.id}
                className="rounded-card border border-slate-200 bg-white p-4 shadow-card sm:p-5"
              >
                {editing ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField label="Name" required error={editErrors.name}>
                        {({ id, describedBy, invalid }) => (
                          <input
                            id={id}
                            type="text"
                            value={editName}
                            onChange={(event) => setEditName(event.target.value)}
                            aria-invalid={invalid}
                            aria-describedby={describedBy}
                            className={inputClass}
                          />
                        )}
                      </FormField>

                      <div className="self-end pb-1 text-xs text-muted">
                        The address stays as{' '}
                        <span className="font-mono text-ink">/category/{category.slug}</span>
                      </div>
                    </div>

                    <FormField label="Description" error={editErrors.description}>
                      {({ id, describedBy, invalid }) => (
                        <textarea
                          id={id}
                          rows={2}
                          value={editDescription}
                          onChange={(event) => setEditDescription(event.target.value)}
                          aria-invalid={invalid}
                          aria-describedby={describedBy}
                          className={textareaClass}
                        />
                      )}
                    </FormField>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void saveEdit()}
                        disabled={savingEdit}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
                      >
                        <Check aria-hidden="true" className="size-4" />
                        {savingEdit ? 'Saving...' : 'Save name'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={savingEdit}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-slate-50 disabled:opacity-60"
                      >
                        <X aria-hidden="true" className="size-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-display font-medium text-ink">{category.name}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {category.description || 'No description yet.'}
                      </p>
                      <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                        <Tag tone="neutral">
                          {count} {count === 1 ? 'disease' : 'diseases'}
                        </Tag>
                        <span className="font-mono">/category/{category.slug}</span>
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(category)}
                        aria-label={`Rename ${category.name}`}
                        className="rounded-lg border border-slate-300 p-2 text-muted transition-colors hover:border-primary hover:text-primary"
                      >
                        <Pencil aria-hidden="true" className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(category)}
                        aria-label={`Delete ${category.name}`}
                        className="rounded-lg border border-slate-300 p-2 text-muted transition-colors hover:border-urgent/40 hover:bg-urgent-soft/40 hover:text-urgent"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        {categories.length === 0 ? (
          <p className="rounded-card border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-muted">
            No categories yet. Add the first one above.
          </p>
        ) : null}
      </section>

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        title={`Delete ${pendingDelete?.name ?? 'this category'}?`}
        description="The category will be removed from the site. Diseases inside it must be moved first."
        confirmLabel="Delete category"
        busy={deleting}
        blockedReason={
          pendingCount > 0
            ? `This category still holds ${pendingCount} ${pendingCount === 1 ? 'disease' : 'diseases'}. Move them to another category before deleting it.`
            : undefined
        }
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
