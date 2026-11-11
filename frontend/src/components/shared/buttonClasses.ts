/**
 * The shared button styling.
 *
 * Kept in its own file so the fast-refresh rule stays happy when the same
 * classes are applied to links that behave like buttons.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'urgent'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark border border-transparent',
  secondary: 'bg-primary-light text-primary-dark hover:bg-primary-light-alt border border-transparent',
  outline: 'bg-white text-primary border border-primary hover:bg-primary-light',
  ghost: 'bg-transparent text-ink hover:bg-slate-100 border border-transparent',
  urgent: 'bg-urgent text-white hover:bg-red-700 border border-transparent',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-base px-4 py-2.5 gap-2',
  lg: 'text-base px-6 py-3 gap-2.5',
}

/** The button styling, also used by links that behave like buttons. */
export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className = '',
): string {
  return [
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')
}
