/**
 * Turns a name into a web-friendly address.
 *
 * Slugs are lowercase, hyphen-separated and unique (Project Plan section 4.1).
 * The backend generates its own slugs the same way, so this helper exists for
 * the admin slug preview.
 */
export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
