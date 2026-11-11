import { Plus, Trash2 } from 'lucide-react'
import { useId } from 'react'

interface RepeatableListInputProps {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  error?: string
  placeholder?: string
  addLabel?: string
  itemLabel?: string
}

/**
 * A list of text inputs the administrator can add to and remove from
 * (Project Plan section 2.3). Used for symptoms, causes, risk factors,
 * prevention, care options, precautions and urgent signs.
 */
export function RepeatableListInput({
  label,
  items,
  onChange,
  error,
  placeholder = 'Write one item',
  addLabel = 'Add another',
  itemLabel = 'item',
}: RepeatableListInputProps) {
  const groupId = useId()
  const errorId = `${groupId}-error`

  function update(index: number, value: string) {
    const next = [...items]
    next[index] = value
    onChange(next)
  }

  function remove(index: number) {
    onChange(items.filter((_, current) => current !== index))
  }

  function add() {
    onChange([...items, ''])
  }

  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{label}</legend>
      {items.length === 0 ? (
        <p className="mt-1.5 text-xs text-muted">No {itemLabel}s yet. Add at least one.</p>
      ) : null}

      <div className="mt-2 space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1">
              <label htmlFor={`${groupId}-${index}`} className="sr-only">
                {label} {index + 1}
              </label>
              <input
                id={`${groupId}-${index}`}
                type="text"
                value={item}
                onChange={(event) => update(index, event.target.value)}
                placeholder={placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
              className="mt-0.5 rounded-lg border border-slate-300 p-2 text-muted transition-colors hover:border-urgent/40 hover:bg-urgent-soft/40 hover:text-urgent"
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary"
      >
        <Plus aria-hidden="true" className="size-4" />
        {addLabel}
      </button>

      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-urgent">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
