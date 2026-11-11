import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

/**
 * The error page for the admin area.
 *
 * A loader that fails lands here, so the administrator sees a plain message
 * and a way to try again rather than a blank screen.
 */
export function AdminErrorPage() {
  const error = useRouteError()

  const message = isRouteErrorResponse(error)
    ? error.data?.message ?? error.statusText
    : error instanceof Error
      ? error.message
      : 'Something went wrong while loading this page.'

  return (
    <div className="space-y-4">
      <ErrorMessage message={message} />
      <Link to="/admin" className="inline-block text-sm text-primary hover:underline">
        Back to the dashboard
      </Link>
    </div>
  )
}
