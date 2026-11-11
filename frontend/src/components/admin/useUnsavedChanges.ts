import { useEffect, useRef, useState } from 'react'
import { useBlocker, type Blocker } from 'react-router-dom'

interface UnsavedChangesState {
  /** True when the administrator has edits that are not saved yet. */
  dirty: boolean
  /** Records the dirty state for the blocker and the browser warning. */
  setDirty: (dirty: boolean) => void
  /** The router blocker, used to show the in-app prompt. */
  blocker: Blocker
}

/**
 * Warns the administrator before losing unsaved edits
 * (Project Plan section 2.3).
 *
 * The browser tab warning uses `beforeunload`. The in-app warning uses the
 * router blocker, which only works because the app runs on a data router.
 *
 * The dirty state is also kept in a ref, so clearing it takes effect at once
 * and a deliberate save is never mistaken for an unsaved change.
 */
export function useUnsavedChanges(): UnsavedChangesState {
  const [dirty, setDirtyState] = useState(false)
  const dirtyRef = useRef(false)

  function setDirty(value: boolean) {
    dirtyRef.current = value
    setDirtyState(value)
  }

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirtyRef.current && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirtyRef.current) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  return { dirty, setDirty, blocker }
}
