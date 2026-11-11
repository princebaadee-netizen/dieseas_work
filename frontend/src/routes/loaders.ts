import type { LoaderFunctionArgs } from 'react-router-dom'
import {
  adminGetDisease,
  adminListCategories,
  adminListDiseases,
  getAdminStats,
} from '@/services/adminService'

/**
 * The data the admin pages need, loaded before the page renders
 * (Project Plan section 6).
 *
 * Loading here rather than inside the pages keeps the pages free of
 * "loading" and "error" plumbing, and means a slow or broken request never
 * shows a half-built screen.
 */

/** The dashboard needs the totals and the disease list. */
export async function adminDashboardLoader() {
  const [statsResult, diseasesResult] = await Promise.all([
    getAdminStats(),
    adminListDiseases(),
  ])

  if (!statsResult.success) {
    throw new Error(statsResult.message)
  }

  return {
    stats: statsResult.data,
    diseases: diseasesResult.success ? diseasesResult.data : [],
  }
}

/** The disease list. */
export async function adminDiseasesLoader() {
  const result = await adminListDiseases()
  if (!result.success) {
    throw new Error(result.message)
  }
  return result.data
}

/** The remedy list works from the same disease records. */
export async function adminRemedyListLoader() {
  const result = await adminListDiseases()
  if (!result.success) {
    throw new Error(result.message)
  }
  return result.data
}

/** The category page needs the categories and the diseases inside them. */
export async function adminCategoriesLoader() {
  const [categoriesResult, diseasesResult] = await Promise.all([
    adminListCategories(),
    adminListDiseases(),
  ])

  if (!categoriesResult.success) {
    throw new Error(categoriesResult.message)
  }

  return {
    categories: categoriesResult.data,
    diseases: diseasesResult.success ? diseasesResult.data : [],
  }
}

/** The disease form needs the categories, and the disease when editing. */
export async function adminDiseaseFormLoader({ params }: LoaderFunctionArgs) {
  const categoriesResult = await adminListCategories()
  if (!categoriesResult.success) {
    throw new Error(categoriesResult.message)
  }

  if (!params.id) {
    return { categories: categoriesResult.data, disease: null }
  }

  const diseaseResult = await adminGetDisease(Number(params.id))
  if (!diseaseResult.success) {
    throw new Error(diseaseResult.message)
  }

  return { categories: categoriesResult.data, disease: diseaseResult.data }
}

/** The remedy form needs the disease list to pick from. */
export async function adminRemedyFormLoader() {
  const result = await adminListDiseases()
  if (!result.success) {
    throw new Error(result.message)
  }
  return result.data
}
