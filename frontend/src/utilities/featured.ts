import type { Disease } from '@/types'

/**
 * Which diseases appear in the home page list.
 *
 * The Project Plan left this open in section 9.3 and offered two answers:
 * "a flag or most recently updated". We chose the flag, because the home page
 * section is headed "Popular diseases" and a list ordered by edit date is not
 * a popular list: correcting a typo would move a condition to the front of
 * the site.
 *
 * With a flag an administrator decides what deserves the space, which also
 * lets the site respond to a health alert or a seasonal risk.
 *
 * The rule:
 * - Diseases an administrator flagged are shown, in name order, so the list
 *   does not shuffle every time something is edited.
 * - When nothing has been flagged the most recently updated diseases are used
 *   instead, so a fresh install still shows a full home page.
 *
 * This is a pure function so the rule can be tested without touching the
 * sample data.
 */
export function pickFeaturedDiseases(diseases: Disease[], limit: number): Disease[] {
  const flagged = diseases
    .filter((disease) => disease.featured)
    .sort((a, b) => a.name.localeCompare(b.name))

  if (flagged.length > 0) return flagged.slice(0, limit)

  return [...diseases]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit)
}
