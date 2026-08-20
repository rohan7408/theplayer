"use client"

import * as React from "react"
import {
  PEACHIFY_BASE_URL,
  type PeachifyMediaItemProgress,
  type PeachifyPlayerEventPayload,
  type PeachifyProgressStorage,
  type PeachifyWindowMessage,
} from "@/types/peachify"

export const DEFAULT_STORAGE_KEY = "peachifyProgress"

// Frozen empty storage snapshot to avoid getServerSnapshot infinite loop warnings
const EMPTY_STORAGE: PeachifyProgressStorage = Object.freeze({})

// In-memory cache & subscription listeners for tearing-free localStorage sync
const listeners = new Set<() => void>()
const memoryCache: Record<string, PeachifyProgressStorage> = {}
const rawStringCache: Record<string, string | null> = {}

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

function getStoredProgress(storageKey: string): PeachifyProgressStorage {
  if (typeof window === "undefined") return EMPTY_STORAGE
  try {
    const raw = localStorage.getItem(storageKey)

    // Return cached reference if raw string is unchanged
    if (rawStringCache[storageKey] === raw && memoryCache[storageKey]) {
      return memoryCache[storageKey]
    }

    rawStringCache[storageKey] = raw

    if (!raw) {
      memoryCache[storageKey] = EMPTY_STORAGE
      return EMPTY_STORAGE
    }

    const parsed = JSON.parse(raw) as PeachifyProgressStorage
    memoryCache[storageKey] = parsed
    return parsed
  } catch {
    memoryCache[storageKey] = EMPTY_STORAGE
    return EMPTY_STORAGE
  }
}

function persistProgress(
  storageKey: string,
  data: PeachifyProgressStorage
) {
  if (typeof window === "undefined") return
  try {
    const raw = JSON.stringify(data)
    localStorage.setItem(storageKey, raw)
    rawStringCache[storageKey] = raw
    memoryCache[storageKey] = data
    notifyListeners()
  } catch (err) {
    console.warn("Failed to persist watch progress:", err)
  }
}

function getServerSnapshot(): PeachifyProgressStorage {
  return EMPTY_STORAGE
}

interface UsePeachifyProgressOptions {
  storageKey?: string
  onPlayerEvent?: (payload: PeachifyPlayerEventPayload) => void
  onMediaData?: (data: PeachifyProgressStorage) => void
}

/**
 * Hook to manage, synchronize, and persist Peachify video player progress and continue-watching state.
 */
export function usePeachifyProgress(options: UsePeachifyProgressOptions = {}) {
  const {
    storageKey = DEFAULT_STORAGE_KEY,
    onPlayerEvent,
    onMediaData,
  } = options

  const [latestEvent, setLatestEvent] =
    React.useState<PeachifyPlayerEventPayload | null>(null)

  // Use refs for callbacks to prevent re-attaching listeners and infinite loops
  const onPlayerEventRef = React.useRef(onPlayerEvent)
  const onMediaDataRef = React.useRef(onMediaData)

  React.useEffect(() => {
    onPlayerEventRef.current = onPlayerEvent
    onMediaDataRef.current = onMediaData
  })

  // Subscribe to internal and cross-tab storage changes with useSyncExternalStore
  const subscribe = React.useCallback(
    (callback: () => void) => {
      listeners.add(callback)
      const onStorage = (e: StorageEvent) => {
        if (e.key === storageKey) {
          // Invalidate cache on external window change
          rawStringCache[storageKey] = undefined as unknown as string
          callback()
        }
      }
      window.addEventListener("storage", onStorage)
      return () => {
        listeners.delete(callback)
        window.removeEventListener("storage", onStorage)
      }
    },
    [storageKey]
  )

  const getSnapshot = React.useCallback(() => {
    return getStoredProgress(storageKey)
  }, [storageKey])

  const progressStorage = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  // Listen to postMessage events from Peachify player
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent<PeachifyWindowMessage>) => {
      // Validate origin
      if (event.origin !== PEACHIFY_BASE_URL) return

      const message = event.data
      if (!message || typeof message !== "object") return

      // Handle MEDIA_DATA
      if (message.type === "MEDIA_DATA" && message.data) {
        const incomingData = message.data as PeachifyProgressStorage
        const current = getStoredProgress(storageKey)
        const merged: PeachifyProgressStorage = { ...current }

        for (const [key, mediaItem] of Object.entries(incomingData)) {
          merged[key] = {
            ...current[key],
            ...mediaItem,
            last_updated: Date.now(),
          }
        }

        persistProgress(storageKey, merged)
        onMediaDataRef.current?.(incomingData)
      }

      // Handle PLAYER_EVENT
      if (message.type === "PLAYER_EVENT" && message.data) {
        const payload = message.data as PeachifyPlayerEventPayload
        setLatestEvent(payload)
        onPlayerEventRef.current?.(payload)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [storageKey])

  /**
   * Retrieves resume timestamp in seconds for a specific movie or TV episode
   */
  const getResumeTimestamp = React.useCallback(
    (
      mediaId: string | number,
      season?: number,
      episode?: number
    ): number => {
      const key = String(mediaId)
      const item = progressStorage[key]
      if (!item) return 0

      // TV show episode check
      if (season && episode && item.show_progress) {
        const epKey = `s${season}e${episode}`
        const epProgress = item.show_progress[epKey]
        if (epProgress?.progress?.watched) {
          const watched = epProgress.progress.watched
          const duration = epProgress.progress.duration || 0
          if (duration > 0 && watched / duration > 0.95) return 0
          return Math.floor(watched)
        }
      }

      // Top-level progress check
      if (item.progress?.watched) {
        const watched = item.progress.watched
        const duration = item.progress.duration || 0
        if (duration > 0 && watched / duration > 0.95) return 0
        return Math.floor(watched)
      }

      return 0
    },
    [progressStorage]
  )

  /**
   * Get progress record for a specific media ID
   */
  const getMediaProgress = React.useCallback(
    (mediaId: string | number): PeachifyMediaItemProgress | undefined => {
      return progressStorage[String(mediaId)]
    },
    [progressStorage]
  )

  /**
   * Returns list of continue watching items sorted by latest updated
   */
  const getContinueWatchingList = React.useCallback((): PeachifyMediaItemProgress[] => {
    return Object.values(progressStorage).sort((a, b) => {
      const timeA = a.last_updated || 0
      const timeB = b.last_updated || 0
      return timeB - timeA
    })
  }, [progressStorage])

  /**
   * Remove a specific media item from progress storage
   */
  const removeProgress = React.useCallback(
    (mediaId: string | number) => {
      const current = getStoredProgress(storageKey)
      const updated = { ...current }
      delete updated[String(mediaId)]
      persistProgress(storageKey, updated)
    },
    [storageKey]
  )

  /**
   * Clear all stored progress
   */
  const clearAllProgress = React.useCallback(() => {
    persistProgress(storageKey, {})
  }, [storageKey])

  return {
    progressStorage,
    latestEvent,
    isLoaded: true,
    getResumeTimestamp,
    getMediaProgress,
    getContinueWatchingList,
    removeProgress,
    clearAllProgress,
  }
}
