/**
 * The setup for every test.
 *
 * It adds the Testing Library matchers, so a test can say what it expects
 * in the words a person would use, and it stops the sample data waiting, so
 * the tests do not spend their time on a deliberate delay.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { SETTINGS } from '@/services/config'
import { createStore, store } from '@/data/store'
import { adminLogout } from '@/services/adminService'

/**
 * jsdom does not have the browser features the app uses for its moving
 * parts. These stand-ins do nothing, which is enough: the tests are about
 * what the reader sees, not about scrolling.
 */
if (!('IntersectionObserver' in globalThis)) {
  class NoIntersectionObserver implements IntersectionObserver {
    readonly root = null
    readonly rootMargin = ''
    readonly scrollMargin = ''
    readonly thresholds: readonly number[] = []
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }
  globalThis.IntersectionObserver =
    NoIntersectionObserver as unknown as typeof IntersectionObserver
}

if (!('ResizeObserver' in globalThis)) {
  class NoResizeObserver {
    disconnect() {}
    observe() {}
    unobserve() {}
  }
  globalThis.ResizeObserver = NoResizeObserver as unknown as typeof ResizeObserver
}

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

/**
 * The sample data waits on purpose, so that the loading states can be seen
 * and tested. In a test that wait is just time, so it is set to nothing and
 * the tests that care about waiting ask for it themselves.
 */
const originalLatency = SETTINGS.mockLatencyMs

beforeEach(async () => {
  // The settings object is frozen, so the delay is changed on the module
  // that reads it, through the environment the transport uses.
  vi.spyOn(SETTINGS, 'mockLatencyMs', 'get').mockReturnValue(0)

  // Every test starts with the same sample data and no session, so one
  // test cannot change what another one sees.
  const fresh = createStore()
  store.diseases = fresh.diseases
  store.categories = fresh.categories
  await adminLogout()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

/** Puts the sample data back the way it was, for the tests that need it. */
export function useSlowData(milliseconds = originalLatency) {
  vi.spyOn(SETTINGS, 'mockLatencyMs', 'get').mockReturnValue(milliseconds)
}
