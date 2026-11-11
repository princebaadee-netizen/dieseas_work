import { store } from '@/data'
import type { CategoryWithCount, CategoryWithDiseases, ServiceResult } from '@/types'
import { withMock } from './transport'

/**
 * The public category actions (Project Plan section 4.2).
 *
 * Counts are always calculated from the data, never typed by hand
 * (Project Plan milestone 5).
 */

/** All categories with the number of diseases inside each one. */
export async function getCategories(): Promise<ServiceResult<CategoryWithCount[]>> {
  const categories = await withMock(() =>
    store.categories.map((category) => ({
      ...category,
      diseaseCount: store.diseases.filter(
        (disease) => disease.category.slug === category.slug,
      ).length,
    })),
  )

  return { success: true, data: categories, message: '' }
}

/** One category together with its diseases, alphabetical by name. */
export async function getCategory(slug: string): Promise<ServiceResult<CategoryWithDiseases>> {
  const found = await withMock(() => {
    const category = store.categories.find((entry) => entry.slug === slug)
    if (!category) return null

    const diseases = store.diseases
      .filter((disease) => disease.category.slug === slug)
      .sort((a, b) => a.name.localeCompare(b.name))

    return { category, diseases }
  })

  if (!found) {
    return { success: false, message: 'We could not find that category.' }
  }

  return { success: true, data: found, message: '' }
}
