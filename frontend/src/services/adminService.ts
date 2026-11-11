import { nextId, store } from '@/data'
import type { AdminSession, AdminStats, Category, Disease, ServiceResult } from '@/types'
import { slugify } from '@/utilities/slug'
import { todayIso } from '@/utilities/date'
import { SETTINGS } from './config'
import { withMock } from './transport'
import {
  hasErrors,
  validateCategory,
  validateDisease,
  validateRemedy,
  type CategoryInput,
  type DiseaseInput,
  type RemedyInput,
} from './validation'

/**
 * The admin actions (Project Plan section 4.2).
 *
 * [FRONTEND] These run against the sample data and change it in memory only.
 * [BACKEND] Every one of these later becomes a protected endpoint, and the
 * server repeats all the validation.
 */

let session: AdminSession | null = null

/** The current placeholder admin session, or `null` when signed out. */
export function getAdminSession(): AdminSession | null {
  return session
}

export function isAdminSignedIn(): boolean {
  return session !== null
}

/* -------------------------------------------------------------------------- */
/* Log in and out                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Logs in the administrator.
 *
 * [FRONTEND] This is a visual placeholder that checks the sample credentials.
 * [BACKEND] The real endpoint compares the typed password with the stored
 * hash and always returns the same generic message when it fails, so the
 * page cannot tell whether an email exists.
 */
export async function adminLogin(
  email: string,
  password: string,
): Promise<ServiceResult<AdminSession>> {
  const trimmedEmail = email.trim()
  const fields: Record<string, string> = {}
  if (trimmedEmail === '') fields.email = 'Enter your email address'
  if (password === '') fields.password = 'Enter your password'
  if (hasErrors(fields)) {
    return { success: false, message: 'Please fill in both fields.', fields }
  }

  const placeholder = SETTINGS.adminPlaceholder
  const matches =
    trimmedEmail.toLowerCase() === placeholder.email.toLowerCase() &&
    password === placeholder.password

  if (!matches) {
    return {
      success: false,
      message: 'Those details did not match our records. Please try again.',
    }
  }

  session = { name: placeholder.name, email: placeholder.email }
  return { success: true, data: session, message: 'Signed in.' }
}

/** Signs the administrator out and clears the placeholder session. */
export async function adminLogout(): Promise<ServiceResult<null>> {
  session = null
  await withMock(() => null)
  return { success: true, data: null, message: 'Signed out.' }
}

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                   */
/* -------------------------------------------------------------------------- */

/** Totals and the most recently updated items. */
export async function getAdminStats(): Promise<ServiceResult<AdminStats>> {
  const stats = await withMock(() => ({
    totalDiseases: store.diseases.length,
    totalCategories: store.categories.length,
    totalRemedies: store.diseases.filter((disease) => disease.remedy !== null).length,
    missingRemedies: store.diseases.filter((disease) => disease.remedy === null).length,
    recentlyUpdated: [...store.diseases]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 5),
  }))

  return { success: true, data: stats, message: '' }
}

/* -------------------------------------------------------------------------- */
/* Diseases                                                                    */
/* -------------------------------------------------------------------------- */

/** Every disease, for the admin list. */
export async function adminListDiseases(): Promise<ServiceResult<Disease[]>> {
  const diseases = await withMock(() =>
    [...store.diseases].sort((a, b) => a.name.localeCompare(b.name)),
  )
  return { success: true, data: diseases, message: '' }
}

/** One disease by id, for the edit form. */
export async function adminGetDisease(id: number): Promise<ServiceResult<Disease>> {
  const disease = await withMock(() => store.diseases.find((entry) => entry.id === id))
  if (!disease) {
    return { success: false, message: 'That disease could not be found.' }
  }
  return { success: true, data: disease, message: '' }
}

/** Creates a disease. The whole record is saved as one piece. */
export async function adminCreateDisease(
  input: DiseaseInput,
): Promise<ServiceResult<Disease>> {
  const errors = validateDisease(input)
  if (hasErrors(errors)) {
    return { success: false, message: 'Please fix the highlighted fields.', fields: errors }
  }

  const slug = slugify(input.name)
  if (store.diseases.some((disease) => disease.slug === slug)) {
    return {
      success: false,
      message: 'Please fix the highlighted fields.',
      fields: { name: 'A disease with this name already exists' },
    }
  }

  const category = store.categories.find((entry) => entry.slug === input.categorySlug)
  if (!category) {
    return {
      success: false,
      message: 'Please fix the highlighted fields.',
      fields: { categorySlug: 'Choose a category' },
    }
  }

  const today = todayIso()
  const disease: Disease = {
    id: nextId(store.diseases),
    category: { name: category.name, slug: category.slug },
    name: input.name.trim(),
    slug,
    shortSummary: input.shortSummary.trim(),
    description: input.description.trim(),
    symptoms: input.symptoms.map((item) => item.trim()).filter(Boolean),
    causes: input.causes.map((item) => item.trim()).filter(Boolean),
    riskFactors: input.riskFactors.map((item) => item.trim()).filter(Boolean),
    prevention: input.prevention.map((item) => item.trim()).filter(Boolean),
    remedy: null,
    featured: input.featured === true,
    createdAt: today,
    updatedAt: today,
  }

  await withMock(() => null)
  store.diseases.push(disease)

  return { success: true, data: disease, message: `Added ${disease.name}.` }
}

/** Updates a disease. The lists are replaced as a whole. */
export async function adminUpdateDisease(
  id: number,
  input: DiseaseInput,
): Promise<ServiceResult<Disease>> {
  const existing = store.diseases.find((entry) => entry.id === id)
  if (!existing) {
    return { success: false, message: 'That disease could not be found.' }
  }

  const errors = validateDisease(input)
  if (hasErrors(errors)) {
    return { success: false, message: 'Please fix the highlighted fields.', fields: errors }
  }

  const slug = slugify(input.name)
  if (store.diseases.some((disease) => disease.id !== id && disease.slug === slug)) {
    return {
      success: false,
      message: 'Please fix the highlighted fields.',
      fields: { name: 'A disease with this name already exists' },
    }
  }

  const category = store.categories.find((entry) => entry.slug === input.categorySlug)
  if (!category) {
    return {
      success: false,
      message: 'Please fix the highlighted fields.',
      fields: { categorySlug: 'Choose a category' },
    }
  }

  const updated: Disease = {
    ...existing,
    category: { name: category.name, slug: category.slug },
    name: input.name.trim(),
    slug,
    shortSummary: input.shortSummary.trim(),
    description: input.description.trim(),
    symptoms: input.symptoms.map((item) => item.trim()).filter(Boolean),
    causes: input.causes.map((item) => item.trim()).filter(Boolean),
    riskFactors: input.riskFactors.map((item) => item.trim()).filter(Boolean),
    prevention: input.prevention.map((item) => item.trim()).filter(Boolean),
    featured: input.featured === true,
    updatedAt: todayIso(),
  }

  await withMock(() => null)
  Object.assign(existing, updated)

  return { success: true, data: existing, message: `Saved ${existing.name}.` }
}

/** Deletes a disease together with its remedy. */
export async function adminDeleteDisease(id: number): Promise<ServiceResult<null>> {
  const index = store.diseases.findIndex((entry) => entry.id === id)
  if (index === -1) {
    return { success: false, message: 'That disease could not be found.' }
  }

  const name = store.diseases[index].name
  await withMock(() => null)
  store.diseases.splice(index, 1)

  return { success: true, data: null, message: `Deleted ${name}.` }
}

/* -------------------------------------------------------------------------- */
/* Remedies                                                                    */
/* -------------------------------------------------------------------------- */

/** Every disease that has a remedy, plus the ones still missing one. */
export async function adminListRemedies(): Promise<ServiceResult<Disease[]>> {
  const diseases = await withMock(() =>
    [...store.diseases].sort((a, b) => a.name.localeCompare(b.name)),
  )
  return { success: true, data: diseases, message: '' }
}

/** Adds the remedy for a disease. Only one remedy per disease is allowed. */
export async function adminCreateRemedy(
  diseaseId: number,
  input: RemedyInput,
): Promise<ServiceResult<Disease>> {
  const disease = store.diseases.find((entry) => entry.id === diseaseId)
  if (!disease) {
    return { success: false, message: 'That disease could not be found.' }
  }
  if (disease.remedy) {
    return {
      success: false,
      message: 'This disease already has a remedy. Edit the existing one instead.',
    }
  }

  const errors = validateRemedy(input)
  if (hasErrors(errors)) {
    return { success: false, message: 'Please fix the highlighted fields.', fields: errors }
  }

  await withMock(() => null)
  disease.remedy = {
    id: nextId(store.diseases.filter((entry) => entry.remedy).map((entry) => entry.remedy!)),
    overview: input.overview.trim(),
    careOptions: input.careOptions.map((item) => item.trim()).filter(Boolean),
    precautions: input.precautions.map((item) => item.trim()).filter(Boolean),
    urgentSigns: input.urgentSigns.map((item) => item.trim()).filter(Boolean),
    source: input.source.trim(),
    lastReviewed: input.lastReviewed,
  }
  disease.updatedAt = todayIso()

  return { success: true, data: disease, message: `Added the remedy for ${disease.name}.` }
}

/** Updates the remedy for a disease. */
export async function adminUpdateRemedy(
  diseaseId: number,
  input: RemedyInput,
): Promise<ServiceResult<Disease>> {
  const disease = store.diseases.find((entry) => entry.id === diseaseId)
  if (!disease) {
    return { success: false, message: 'That disease could not be found.' }
  }
  if (!disease.remedy) {
    return { success: false, message: 'This disease has no remedy yet.' }
  }

  const errors = validateRemedy(input)
  if (hasErrors(errors)) {
    return { success: false, message: 'Please fix the highlighted fields.', fields: errors }
  }

  await withMock(() => null)
  disease.remedy = {
    ...disease.remedy,
    overview: input.overview.trim(),
    careOptions: input.careOptions.map((item) => item.trim()).filter(Boolean),
    precautions: input.precautions.map((item) => item.trim()).filter(Boolean),
    urgentSigns: input.urgentSigns.map((item) => item.trim()).filter(Boolean),
    source: input.source.trim(),
    lastReviewed: input.lastReviewed,
  }
  disease.updatedAt = todayIso()

  return { success: true, data: disease, message: `Saved the remedy for ${disease.name}.` }
}

/** Removes the remedy from a disease. */
export async function adminDeleteRemedy(diseaseId: number): Promise<ServiceResult<Disease>> {
  const disease = store.diseases.find((entry) => entry.id === diseaseId)
  if (!disease) {
    return { success: false, message: 'That disease could not be found.' }
  }
  if (!disease.remedy) {
    return { success: false, message: 'This disease has no remedy yet.' }
  }

  await withMock(() => null)
  disease.remedy = null
  disease.updatedAt = todayIso()

  return { success: true, data: disease, message: `Removed the remedy for ${disease.name}.` }
}

/* -------------------------------------------------------------------------- */
/* Categories                                                                  */
/* -------------------------------------------------------------------------- */

/** Every category, for the admin list. */
export async function adminListCategories(): Promise<ServiceResult<Category[]>> {
  const categories = await withMock(() =>
    [...store.categories].sort((a, b) => a.name.localeCompare(b.name)),
  )
  return { success: true, data: categories, message: '' }
}

/** Adds a category. The slug is generated from the name. */
export async function adminCreateCategory(
  input: CategoryInput,
): Promise<ServiceResult<Category>> {
  const errors = validateCategory(input)
  if (hasErrors(errors)) {
    return { success: false, message: 'Please fix the highlighted fields.', fields: errors }
  }

  const slug = slugify(input.name)
  if (store.categories.some((category) => category.slug === slug)) {
    return {
      success: false,
      message: 'Please fix the highlighted fields.',
      fields: { name: 'A category with this name already exists' },
    }
  }

  const category: Category = {
    id: nextId(store.categories),
    name: input.name.trim(),
    slug,
    description: input.description.trim(),
  }

  await withMock(() => null)
  store.categories.push(category)

  return { success: true, data: category, message: `Added ${category.name}.` }
}

/**
 * Renames a category. The slug stays fixed after creation, so web addresses
 * that point at it keep working.
 */
export async function adminUpdateCategory(
  id: number,
  input: CategoryInput,
): Promise<ServiceResult<Category>> {
  const existing = store.categories.find((entry) => entry.id === id)
  if (!existing) {
    return { success: false, message: 'That category could not be found.' }
  }

  const errors = validateCategory(input)
  if (hasErrors(errors)) {
    return { success: false, message: 'Please fix the highlighted fields.', fields: errors }
  }

  const slug = slugify(input.name)
  if (store.categories.some((category) => category.id !== id && category.slug === slug)) {
    return {
      success: false,
      message: 'Please fix the highlighted fields.',
      fields: { name: 'A category with this name already exists' },
    }
  }

  await withMock(() => null)
  existing.name = input.name.trim()
  existing.description = input.description.trim()

  return { success: true, data: existing, message: `Saved ${existing.name}.` }
}

/** Deletes a category. This is blocked while diseases still use it. */
export async function adminDeleteCategory(id: number): Promise<ServiceResult<Category>> {
  const index = store.categories.findIndex((entry) => entry.id === id)
  if (index === -1) {
    return { success: false, message: 'That category could not be found.' }
  }

  const category = store.categories[index]
  const usedBy = store.diseases.filter(
    (disease) => disease.category.slug === category.slug,
  )

  if (usedBy.length > 0) {
    return {
      success: false,
      message: `This category still holds ${usedBy.length} ${
        usedBy.length === 1 ? 'disease' : 'diseases'
      }. Move them to another category before deleting it.`,
    }
  }

  await withMock(() => null)
  store.categories.splice(index, 1)

  return { success: true, data: category, message: `Deleted ${category.name}.` }
}
