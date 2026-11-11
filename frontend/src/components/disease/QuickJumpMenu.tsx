import { useEffect, useRef, useState } from 'react'

interface JumpItem {
  id: string
  label: string
}

interface QuickJumpMenuProps {
  items: JumpItem[]
}

/**
 * Quick-jump menu, sticky on large screens (Project Plan section 2.2).
 */
export function QuickJumpMenu({ items }: QuickJumpMenuProps) {
  const [active, setActive] = useState(items[0]?.id ?? '')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    observerRef.current?.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActive(visible[0].target.id)
        }
      },
      { rootMargin: '-120px 0px -60% 0px', threshold: [0.1, 0.5] },
    )

    elements.forEach((el) => observerRef.current?.observe(el))
    return () => observerRef.current?.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav aria-label="Jump to section" className="rounded-card border border-slate-200 bg-white p-4 shadow-card lg:sticky lg:top-6">
      <p className="mb-2 text-sm font-medium text-ink">On this page</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={[
                'block rounded-lg px-2 py-1.5 text-sm transition-colors',
                active === item.id
                  ? 'bg-primary-light text-primary-dark font-medium'
                  : 'text-muted hover:bg-slate-100 hover:text-ink',
              ].join(' ')}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
