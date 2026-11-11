import { useLoaderData, useRevalidator } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {
  BookHeart,
  Clock,
  Pill,
  Plus,
  Shapes,
  TriangleAlert,
} from 'lucide-react'
import type { adminDashboardLoader } from '@/routes/loaders'
import { usePageTitle } from '@/utilities/usePageTitle'
import { formatDateShort, isReviewOutdated, monthsSince, reviewAgeLabel } from '@/utilities/date'
import { StatTile } from '@/components/admin/StatTile'

/**
 * The admin dashboard (Project Plan section 6 stage B).
 *
 * Counts come from the data, never typed by hand, so the numbers stay true
 * after edits.
 */
export function AdminDashboard() {
  const { stats, diseases } = useLoaderData() as Awaited<
    ReturnType<typeof adminDashboardLoader>
  >
  const revalidator = useRevalidator()

  usePageTitle('Admin dashboard')

  const needsAttention = diseases.filter(
    (disease) =>
      !disease.remedy || (disease.remedy && isReviewOutdated(disease.remedy.lastReviewed)),
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            A quick look at what is published and what still needs work.
          </p>
        </div>
        <button
          type="button"
          onClick={() => revalidator.revalidate()}
          disabled={revalidator.state !== 'idle'}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
        >
          {revalidator.state === 'idle' ? 'Refresh' : 'Refreshing...'}
        </button>
      </div>

      <section aria-labelledby="counts-heading" className="space-y-4">
        <h2 id="counts-heading" className="font-display text-lg font-semibold text-ink">
          Counts
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Diseases"
            value={stats.totalDiseases}
            hint="Published disease records"
            tone="brand"
            icon={<BookHeart aria-hidden="true" className="size-5" />}
          />
          <StatTile
            label="Categories"
            value={stats.totalCategories}
            hint="Groups on the public site"
            icon={<Shapes aria-hidden="true" className="size-5" />}
          />
          <StatTile
            label="Remedies"
            value={stats.totalRemedies}
            hint="Diseases with a remedy written"
            icon={<Pill aria-hidden="true" className="size-5" />}
          />
          <StatTile
            label="Missing remedies"
            value={stats.missingRemedies}
            hint="Diseases still without a remedy"
            tone={stats.missingRemedies > 0 ? 'warning' : 'neutral'}
            icon={<TriangleAlert aria-hidden="true" className="size-5" />}
          />
        </div>
      </section>

      <section aria-labelledby="quick-actions-heading" className="space-y-4">
        <h2 id="quick-actions-heading" className="font-display text-lg font-semibold text-ink">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/diseases/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add disease
          </Link>
          <Link
            to="/admin/remedies"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary"
          >
            <Pill aria-hidden="true" className="size-4" />
            Write a remedy
          </Link>
          <Link
            to="/admin/categories"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary"
          >
            <Shapes aria-hidden="true" className="size-4" />
            Manage categories
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="recent-heading" className="space-y-4">
          <h2 id="recent-heading" className="font-display text-lg font-semibold text-ink">
            Recently updated
          </h2>
          {stats.recentlyUpdated.length ? (
            <ul className="divide-y divide-slate-100 rounded-card border border-slate-200 bg-white shadow-card">
              {stats.recentlyUpdated.map((disease) => (
                <li key={disease.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <Link
                      to={`/admin/diseases/${disease.id}/edit`}
                      className="block truncate text-sm font-medium text-ink hover:text-primary"
                    >
                      {disease.name}
                    </Link>
                    <p className="truncate text-xs text-muted">{disease.category.name}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">
                    {formatDateShort(disease.updatedAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-card border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-muted">
              Nothing has been updated yet.
            </p>
          )}
        </section>

        <section aria-labelledby="attention-heading" className="space-y-4">
          <h2 id="attention-heading" className="font-display text-lg font-semibold text-ink">
            Needs attention
          </h2>
          {needsAttention.length ? (
            <ul className="divide-y divide-slate-100 rounded-card border border-slate-200 bg-white shadow-card">
              {needsAttention.map((disease) => {
                const outdated = disease.remedy
                  ? isReviewOutdated(disease.remedy.lastReviewed)
                  : false
                return (
                  <li key={disease.id} className="px-4 py-3">
                    <Link
                      to={`/admin/diseases/${disease.id}/edit`}
                      className="text-sm font-medium text-ink hover:text-primary"
                    >
                      {disease.name}
                    </Link>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                      <Clock aria-hidden="true" className="size-3.5" />
                      {!disease.remedy
                        ? 'No remedy written yet'
                        : outdated
                          ? `Reviewed ${reviewAgeLabel(disease.remedy.lastReviewed)} (${monthsSince(disease.remedy.lastReviewed)} months)`
                          : `Reviewed ${reviewAgeLabel(disease.remedy.lastReviewed)}`}
                    </p>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="rounded-card border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-muted">
              Everything has a remedy and is recently reviewed.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
