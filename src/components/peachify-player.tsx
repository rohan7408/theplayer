"use client"

import * as React from "react"
import { Loader2, AlertCircle, Server, Sparkles, ShieldCheck } from "lucide-react"

import {
  type PeachifyEmbedConfig,
  type PeachifyPlayerEventPayload,
  type PeachifyProgressStorage,
} from "@/types/peachify"
import { buildPeachifyUrl } from "@/lib/peachify"
import { usePeachifyProgress } from "@/hooks/use-peachify-progress"
import { STREAMING_SERVERS } from "@/lib/player-servers"
import { Badge } from "@/components/ui/badge"
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
 * Features Multi-Server Streaming, Anti-Top-Navigation Redirection Guard, and automated progress syncing.
 */
export function PeachifyPlayer({
  config,
  autoResume = true,
  className,
  iframeClassName,
  aspectRatio = "16/9",
  title = "Video Player",
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
  const [selectedServerId, setSelectedServerId] = React.useState<string>(
    STREAMING_SERVERS[0].id
  )
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

  // Derive embed URL based on active server
  let iframeSrc = ""
  let embedError: Error | null = null

  try {
    const activeServer =
      STREAMING_SERVERS.find((s) => s.id === selectedServerId) ||
      STREAMING_SERVERS[0]

    if (activeServer.id === "server-1") {
      iframeSrc = buildPeachifyUrl({
        ...config,
        startAt: config.startAt !== undefined ? config.startAt : sessionStartAt,
      })
    } else {
      iframeSrc = activeServer.getUrl({
        type: config.type,
        mediaId: config.mediaId,
        season: config.type === "tv" ? config.season : 1,
        episode: config.type === "tv" ? config.episode : 1,
        startAt: config.startAt !== undefined ? config.startAt : sessionStartAt,
      })
    }
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
    <div className="space-y-3">
      {/* Streaming Server Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl border border-white/5 bg-card/60 backdrop-blur-md text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Server className="size-3.5 text-primary" />
          <span className="font-semibold text-foreground">Streaming Server:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5">
          {STREAMING_SERVERS.map((server) => {
            const isSelected = server.id === selectedServerId
            return (
              <button
                key={server.id}
                type="button"
                onClick={() => setSelectedServerId(server.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap text-xs",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-black/40 border border-white/5 text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <span>{server.name}</span>
                {server.badge && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] px-1 py-0 border-0 uppercase font-mono",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-primary/20 text-primary"
                    )}
                  >
                    {server.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Video Player Frame with Anti-Top-Navigation Redirection Guard */}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl border border-white/10",
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
                <p className="text-xs font-medium tracking-wide">Connecting to Stream Server...</p>
              </>
            )}
          </div>
        )}

        {/* Embedded Iframe */}
        {iframeSrc && (
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            title={title}
            className={cn("h-full w-full border-0", iframeClassName)}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write"
            allowFullScreen
            onLoad={() => setLoadedSrc(iframeSrc)}
          />
        )}
      </div>

      {/* Streaming Tip Alert */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-2 rounded-xl bg-card/30 border border-white/5 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-primary shrink-0" />
          <span>High-speed multi-server streaming active.</span>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <Sparkles className="size-3" />
          <span>If a server buffers or is slow, easily switch to another server above.</span>
        </div>
      </div>
    </div>
  )
}
