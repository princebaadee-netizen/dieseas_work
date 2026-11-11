import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { logoIcon } from '@/assets'
import { Sidebar } from '@/components/admin/Sidebar'
import { SkipLink } from '@/components/shared/SkipLink'
import { useAdminAuth } from '@/components/admin/useAdminAuth'

/**
 * The admin layout frame (Project Plan section 2.2).
 *
 * Left sidebar (Dashboard, Diseases, Remedies, Categories, Logout) and a
 * top bar with the admin name. On phones the sidebar becomes a slide-out
 * menu and tables scroll sideways.
 */
export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { session, signOut } = useAdminAuth()

  async function handleLogout() {
    setOpen(false)
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-surface">
      <SkipLink label="Skip to main content" />
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 flex-col border-r border-slate-800 bg-slate-900 lg:flex">
          <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
            <img src={logoIcon} alt="" aria-hidden="true" className="size-9" />
            <div>
              <p className="font-display font-semibold text-white">DiseaseWise</p>
              <p className="text-xs text-slate-400">Admin area</p>
            </div>
          </div>

          <Sidebar onLogout={handleLogout} />

          <div className="border-t border-slate-800 px-4 py-4">
            <div className="px-2">
              <p className="text-sm font-medium text-white">{session?.name ?? 'Administrator'}</p>
              <p className="text-xs text-slate-400">{session?.email ?? ''}</p>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar */}
        {open ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close admin menu"
              className="absolute inset-0 bg-slate-900/60"
              onClick={() => setOpen(false)}
            />
            <aside className="relative flex h-full w-80 flex-col bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                <div className="flex items-center gap-3">
                  <img src={logoIcon} alt="" aria-hidden="true" className="size-9" />
                  <p className="font-display font-semibold text-white">DiseaseWise Admin</p>
                </div>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-300 hover:bg-white/10"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                >
                  <X aria-hidden="true" className="size-5" />
                </button>
              </div>
              <Sidebar onNavigate={() => setOpen(false)} onLogout={handleLogout} />
            </aside>
          </div>
        ) : null}

        {/* The content column. min-w-0 lets it shrink below the width of
            the tables inside it, so a wide table scrolls inside its own
            card instead of pushing the page sideways. */}
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-ink transition-colors hover:bg-slate-100 lg:hidden"
              aria-label="Open admin menu"
              onClick={() => setOpen(true)}
            >
              <Menu aria-hidden="true" className="size-5" />
            </button>
            <div className="flex flex-1 items-center justify-between">
              <div>
                <p className="font-display font-medium text-ink">Administration</p>
                <p className="text-xs text-muted">
                  {session ? 'Managing diseases and remedies' : 'Sign in to continue'}
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-ink">{session?.name ?? ''}</p>
                <p className="text-xs text-muted">{session?.email ?? ''}</p>
              </div>
            </div>
          </header>

          <main
            id="main-content"
            tabIndex={-1}
            className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
