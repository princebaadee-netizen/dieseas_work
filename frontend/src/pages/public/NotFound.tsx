import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { buttonClasses } from '@/components/shared/buttonClasses'
import { usePageTitle } from '@/utilities/usePageTitle'

export function NotFound() {
  usePageTitle('Page not found')
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="max-w-md">
        <p className="font-display text-6xl font-semibold text-primary">404</p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-2 text-muted">
          That address does not exist. Try searching for a disease or go back to the home page.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className={buttonClasses('primary', 'md')}>
            Go home
          </Link>
          <Link to="/search?q=malaria" className={buttonClasses('outline', 'md')}>
            <Search aria-hidden="true" className="size-4" />
            Search diseases
          </Link>
        </div>
      </div>
    </section>
  )
}
