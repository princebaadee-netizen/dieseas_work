/**
 * The helpers the tests use to open a page.
 *
 * The tests open the real routes, through the real router, with the real
 * services and the real sample data. Nothing is faked, so a passing test
 * means the app really behaves that way.
 */
import { render, type RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import type { ReactNode } from 'react'
import { routes } from '@/routes/router'
import { AdminAuthProvider } from '@/components/admin/AdminAuthProvider'
import { adminLogin } from '@/services/adminService'
import { SETTINGS } from '@/services/config'
import type { ServiceResult } from '@/types'

/**
 * Checks that a service call worked, and gives the data back.
 *
 * The service results are a union, so the data only exists on the success
 * branch. This keeps the tests readable without repeating the check.
 */
export function expectOk<T>(result: ServiceResult<T>): T {
  if (!result.success) {
    throw new Error(`The call failed: ${result.message}`)
  }
  return result.data
}

/** Checks that a service call failed, and gives the message back. */
export function expectFailed<T>(result: ServiceResult<T>): { message: string; fields?: Record<string, string> } {
  if (result.success) {
    throw new Error('The call was expected to fail, but it worked.')
  }
  return { message: result.message, fields: result.fields }
}

/** A router that can be driven from a test. */
export type TestRouter = ReturnType<typeof createMemoryRouter>

/**
 * Renders a page.
 *
 * `path` is the address to open. The admin guard is part of the real routes,
 * so an admin page needs a signed-in session, which `signIn` gives it.
 */
export function renderApp(path: string): RenderResult & {
  router: TestRouter
  user: ReturnType<typeof userEvent.setup>
} {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()

  const result = render(
    <AdminAuthProvider>
      <RouterProvider router={router} />
    </AdminAuthProvider>,
  )

  return Object.assign(result, { router, user })
}

/** Renders a single piece of the app, without the router. */
export function renderPiece(children: ReactNode): RenderResult {
  return render(<AdminAuthProvider>{children}</AdminAuthProvider>)
}

/** Signs in with the placeholder administrator. */
export async function signIn(): Promise<void> {
  const result = await adminLogin(
    SETTINGS.adminPlaceholder.email,
    SETTINGS.adminPlaceholder.password,
  )
  if (!result.success) {
    throw new Error('The placeholder sign-in did not work.')
  }
}

/** Signs out again, so one test cannot leak into the next. */
export async function signOut(): Promise<void> {
  const { adminLogout } = await import('@/services/adminService')
  await adminLogout()
}
