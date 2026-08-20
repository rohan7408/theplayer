"use client"

import * as React from "react"
import { Loader2, AlertCircle } from "lucide-react"

import {
  type PeachifyEmbedConfig,
  type PeachifyPlayerEventPayload,
  type PeachifyProgressStorage,
} from "@/types/peachify"
import { buildPeachifyUrl } from "@/lib/peachify"
import { usePeachifyProgress } from "@/hooks/use-peachify-progress"
import { cn } from "@/lib/utils"

export interface PeachifyPlayerProps {
  /**
   * Embed configuration for Movie or TV show
   */
  config: PeachifyEmbedConfig
  /**
   * If true, automatically loads the saved resume timestamp from continue-watching storage
   * when startAt is not explicitly specified (default: true).
   */
  autoResume?: boolean
  /**
   * Custom container CSS class
   */
  className?: string
  /**
   * Custom iframe CSS class
   */
  iframeClassName?: string
  /**
   * Aspect ratio of the player container (default: '16/9')
   */
  aspectRatio?: "16/9" | "21/9" | "4/3" | "auto"
  /**
   * Iframe accessible title
   */
  title?: string
  /**
   * Iframe sandbox security restrictions.
   * Default: "allow-scripts allow-same-origin allow-forms allow-presentation"
   * (Strictly blocks popup new tabs and top-level ad redirects while allowing playback).
   */
  sandbox?: string
  /**
   * Callback fired when any PLAYER_EVENT is received
   */
  onPlayerEvent?: (payload: PeachifyPlayerEventPayload) => void
  /**
   * Callback fired when full MEDIA_DATA continue-watching payload is received
   */
  onMediaData?: (data: PeachifyProgressStorage) => void
  /**
   * Specific event callbacks
   */
  onPlay?: (payload: PeachifyPlayerEventPayload) => void
  onPause?: (payload: PeachifyPlayerEventPayload) => void
  onSeeked?: (payload: PeachifyPlayerEventPayload) => void
  onEnded?: (payload: PeachifyPlayerEventPayload) => void
  onTimeUpdate?: (payload: PeachifyPlayerEventPayload) => void
  /**
   * Custom loading placeholder
   */
  loadingFallback?: React.ReactNode
  /**
   * Custom error placeholder
   */
  errorFallback?: (error: Error) => React.ReactNode
}

/**
 * Video Player Component
 * Embeds video player inside a responsive, accessible iframe with automated progress syncing and ad-popup blocking.
 */
export function PeachifyPlayer({
  config,
  autoResume = true,
  className,
  iframeClassName,
  aspectRatio = "16/9",
  title = "Video Player",
  sandbox = "allow-scripts allow-same-origin allow-forms allow-presentation",
  onPlayerEvent,
  onMediaData,
  onPlay,
  onPause,
  onSeeked,
  onEnded,
  onTimeUpdate,
  loadingFallback,
  errorFallback,
}: PeachifyPlayerProps) {
  // Track loaded src declaratively
  const [loadedSrc, setLoadedSrc] = React.useState<string>("")

  const handleInternalPlayerEvent = React.useCallback(
    (payload: PeachifyPlayerEventPayload) => {
      onPlayerEvent?.(payload)

      switch (payload.event) {
        case "play":
          onPlay?.(payload)
          break
        case "pause":
          onPause?.(payload)
          break
        case "seeked":
          onSeeked?.(payload)
          break
        case "ended":
          onEnded?.(payload)
          break
        case "timeupdate":
          onTimeUpdate?.(payload)
          break
      }
    },
    [onPlayerEvent, onPlay, onPause, onSeeked, onEnded, onTimeUpdate]
  )

  // Progress hook
  const { getResumeTimestamp } = usePeachifyProgress({
    onPlayerEvent: handleInternalPlayerEvent,
    onMediaData,
  })

  // Unique media identifier key to detect when the title / episode actually changes
  const mediaKey =
    config.type === "tv"
      ? `${config.type}-${config.mediaId}-s${config.season || 1}-e${config.episode || 1}`
      : `${config.type}-${config.mediaId}`

  // Initial resume timestamp for the current media session
  const [prevMediaKey, setPrevMediaKey] = React.useState(mediaKey)
  const [sessionStartAt, setSessionStartAt] = React.useState<number | undefined>(() => {
    if (config.startAt !== undefined) return config.startAt
    if (autoResume) {
      const saved =
        config.type === "tv"
          ? getResumeTimestamp(config.mediaId, config.season, config.episode)
          : getResumeTimestamp(config.mediaId)
      return saved > 5 ? Math.floor(saved) : undefined
    }
    return undefined
  })

  // Adjust sessionStartAt during render if mediaKey changes
  if (prevMediaKey !== mediaKey) {
    setPrevMediaKey(mediaKey)
    let initial = config.startAt
    if (initial === undefined && autoResume) {
      const saved =
        config.type === "tv"
          ? getResumeTimestamp(config.mediaId, config.season, config.episode)
          : getResumeTimestamp(config.mediaId)
      initial = saved > 5 ? Math.floor(saved) : undefined
    }
    setSessionStartAt(initial)
  }

  // Derive embed URL directly during render
  let iframeSrc = ""
  let embedError: Error | null = null

  try {
    iframeSrc = buildPeachifyUrl({
      ...config,
      startAt: config.startAt !== undefined ? config.startAt : sessionStartAt,
    })
  } catch (err) {
    embedError = err instanceof Error ? err : new Error(String(err))
  }

  const isLoading = Boolean(iframeSrc) && loadedSrc !== iframeSrc

  const aspectClass =
    aspectRatio === "16/9"
      ? "aspect-video"
      : aspectRatio === "21/9"
        ? "aspect-[21/9]"
        : aspectRatio === "4/3"
          ? "aspect-[4/3]"
          : ""

  if (embedError) {
    if (errorFallback) return <>{errorFallback(embedError)}</>

    return (
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center text-sm text-destructive",
          aspectClass,
          className
        )}
      >
        <AlertCircle className="size-8 mb-2" />
        <p className="font-semibold">Unable to load video player</p>
        <p className="text-xs text-muted-foreground mt-1">{embedError.message}</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-black shadow-lg border border-border/40",
        aspectClass,
        className
      )}
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-card/90 backdrop-blur-xs text-muted-foreground transition-opacity">
          {loadingFallback || (
            <>
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-xs font-medium tracking-wide">Loading Media Player...</p>
            </>
          )}
        </div>
      )}

      {/* Embedded Iframe with Anti-Ad-Redirect Sandbox */}
      {iframeSrc && (
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          title={title}
          className={cn("h-full w-full border-0", iframeClassName)}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write"
          sandbox={sandbox}
          allowFullScreen
          onLoad={() => setLoadedSrc(iframeSrc)}
        />
      )}
    </div>
  )
}
