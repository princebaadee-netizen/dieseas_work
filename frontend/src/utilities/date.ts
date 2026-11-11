/**
 * Date helpers.
 *
 * All dates in the data structure use one consistent ISO 8601 format
 * (`YYYY-MM-DD`). These helpers only format for display.
 */

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** Parses an ISO date. Returns `null` for anything unparseable. */
export function parseDate(value: string): Date | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Formats an ISO date as `21 October 2026`. */
export function formatDate(value: string): string {
  const date = parseDate(value)
  if (!date) return 'Unknown date'
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

/** Formats an ISO date as `21 Oct 2026`, for tight spaces such as tables. */
export function formatDateShort(value: string): string {
  const date = parseDate(value)
  if (!date) return 'Unknown'
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`
}

/** Whole months between an ISO date and today. */
export function monthsSince(value: string, now: Date = new Date()): number {
  const date = parseDate(value)
  if (!date) return 0
  const months =
    (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth())
  return now.getDate() < date.getDate() ? months - 1 : months
}

/**
 * A review older than a year is flagged so old content gets rechecked.
 * The dashboard shows review age; the remedy page may warn about it.
 */
export function isReviewOutdated(value: string, now: Date = new Date()): boolean {
  return monthsSince(value, now) > 12
}

/** A short human review age, for example `3 months ago`. */
export function reviewAgeLabel(value: string, now: Date = new Date()): string {
  const months = monthsSince(value, now)
  if (months <= 0) return 'reviewed this month'
  if (months === 1) return '1 month ago'
  if (months < 12) return `${months} months ago`
  const years = Math.floor(months / 12)
  const remainder = months % 12
  if (remainder === 0) return `${years} ${years === 1 ? 'year' : 'years'} ago`
  return `${years} ${years === 1 ? 'year' : 'years'}, ${remainder} months ago`
}

/** Today's date as `YYYY-MM-DD`, used when creating sample records. */
export function todayIso(now: Date = new Date()): string {
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
