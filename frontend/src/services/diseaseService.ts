import { store } from '@/data'
import type { Disease, SearchParams, SearchResult, ServiceResult } from '@/types'
import { matchDiseases, suggestDiseases } from '@/utilities/search'
import { pickFeaturedDiseases } from '@/utilities/featured'
import { SETTINGS } from './config'
import { withMock } from './transport'

/**
 * The public disease actions (Project Plan section 4.2).
 *
 * One function per action, each returning the same result shape. When the
 * backend arrives, only the body of each function changes to call the
 * matching endpoint in section 4.4.
 */

/** Search diseases. `text` may be empty; `category` is an optional slug. */
export async function searchDiseases(
  params: SearchParams,
): Promise<ServiceResult<SearchResult>> {
  const matches = await withMock(() =>
    matchDiseases(store.diseases, params.text, params.category),
  )

  return {
    success: true,
    data: { matches, total: matches.length },
    message:
      matches.length === 0
        ? 'No diseases matched that search.'
        : `Found ${matches.length} ${matches.length === 1 ? 'disease' : 'diseases'}.`,
  }
}

/** Lightweight suggestions: names and slugs only, capped at a handful. */
export async function getDiseaseSuggestions(
  text: string,
): Promise<ServiceResult<Array<{ name: string; slug: string }>>> {
  const suggestions = await withMock(() => suggestDiseases(store.diseases, text))
  return { success: true, data: suggestions, message: '' }
}

/** One disease with its remedy, or a clear not-found result. */
export async function getDisease(slug: string): Promise<ServiceResult<Disease>> {
  const disease = await withMock(() =>
    store.diseases.find((entry) => entry.slug === slug),
  )

  if (!disease) {
    return { success: false, message: 'We could not find that disease.' }
  }

  return { success: true, data: disease, message: '' }
}

/**
 * The short list for the home page.
 *
 * The rule that decides the list lives in `src/utilities/featured.ts`, and
 * the Project Plan section 9.3 question it answers is recorded there.
 *
 * [BACKEND] The backend returns the same list from `GET /api/diseases/featured`
 * and must keep the flag on the disease record.
 */
export async function getFeaturedDiseases(
  limit: number = SETTINGS.featuredLimit,
): Promise<ServiceResult<Disease[]>> {
  const featured = await withMock(() => pickFeaturedDiseases(store.diseases, limit))

  return { success: true, data: featured, message: '' }
}
