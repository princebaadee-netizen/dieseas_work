import { NavLink, Link, Outlet } from 'react-router-dom'
import { Heart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { logoFull } from '@/assets'
import { DisclaimerBanner } from '@/components/shared/DisclaimerBanner'
import { SkipLink } from '@/components/shared/SkipLink'
import { DISCLAIMER_TEXT } from '@/components/shared/disclaimerText'

const CURRENT_YEAR = new Date().getFullYear()

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-3 py-2 text-sm transition-colors',
    isActive
      ? 'bg-primary-light text-primary-dark font-medium'
      : 'text-ink hover:bg-slate-100',
  ].join(' ')

/**
 * The public layout frame (Project Plan section 2.2).
 *
 * Navbar: logo left, Home, Categories and About on the right, collapsing
 * menu on phones. Disclaimer banner and footer appear on every public page.
 */
export function PublicLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface">
      <SkipLink />
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg"
            aria-label="DiseaseWise - go to home"
          >
            <img src={logoFull} alt="DiseaseWise" className="h-9 w-auto" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/categories" className={navLinkClass}>
              Categories
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About and disclaimer
            </NavLink>
          </nav>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-ink transition-colors hover:bg-slate-100 md:hidden"
            aria-expanded={open}
            aria-controls="public-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          </button>
        </div>

        {open ? (
          <nav
            id="public-nav"
            className="border-t border-slate-200 bg-white md:hidden"
            aria-label="Primary mobile"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-2 sm:px-6">
              <NavLink to="/" className={navLinkClass} end onClick={() => setOpen(false)}>
                Home
              </NavLink>
              <NavLink to="/categories" className={navLinkClass} onClick={() => setOpen(false)}>
                Categories
              </NavLink>
              <NavLink to="/about" className={navLinkClass} onClick={() => setOpen(false)}>
                About and disclaimer
              </NavLink>
            </div>
          </nav>
        ) : null}
      </header>

      <DisclaimerBanner />

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:px-6 sm:gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="flex items-center gap-2 text-primary-dark">
              <img src={logoFull} alt="DiseaseWise" className="h-8 w-auto" />
            </Link>
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <Heart aria-hidden="true" className="size-4" />
              Clear health information in one place.
            </p>
          </div>
          <p className="text-xs leading-relaxed text-muted">{DISCLAIMER_TEXT}</p>
          <p className="text-xs text-muted">© {CURRENT_YEAR} DiseaseWise</p>
        </div>
      </footer>
    </div>
  )
}
