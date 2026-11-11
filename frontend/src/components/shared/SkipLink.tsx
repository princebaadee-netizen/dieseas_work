interface SkipLinkProps {
  /** The id of the main region the link jumps to. */
  targetId?: string
  label?: string
}

/**
 * The "skip to main content" link (Project Plan section 2.5, accessibility).
 *
 * It stays out of the way until it is focused with the keyboard, then appears
 * in the corner of the screen so people can jump past the navigation.
 */
export function SkipLink({ targetId = 'main-content', label = 'Skip to main content' }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={[
        'sr-only',
        'focus:not-sr-only',
        'focus:fixed focus:left-4 focus:top-4 focus:z-50',
        'focus:rounded-lg focus:bg-white focus:px-4 focus:py-2',
        'focus:text-sm focus:font-medium focus:text-primary-dark focus:shadow-lifted',
      ].join(' ')}
    >
      {label}
    </a>
  )
}
