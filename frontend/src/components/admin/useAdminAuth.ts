import { useContext } from 'react'
import { AdminAuthContext, type AdminAuthValue } from './adminAuthContext'

/** Reads the admin session state. Must be used inside `AdminAuthProvider`. */
export function useAdminAuth(): AdminAuthValue {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  }
  return context
}
