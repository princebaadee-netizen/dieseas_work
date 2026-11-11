import { SETTINGS } from './config'

/**
 * The transport used while the frontend runs on sample data.
 *
 * [BACKEND] When the API is live this file is replaced by a `fetch` based
 * transport that talks to `SETTINGS.apiBaseUrl` and returns exactly the same
 * shapes. No page changes, because no page calls this file directly.
 */

/** Waits a short time so that loading states are visible and testable. */
export function delay(ms: number = SETTINGS.mockLatencyMs): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Runs a sample-data action behind the artificial wait.
 * A thrown error becomes a failed result with the same shape as a network error.
 */
export async function withMock<T>(action: () => T): Promise<T> {
  await delay()
  try {
    return action()
  } catch (error) {
    throw error instanceof Error ? error : new Error('Something went wrong')
  }
}
