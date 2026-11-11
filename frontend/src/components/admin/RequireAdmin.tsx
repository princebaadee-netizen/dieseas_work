import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from './useAdminAuth'

interface RequireAdminProps {
  children: ReactNode
}

/**
 * A placeholder auth guard (Project Plan section 2.2).
 *
 * Until the backend exists, this redirects admin pages to the login screen
 * when not logged in. The real protection comes from the [BACKEND] later.
 */
export function RequireAdmin({ children }: RequireAdminProps) {
  const location = useLocation()
  const { isSignedIn } = useAdminAuth()

  if (!isSignedIn) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
