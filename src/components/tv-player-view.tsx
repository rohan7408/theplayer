"use client"

import * as React from "react"
import Image from "next/image"
import { Play, Clock, Film, Calendar } from "lucide-react"

import type { Episode, TvDetails, VideoTrailer } from "@/types/tmdb"
import { getTmdbImageUrl, getTvSeasonDetails, isFutureDate } from "@/lib/tmdb"
import { PeachifyPlayer } from "@/components/peachify-player"
import { usePeachifyProgress } from "@/hooks/use-peachify-progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface TvPlayerViewProps {
  tv: TvDetails
  initialSeasonNumber?: number
  initialEpisodeNumber?: number
}

export function TvPlayerView({
  tv,
  initialSeasonNumber = 1,
  initialEpisodeNumber = 1,
}: TvPlayerViewProps) {
  const [activeSeasonNumber, setActiveSeasonNumber] = React.useState(initialSeasonNumber)
  const [activeEpisodeNumber, setActiveEpisodeNumber] = React.useState(initialEpisodeNumber)
  const [seasonEpisodes, setSeasonEpisodes] = React.useState<Episode[]>([])
  const [loadedSeason, setLoadedSeason] = React.useState<number | null>(null)

  const { progressStorage } = usePeachifyProgress()

  // Find valid seasons
  const seasons = (tv.seasons || []).filter((s) => s.season_number > 0)

  // Fetch episodes when activeSeasonNumber changes
  React.useEffect(() => {
    let isCancelled = false

    getTvSeasonDetails(tv.id, activeSeasonNumber)
      .then((details) => {
        if (!isCancelled) {
          setSeasonEpisodes(details.episodes || [])
          setLoadedSeason(activeSeasonNumber)
        }
      })
      .catch((err) => {
        console.warn("Failed to load season details:", err)
        if (!isCancelled) {
          setLoadedSeason(activeSeasonNumber)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [tv.id, activeSeasonNumber])

  // Get active episode details
  const activeEpisode = seasonEpisodes.find(
    (ep) => ep.episode_number === activeEpisodeNumber
  )

  // Check if series or episode is in the future
  const isSeriesFuture = isFutureDate(tv.first_air_date)
  const isEpisodeFuture = isFutureDate(activeEpisode?.air_date)

  const isUnreleased = isSeriesFuture || isEpisodeFuture
  const unreleasedDateFormatted = isEpisodeFuture && activeEpisode?.air_date
    ? new Date(activeEpisode.air_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : tv.first_air_date
    ? new Date(tv.first_air_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "TBD"

  const trailers = (tv.videos?.results || []).filter(
    (v: VideoTrailer) => v.site === "YouTube"
  )
  const primaryTrailer =
    trailers.find((t) => t.type === "Trailer" && t.site === "YouTube") ||
    trailers[0]

  return (
    <div className="space-y-6">
      {/* Player Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {tv.name}
            </h1>
            <Badge variant="default" className="text-xs font-mono font-bold bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              S{activeSeasonNumber} E{activeEpisodeNumber}
            </Badge>
          </div>
          {activeEpisode && (
            <span className="text-xs font-semibold text-muted-foreground truncate max-w-md">
              {activeEpisode.name}
            </span>
          )}
        </div>

        {isUnreleased ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs sm:text-sm">
              <Calendar className="size-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">
                  Unreleased Episode / Series — Coming Soon ({unreleasedDateFormatted})
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This content is scheduled to premiere on {unreleasedDateFormatted}. Streaming will become available upon its public air date.
                </p>
              </div>
            </div>

            {primaryTrailer ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Play className="size-3.5 text-primary fill-current" />
                  <span>Official Trailer</span>
                </div>
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl border border-white/5">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${primaryTrailer.key}?autoplay=0&rel=0`}
                    title={`${tv.name} Trailer`}
                    className="size-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-card border border-white/5 flex flex-col items-center justify-center p-6 text-center space-y-2">
                <Clock className="size-10 text-muted-foreground/60" />
                <h3 className="font-heading font-bold text-lg text-foreground">
                  Premiering on {unreleasedDateFormatted}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md">
                  Streaming links will be automatically enabled once this episode airs publicly.
                </p>
              </div>
            )}
          </div>
        ) : (
          <PeachifyPlayer
            config={{
              type: "tv",
              mediaId: tv.id,
              season: activeSeasonNumber,
              episode: activeEpisodeNumber,
              autoNext: true,
              showNextBtn: true,
              autoPlay: true,
            }}
            autoResume={true}
            className="shadow-2xl border border-white/5 rounded-2xl overflow-hidden"
          />
        )}
      </div>

      {/* Season & Episode Browser */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-heading text-lg font-bold">Episodes Browser</h2>
            <p className="text-xs text-muted-foreground">
              Select an episode to start streaming immediately
            </p>
          </div>

          {/* Season Selector Tabs/Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {seasons.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveSeasonNumber(s.season_number)
                  setActiveEpisodeNumber(1)
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0",
                  activeSeasonNumber === s.season_number
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-card border border-white/5 text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Season {s.season_number}
              </button>
            ))}
          </div>
        </div>

        {/* Episode Grid */}
        {loadedSeason !== activeSeasonNumber ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-card border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : seasonEpisodes.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6">
            No episode information available for this season.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {seasonEpisodes.map((ep) => {
              const isSelected = ep.episode_number === activeEpisodeNumber
              const stillUrl = getTmdbImageUrl(ep.still_path, "w300", "still")
              const savedProgress =
                progressStorage[
                  `tv-${tv.id}-s${activeSeasonNumber}-e${ep.episode_number}`
                ]
              const percent =
                savedProgress?.progress && savedProgress.progress.duration > 0
                  ? (savedProgress.progress.watched / savedProgress.progress.duration) * 100
                  : 0

              return (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => setActiveEpisodeNumber(ep.episode_number)}
                  className={cn(
                    "group relative flex flex-col text-left overflow-hidden rounded-xl border p-2 transition-all cursor-pointer bg-card",
                    isSelected
                      ? "border-primary ring-1 ring-primary shadow-lg shadow-primary/10"
                      : "border-white/5 hover:border-primary/50 hover:bg-muted/30"
                  )}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/60 mb-2">
                    {ep.still_path ? (
                      <Image
                        src={stillUrl}
                        alt={ep.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <Film className="size-6 opacity-40" />
                      </div>
                    )}

                    {/* Episode Pill */}
                    <div className="absolute top-1.5 left-1.5 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-mono font-bold text-white backdrop-blur-md">
                      EP {ep.episode_number}
                    </div>

                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30">
                        <Play className="size-3.5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {percent > 0 && (
                      <div className="absolute bottom-0 inset-x-0 h-1 bg-black/60">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Title & Runtime */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="font-heading text-xs font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                      {ep.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      {ep.runtime ? (
                        <span className="flex items-center gap-1">
                          <Clock className="size-2.5" />
                          {ep.runtime}m
                        </span>
                      ) : (
                        <span>Episode {ep.episode_number}</span>
                      )}
                      {ep.air_date && <span>{ep.air_date}</span>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
