/**
 * [LINK] The shared data structure.
 *
 * This file is the contract between the frontend and the future backend
 * (Project Plan sections 4.1 and 4.4). The frontend builds against it now and
 * the backend must return exactly this later. If a difference appears, fix the
 * backend, not this file.
 *
 * Rules that the backend must mirror:
 * - Lists are always lists, never missing; an empty list is allowed.
 * - A disease without a remedy carries an explicit no-remedy marker (null).
 * - Dates use one consistent format (ISO 8601, `YYYY-MM-DD`).
 * - Slugs are lowercase, hyphen-separated and unique.
 *
 * One field is an addition to the Project Plan's table in section 4.1:
 * `featured`. Section 9.3 left the definition of 'featured' open, offering
 * "a flag or most recently updated". The flag was chosen, so the plan's
 * section 4.1 field list needs one extra boolean column on the backend. See
 * docs/backend-endpoints.md.
 */

/** A disease category, for example "Infectious diseases". */
export interface Category {
  id: number
  name: string
  slug: string
  description: string
}

/**
 * Treatment information for a disease.
 *
 * Content rules: no dosages, no prescription instructions, and a source or
 * reviewer plus a last reviewed date are always required.
 */
export interface Remedy {
  id: number
  /** Plain-language summary of the treatment approach. */
  overview: string
  /** Care options the reader can discuss with a health professional. */
  careOptions: string[]
  /** Precautions. Always rendered in the amber box. */
  precautions: string[]
  /** Emergency warning signs. Always rendered in the red box. */
  urgentSigns: string[]
  /** The source or the reviewer the content is based on. */
  source: string
  /** ISO 8601 date (`YYYY-MM-DD`) of the last content review. */
  lastReviewed: string
}

/** The name and slug of the category a disease belongs to. */
export interface DiseaseCategoryRef {
  name: string
  slug: string
}

/** A full disease record. */
export interface Disease {
  id: number
  category: DiseaseCategoryRef
  name: string
  slug: string
  /** One-line summary used on cards and in search results. */
  shortSummary: string
  description: string
  symptoms: string[]
  causes: string[]
  riskFactors: string[]
  prevention: string[]
  /** `null` is the explicit no-remedy marker. */
  remedy: Remedy | null
  /**
   * Whether an administrator has promoted this disease to the home page
   * list. This answers the open question in Project Plan section 9.3: the
   * home page shows the diseases marked here, in name order.
   */
  featured: boolean
  /** ISO 8601 date (`YYYY-MM-DD`). */
  createdAt: string
  /** ISO 8601 date (`YYYY-MM-DD`). */
  updatedAt: string
}

/** A category plus the number of diseases inside it. */
export interface CategoryWithCount extends Category {
  diseaseCount: number
}
