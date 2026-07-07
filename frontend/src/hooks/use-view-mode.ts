import { useCallback, useState } from 'react'

export type ViewMode = 'table' | 'grid'

const STORAGE_KEY = 'pitz.view-mode'

// localStorage can be missing methods or throw (private mode, some test envs),
// so every access is guarded and degrades to in-memory state.
function readStored(): ViewMode | null {
  try {
    return (localStorage?.getItem?.(STORAGE_KEY) as ViewMode | null) ?? null
  } catch {
    /* storage unavailable */
    return null
  }
}

function writeStored(mode: ViewMode): void {
  try {
    localStorage?.setItem?.(STORAGE_KEY, mode)
  } catch {
    /* storage unavailable — keep the choice in memory only */
  }
}

// Remembers the user's table/grid preference across visits. Defaults to the
// table (its dense layout is the safest first impression on any screen).
export function useViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>(() => readStored() ?? 'table')

  const update = useCallback((next: ViewMode) => {
    setMode(next)
    writeStored(next)
  }, [])

  return [mode, update]
}
