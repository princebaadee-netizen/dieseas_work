import { useId, useState, type ReactNode } from 'react'
import { Search } from 'lucide-react'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  searchPlaceholder?: string
  /** Returns the text used to match a row against the search box. */
  searchText?: (row: T) => string
  emptyTitle?: string
  emptyDescription?: string
  onRowClick?: (row: T) => void
}

/**
 * The shared admin data table (Project Plan section 2.3).
 * On phones the table scrolls sideways inside its own area.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  searchPlaceholder = 'Search this list',
  searchText,
  emptyTitle = 'Nothing to show yet',
  emptyDescription,
  onRowClick,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('')
  const searchId = useId()

  const filtered = query.trim()
    ? rows.filter((row) =>
        (searchText ? searchText(row) : '').toLowerCase().includes(query.trim().toLowerCase()),
      )
    : rows

  return (
    <div className="space-y-4">
      {searchText ? (
        <div className="relative max-w-sm">
          <label htmlFor={searchId} className="sr-only">
            {searchPlaceholder}
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="font-display font-medium text-ink">{emptyTitle}</p>
          {emptyDescription ? <p className="mt-1 text-sm text-muted">{emptyDescription}</p> : null}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-slate-200 bg-white shadow-card">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 text-sm text-ink ${column.className ?? ''}`}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 0 && filtered.length !== rows.length ? (
        <p className="text-sm text-muted">
          Showing {filtered.length} of {rows.length}
        </p>
      ) : null}
    </div>
  )
}
