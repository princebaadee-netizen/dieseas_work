import { createContext } from 'react'
import type { AdminSession, ServiceResult } from '@/types'

export interface AdminAuthValue {
  session: AdminSession | null
  isSignedIn: boolean
  signIn: (email: string, password: string) => Promise<ServiceResult<AdminSession>>
  signOut: () => Promise<void>
}

/**
 * The admin session state.
 *
 * [FRONTEND] This is a placeholder. [BACKEND] The server decides who is
 * allowed in, and the real session replaces this.
 */
export const AdminAuthContext = createContext<AdminAuthValue | null>(null)
