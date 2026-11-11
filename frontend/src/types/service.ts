/**
 * [LINK] Shapes for the services area (Project Plan section 4.2).
 *
 * Every service function reports success and failure the same way: a short
 * message and, for forms, which field failed. The backend must return the
 * same shapes so that only the services area changes when it arrives.
 */

/** Field-level validation errors, keyed by form field name. */
export type FieldErrors = Record<string, string>

export type ServiceResult<T> =
  | { success: true; data: T; message: string }
  | { success: false; message: string; fields?: FieldErrors }

/** A category plus its diseases, returned by `getCategory`. */
export interface CategoryWithDiseases {
  category: import('./disease').Category
  diseases: import('./disease').Disease[]
}

/** Search matches plus the total count. Never null, only empty. */
export interface SearchResult {
  matches: import('./disease').Disease[]
  total: number
}

/** Input for `searchDiseases`. */
export interface SearchParams {
  text: string
  category?: string
}

/** Dashboard totals and recently updated items. */
export interface AdminStats {
  totalDiseases: number
  totalCategories: number
  totalRemedies: number
  /** Diseases with no remedy yet. */
  missingRemedies: number
  recentlyUpdated: import('./disease').Disease[]
}

/** The admin session placeholder. The real session comes from the backend. */
export interface AdminSession {
  name: string
  email: string
}

/** Sort options offered by the admin disease list. */
export type AdminDiseaseSort = 'name' | 'updated' | 'category'
