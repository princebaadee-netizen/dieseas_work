import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { adminLogin, adminLogout, getAdminSession } from '@/services/adminService'
import type { AdminSession } from '@/types'
import { AdminAuthContext, type AdminAuthValue } from './adminAuthContext'

/**
 * Holds the placeholder admin session so the guard and the admin frame
 * re-render when the administrator signs in or out.
 */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(getAdminSession())

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await adminLogin(email, password)
    if (result.success) {
      setSession(result.data)
    }
    return result
  }, [])

  const signOut = useCallback(async () => {
    await adminLogout()
    setSession(null)
  }, [])

  const value = useMemo<AdminAuthValue>(
    () => ({ session, isSignedIn: session !== null, signIn, signOut }),
    [session, signIn, signOut],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
