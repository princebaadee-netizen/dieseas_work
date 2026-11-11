import type { Category, Disease } from '@/types'
import { CATEGORIES } from './categories'
import { DISEASES } from './diseases'

/**
 * The in-memory data store.
 *
 * [FRONTEND] Until the backend exists, admin screens work on sample data
 * only: changes live in memory and reset on refresh.
 * [BACKEND] Later the services area reads the database instead, and this
 * store is deleted. Nothing outside the services area may import it.
 */
export interface DataStore {
  categories: Category[]
  diseases: Disease[]
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

export function createStore(): DataStore {
  return {
    categories: clone(CATEGORIES),
    diseases: clone(DISEASES),
  }
}

/** The single store used by the frontend services area. */
export const store: DataStore = createStore()

/** The next free id for a table. */
export function nextId(rows: Array<{ id: number }>): number {
  return rows.reduce((highest, row) => Math.max(highest, row.id), 0) + 1
}

export { CATEGORIES, DISEASES }
