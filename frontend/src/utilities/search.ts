import type { Disease } from '@/types'

/**
 * The search rules (Project Plan section 4.3).
 *
 * The backend mirrors these exactly, so they live in one place on the
 * frontend and can be handed over as part of the [LINK] contract.
 *
 * - Trim text and ignore capital letters; partial words match
 *   (`mala` finds malaria).
 * - Search disease name, short summary, symptoms and category name.
 * - Rank name matches first, then symptom matches, then summary matches.
 * - Always return a total count; no matches returns an empty list with count
 *   zero, never an error.
 */

/** Ranking tiers, lowest number wins. */
export const SEARCH_RANKS = {
  name: 0,
  symptom: 1,
  summary: 2,
  category: 3,
  combined: 4,
} as const

export type SearchRank = (typeof SEARCH_RANKS)[keyof typeof SEARCH_RANKS]

function normalise(value: string): string {
  return value.trim().toLowerCase()
}

function contains(value: string, query: string): boolean {
  return normalise(value).includes(query)
}

/** The tier a disease falls into for a query, or `null` when it does not match. */
export function rankDisease(disease: Disease, rawQuery: string): SearchRank | null {
  const query = normalise(rawQuery)
  if (query === '') return SEARCH_RANKS.combined

  if (contains(disease.name, query)) return SEARCH_RANKS.name
  if (disease.symptoms.some((symptom) => contains(symptom, query))) return SEARCH_RANKS.symptom
  if (contains(disease.shortSummary, query)) return SEARCH_RANKS.summary
  if (contains(disease.category.name, query)) return SEARCH_RANKS.category

  // Fallback: every word appears somewhere across the searchable fields.
  const combined = [
    disease.name,
    disease.shortSummary,
    disease.category.name,
    ...disease.symptoms,
  ]
    .join(' ')
    .toLowerCase()
  const words = query.split(/\s+/).filter(Boolean)
  if (words.every((word) => combined.includes(word))) return SEARCH_RANKS.combined

  return null
}

/**
 * Filters and ranks diseases for a search.
 *
 * An empty query returns every disease (the backend does the same when the
 * `text` parameter is not supplied).
 */
export function matchDiseases(
  diseases: Disease[],
  text: string,
  categorySlug?: string,
): Disease[] {
  const filtered = categorySlug
    ? diseases.filter((disease) => disease.category.slug === categorySlug)
    : diseases

  const scored: Array<{ disease: Disease; rank: SearchRank }> = []
  for (const disease of filtered) {
    const rank = rankDisease(disease, text)
    if (rank !== null) scored.push({ disease, rank })
  }

  scored.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank
    return a.disease.name.localeCompare(b.disease.name)
  })

  return scored.map((entry) => entry.disease)
}

/**
 * Lightweight suggestions: names and slugs only, capped at a handful
 * (Project Plan section 5.5).
 */
export function suggestDiseases(
  diseases: Disease[],
  text: string,
  limit = 6,
): Array<{ name: string; slug: string }> {
  const query = normalise(text)
  if (query.length < 2) return []

  return diseases
    .filter((disease) => contains(disease.name, query))
    .slice(0, limit)
    .map((disease) => ({ name: disease.name, slug: disease.slug }))
}
