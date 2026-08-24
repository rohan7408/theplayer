"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Play, History, Trash2, Film, Tv } from "lucide-react"
import { toast } from "sonner"

import { usePeachifyProgress } from "@/hooks/use-peachify-progress"
import { getTmdbImageUrl } from "@/lib/tmdb"
import { formatPlaybackTime } from "@/lib/peachify"
import { Badge } from "@/components/ui/badge"

export function ContinueWatchingRow() {
  const { getContinueWatchingList, removeProgress } = usePeachifyProgress()
  const list = getContinueWatchingList()

  if (!list || list.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary shadow-sm shadow-primary/20">
            <History className="size-4" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold tracking-tight">
              Continue Watching
            </h2>
            <p className="text-xs text-muted-foreground">
              Pick up right where you left off
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {list.slice(0, 8).map((item) => {
          const watched = item.progress?.watched || 0
          const duration = item.progress?.duration || 1
          const percent = Math.min(100, Math.round((watched / duration) * 100))
          const isMovie = item.type === "movie"
          const targetUrl = isMovie
            ? `/movie/${item.id}`
            : `/tv/${item.id}?season=${item.last_season_watched || 1}&episode=${item.last_episode_watched || 1}`

          const posterUrl = item.poster_path
            ? getTmdbImageUrl(item.poster_path, "w500", "poster")
            : (item.backdrop_path ? getTmdbImageUrl(item.backdrop_path, "w500", "backdrop") : null)

          return (
            <div
              key={String(item.id)}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-card/80 shadow-md transition-all hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 hover:-translate-y-1"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-muted/40">
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={item.title || `Media ${item.id}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
                    {isMovie ? <Film className="size-8 opacity-40" /> : <Tv className="size-8 opacity-40" />}
                  </div>
                )}

                {/* Overlay with Play Button */}
                <Link
                  href={targetUrl}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transform group-hover:scale-110 transition-transform">
                    <Play className="size-4.5 fill-current ml-0.5" />
                  </div>
                </Link>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <Badge variant="secondary" className="bg-black/75 text-white backdrop-blur-md text-[10px] uppercase font-bold border-0">
                    {item.type}
                  </Badge>
                  {!isMovie && (
                    <Badge variant="outline" className="bg-black/75 text-white backdrop-blur-md text-[10px] font-mono border-0">
                      S{item.last_season_watched || 1} E{item.last_episode_watched || 1}
                    </Badge>
                  )}
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    removeProgress(item.id)
                    toast.info(`Removed "${item.title || item.id}" from watch history`)
                  }}
                  className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-black/70 text-white/80 hover:text-destructive hover:bg-black/90 transition-colors backdrop-blur-md cursor-pointer"
                  title="Remove from history"
                >
                  <Trash2 className="size-3" />
                </button>

                {/* Electric Red Progress Bar */}
                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/60">
                  <div
                    className="h-full bg-primary shadow-xs shadow-primary transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1 p-3">
                <Link
                  href={targetUrl}
                  className="font-heading font-semibold text-xs sm:text-sm line-clamp-1 hover:text-primary transition-colors"
                >
                  {item.title || `Media ID: ${item.id}`}
                </Link>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>{formatPlaybackTime(watched)}</span>
                  <span className="text-primary font-bold">{percent}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
