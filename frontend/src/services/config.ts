/**
 * The one settings place for the frontend (Project Plan section 4.2).
 *
 * All backend addresses live here. When the backend arrives, set
 * `useMockData` to false and point `apiBaseUrl` at the live address; nothing
 * else in the frontend changes.
 */

/**
 * The Vite environment. Read defensively so the services area can also run
 * outside the browser, for example in a script that checks the contract.
 */
const env: Partial<ImportMetaEnv> =
  typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}

export const SETTINGS = {
  /** Where the real backend will live. One address for local and one for live. */
  apiBaseUrl: env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',

  /**
   * [FRONTEND] While true, the services area reads the sample data and
   * changes it in memory only. [BACKEND] Set this to false when the API is live.
   */
  useMockData: true,

  /**
   * A short artificial wait so that loading states are visible and can be
   * tested. Set to 0 once the real backend is in use.
   *
   * This one is a getter, so a test can change the wait without changing
   * the module. Nothing else in the app changes it.
   */
  get mockLatencyMs() {
    return 350
  },

  /**
   * [FRONTEND] The admin login is a visual placeholder only. [BACKEND] The
   * real server decides who is allowed in.
   */
  adminPlaceholder: {
    email: 'admin@diseasewise.test',
    password: 'diseasewise',
    name: 'Site Administrator',
  },

  /** How many diseases the home page shows as popular. */
  featuredLimit: 4,
} as const
