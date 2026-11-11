/**
 * The services area (Project Plan section 4.2).
 *
 * Every data request in the frontend goes through this folder. Pages never
 * read the sample data directly, so that when the backend arrives only this
 * folder changes.
 */
export { SETTINGS } from './config'
export { delay, withMock } from './transport'

export {
  searchDiseases,
  getDiseaseSuggestions,
  getDisease,
  getFeaturedDiseases,
} from './diseaseService'

export { getCategories, getCategory } from './categoryService'

export {
  getAdminSession,
  isAdminSignedIn,
  adminLogin,
  adminLogout,
  getAdminStats,
  adminListDiseases,
  adminGetDisease,
  adminCreateDisease,
  adminUpdateDisease,
  adminDeleteDisease,
  adminListRemedies,
  adminCreateRemedy,
  adminUpdateRemedy,
  adminDeleteRemedy,
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from './adminService'

export {
  validateDisease,
  validateRemedy,
  validateCategory,
  hasErrors,
  containsDosage,
  findDosage,
} from './validation'
export type { DiseaseInput, RemedyInput, CategoryInput } from './validation'
