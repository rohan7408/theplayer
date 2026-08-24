"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Star, Play, Film, Tv } from "lucide-react"

import type { Movie, TvShow } from "@/types/tmdb"
import { getTmdbImageUrl } from "@/lib/tmdb"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface MediaCardProps {
  item: Movie | TvShow
  mediaType?: "movie" | "tv"
  priority?: boolean
  className?: string
}

export function MediaCard({
  item,
  mediaType,
  priority = false,
  className,
}: MediaCardProps) {
  const isMovie =
    mediaType === "movie" ||
    ("title" in item && item.title !== undefined) ||
    ("media_type" in item && item.media_type === "movie")

  const type = isMovie ? "movie" : "tv"
  const title = "title" in item && item.title ? item.title : ("name" in item ? item.name : "Untitled")
  const date = "release_date" in item && item.release_date ? item.release_date : ("first_air_date" in item ? item.first_air_date : "")
  const year = date ? new Date(date).getFullYear() : ""
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null
  const posterUrl = getTmdbImageUrl(item.poster_path, "w500", "poster")
  const href = `/${type}/${item.id}`

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-card/80 border border-white/5 shadow-md transition-all duration-300 hover:shadow-2xl hover:shadow-primary/15 hover:-translate-y-1.5 hover:border-primary/40",
        className
      )}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted/40">
        {item.poster_path ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground bg-muted">
            {type === "movie" ? <Film className="size-8 opacity-40" /> : <Tv className="size-8 opacity-40" />}
            <span className="text-xs font-medium line-clamp-2">{title}</span>
          </div>
        )}

        {/* Ambient Dark Gradient & Play Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/40 transform scale-75 group-hover:scale-100 transition-all duration-300">
            <Play className="size-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
          <Badge
            variant="secondary"
            className="bg-black/75 text-white backdrop-blur-md text-[10px] uppercase font-bold tracking-wide border-0 px-2 py-0.5 rounded-md"
          >
            {type === "movie" ? "Movie" : "Series"}
          </Badge>

          {rating && (
            <div className="flex items-center gap-1 rounded-md bg-black/80 px-2 py-0.5 text-[11px] font-bold text-amber-400 backdrop-blur-md border border-white/10 font-mono">
              <Star className="size-3 fill-current" />
              <span>{rating}</span>
            </div>
          )}
        </div>

        {/* Bottom Quality Tag */}
        <div className="absolute bottom-2 right-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-black/80 text-white/90 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono border border-white/10">
            HD
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-1 p-3">
        <h4 className="font-heading font-semibold text-xs sm:text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span>{year || "N/A"}</span>
          <span className="text-[10px] uppercase text-primary/80 font-bold tracking-wider">
            {type}
          </span>
        </div>
      </div>
    </Link>
  )
}
