import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookHeart, Pill, Shapes, LogOut } from 'lucide-react'

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
    isActive
      ? 'bg-primary-light text-primary-dark font-medium'
      : 'text-slate-200 hover:bg-white/10 hover:text-white',
  ].join(' ')

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/diseases', label: 'Diseases', icon: BookHeart, end: false },
  { to: '/admin/remedies', label: 'Remedies', icon: Pill, end: false },
  { to: '/admin/categories', label: 'Categories', icon: Shapes, end: false },
] as const

interface SidebarProps {
  onNavigate?: () => void
  onLogout: () => void
}

/** The admin sidebar (Project Plan section 2.3). Shared by the desktop and mobile layouts. */
export function Sidebar({ onNavigate, onLogout }: SidebarProps) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4" aria-label="Admin">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={navClass}
          onClick={onNavigate}
        >
          <item.icon aria-hidden="true" className="size-4" />
          {item.label}
        </NavLink>
      ))}

      <div className="mt-auto border-t border-slate-800 pt-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut aria-hidden="true" className="size-4" />
          Log out
        </button>
      </div>
    </nav>
  )
}
