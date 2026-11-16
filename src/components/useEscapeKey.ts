import { useEffect } from 'react'

/** Calls `onEscape` when the Escape key is pressed while `isActive` is true. */
export function useEscapeKey(onEscape: () => void, isActive: boolean): void {
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onEscape()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onEscape, isActive])
}
