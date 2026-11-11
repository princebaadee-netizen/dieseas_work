import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { getDiseaseSuggestions } from '@/services'
import { Button } from '@/components/shared/Button'

interface SearchBarProps {
  defaultValue?: string
  placeholder?: string
  autoFocus?: boolean
  showSuggestions?: boolean
  onSubmit?: (query: string) => void
}

interface Suggestion {
  name: string
  slug: string
}

/**
 * The search bar with suggestions (Project Plan sections 2.3 and 4.3).
 *
 * Suggestions appear after 2+ characters, with a brief wait on typing.
 * Keyboard accessible: arrows navigate suggestions, Enter selects/submits.
 * The query goes to /search?q=... so it can be shared and refreshed.
 */
export function SearchBar({
  defaultValue = '',
  placeholder = 'Search for a disease, symptom or condition…',
  autoFocus = false,
  showSuggestions = true,
  onSubmit,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue)
  const [lastDefault, setLastDefault] = useState(defaultValue)

  // Adjust the value when the page supplies a new query (React's documented
  // pattern for state that follows a prop, instead of an effect).
  if (defaultValue !== lastDefault) {
    setLastDefault(defaultValue)
    setValue(defaultValue)
  }

  const [suggestionState, setSuggestionState] = useState<{
    query: string
    items: Suggestion[]
  }>({ query: '', items: [] })
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)

  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const trimmed = value.trim()
  // Suggestions are only shown for the query they were fetched for, so old
  // results never appear under a new query.
  const suggestions =
    suggestionState.query === trimmed ? suggestionState.items : []
  const loading = showSuggestions && trimmed.length >= 2 && suggestionState.query !== trimmed
  const listVisible = open && showSuggestions && trimmed.length >= 2 && suggestions.length > 0

  useEffect(() => {
    if (!showSuggestions || trimmed.length < 2) return

    const timer = window.setTimeout(async () => {
      const result = await getDiseaseSuggestions(trimmed)
      if (result.success) {
        setSuggestionState({ query: trimmed, items: result.data })
        setOpen(result.data.length > 0)
        setHighlighted(-1)
      } else {
        setSuggestionState({ query: trimmed, items: [] })
        setOpen(false)
      }
    }, 200)

    return () => window.clearTimeout(timer)
  }, [trimmed, showSuggestions])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function submit(query: string) {
    const value = query.trim()
    if (value === '') return
    setOpen(false)
    if (onSubmit) {
      onSubmit(value)
    } else {
      navigate(`/search?q=${encodeURIComponent(value)}`)
    }
  }

  /**
   * A chosen suggestion goes straight to that disease.
   *
   * The suggestion already carries the slug, so the reader lands on the
   * page they picked rather than on a list of results.
   */
  function openSuggestion(suggestion: Suggestion) {
    setOpen(false)
    navigate(`/disease/${suggestion.slug}`)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!listVisible) {
      if (event.key === 'Enter') {
        event.preventDefault()
        submit(value)
      }
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlighted((prev) => (prev + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlighted((prev) => (prev - 1 + suggestions.length) % suggestions.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (highlighted >= 0) {
        openSuggestion(suggestions[highlighted])
      } else {
        submit(value)
      }
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          submit(value)
        }}
        className="flex w-full flex-col gap-2 rounded-2xl border border-slate-300 bg-white p-2 shadow-card sm:flex-row sm:items-center"
        role="search"
      >
        <label htmlFor="disease-search" className="sr-only">
          Search diseases
        </label>
        <div className="flex flex-1 items-center gap-3 px-2">
          <Search aria-hidden="true" className="size-5 text-muted" />
          <input
            id="disease-search"
            type="search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setOpen(true)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            autoComplete="off"
            className="w-full bg-transparent text-base text-ink placeholder:text-muted focus:outline-none"
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-controls="search-suggestions"
            aria-expanded={listVisible}
            aria-activedescendant={
              listVisible && highlighted >= 0 ? `search-suggestion-${highlighted}` : undefined
            }
          />
        </div>
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Search
        </Button>
      </form>

      {listVisible ? (
        <ul
          id="search-suggestions"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-card border border-slate-200 bg-white shadow-lifted"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.slug}
              id={`search-suggestion-${index}`}
              role="option"
              aria-selected={highlighted === index}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setHighlighted(index)}
              onClick={() => openSuggestion(suggestion)}
              className={[
                'flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left transition-colors',
                highlighted === index ? 'bg-primary-light/60' : 'hover:bg-slate-50',
              ].join(' ')}
            >
              <span className="text-sm text-ink">{suggestion.name}</span>
              <span aria-hidden="true" className="text-xs text-muted">View</span>
            </li>
          ))}
        </ul>
      ) : null}

      {loading ? <p className="mt-2 px-1 text-xs text-muted">Looking for matches…</p> : null}
    </div>
  )
}
