import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react'
import { logoIcon } from '@/assets'
import { usePageTitle } from '@/utilities/usePageTitle'
import { useAdminAuth } from '@/components/admin/useAdminAuth'
import { inputClass } from '@/components/admin/FormField'
import { SETTINGS } from '@/services/config'

interface LocationState {
  from?: string
}

/**
 * The admin sign-in page (Project Plan section 6 stage A).
 *
 * The failure message is the same every time, so the page cannot be used to
 * find out which email addresses exist.
 */
export function AdminLogin() {
  const { signIn, isSignedIn } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  usePageTitle('Admin sign in')

  const from = (location.state as LocationState | null)?.from ?? '/admin'

  if (isSignedIn) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)

    const result = await signIn(email, password)
    setBusy(false)

    if (result.success) {
      navigate(from, { replace: true })
      return
    }

    setError(result.message)
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-3">
          <img src={logoIcon} alt="" aria-hidden="true" className="size-9" />
          <span className="font-display font-semibold text-ink">DiseaseWise</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card sm:p-8">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary-light p-2 text-primary-dark">
                <ShieldCheck aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h1 className="font-display text-xl font-semibold text-ink">Admin sign in</h1>
                <p className="text-sm text-muted">For site administrators only</p>
              </div>
            </div>

            {error ? (
              <p
                role="alert"
                className="mt-5 rounded-lg border border-urgent/40 bg-urgent-soft/50 px-4 py-3 text-sm text-urgent"
              >
                {error}
              </p>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="text-sm font-medium text-ink">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={busy}
                  required
                  className={`mt-1.5 ${inputClass}`}
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium text-ink">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={busy}
                    required
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted transition-colors hover:bg-slate-100 hover:text-ink"
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" className="size-4" />
                    ) : (
                      <Eye aria-hidden="true" className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
              >
                <LogIn aria-hidden="true" className="size-4" />
                {busy ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>

          <div className="mt-6 rounded-card border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-xs text-muted">
            <p className="font-medium text-ink">Demo access</p>
            <p className="mt-1">
              This is a frontend placeholder with no real server behind it. Use{' '}
              <span className="font-mono">{SETTINGS.adminPlaceholder.email}</span> with the password{' '}
              <span className="font-mono">{SETTINGS.adminPlaceholder.password}</span>.
            </p>
          </div>

          <p className="mt-6 text-center text-sm">
            <Link to="/" className="text-primary underline-offset-2 hover:underline">
              Back to the public site
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
