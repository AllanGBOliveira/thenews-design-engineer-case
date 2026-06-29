import { useState, useRef, useEffect, useCallback } from 'react'
import { getReadingProgress, saveReadingProgress } from '~/lib/db'

export type ReadingProgressState = {
  progress: number    // 0–100, max ever reached (never decreases)
  completed: boolean
  loaded: boolean     // false until IndexedDB resolves (avoids flash of 0%)
}

/**
 * Per-edition reading progress backed by IndexedDB.
 *
 * - Progress only ever increases: scrolling back never reduces it.
 * - DB writes are debounced at 300ms to avoid a write per scroll pixel.
 * - Pending write is flushed synchronously on unmount.
 */
export function useReadingProgress(
  editionId: string | undefined,
  slug: string | undefined,
) {
  const [state, setState] = useState<ReadingProgressState>({
    progress: 0,
    completed: false,
    loaded: false,
  })

  // Refs let the scroll handler read the latest values without stale closures
  const maxRef = useRef(0)
  const completedRef = useRef(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load saved progress from IndexedDB whenever editionId changes
  useEffect(() => {
    if (!editionId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ progress: 0, completed: false, loaded: true })
      return
    }

    let cancelled = false
    getReadingProgress(editionId)
      .then((record) => {
        if (cancelled) return
        const progress = record?.progress ?? 0
        const completed = record?.completed ?? false
        maxRef.current = progress
        completedRef.current = completed
        setState({ progress, completed, loaded: true })
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, loaded: true }))
      })

    return () => {
      cancelled = true
    }
  }, [editionId])

  // Flush any pending write on unmount (e.g. user navigates away mid-read)
  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current)
        if (editionId && slug && maxRef.current > 0) {
          saveReadingProgress({
            editionId,
            slug,
            progress: maxRef.current,
            completed: completedRef.current,
            updatedAt: new Date().toISOString(),
          }).catch(() => {})
        }
      }
    }
  }, [editionId, slug])

  /**
   * Call with the raw scroll percentage (0–100).
   * Silently ignored if pct is ≤ current max (progress never goes back).
   */
  const update = useCallback(
    (pct: number) => {
      if (!editionId || !slug) return
      const clamped = Math.min(100, Math.max(0, Math.round(pct)))
      if (clamped <= maxRef.current) return

      maxRef.current = clamped
      if (clamped >= 100) completedRef.current = true

      setState({ progress: clamped, completed: completedRef.current, loaded: true })

      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        saveReadingProgress({
          editionId,
          slug,
          progress: maxRef.current,
          completed: completedRef.current,
          updatedAt: new Date().toISOString(),
        }).catch(() => {})
      }, 300)
    },
    [editionId, slug],
  )

  return { ...state, update }
}
