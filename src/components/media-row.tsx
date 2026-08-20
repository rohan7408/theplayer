"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import type { Movie, TvShow } from "@/types/tmdb"
import { MediaCard } from "@/components/media-card"
import { cn } from "@/lib/utils"

export interface MediaRowProps {
  title: string
  items: (Movie | TvShow)[]
  mediaType?: "movie" | "tv"
  viewAllHref?: string
  description?: string
  className?: string
}

export function MediaRow({
  title,
  items,
  mediaType,
  viewAllHref,
  description,
  className,
}: MediaRowProps) {
  if (!items || items.length === 0) return null

  return (
    <section className={cn("space-y-3 sm:space-y-4", className)}>
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg sm:text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline underline-offset-4 shrink-0 font-mono"
          >
            <span>View all</span>
            <ChevronRight className="size-3.5" />
          </Link>
        )}
      </div>

      {/* Responsive Grid / Horizontal Scroll on Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {items.slice(0, 12).map((item) => (
          <MediaCard
            key={`${item.id}-${mediaType || ("title" in item ? "movie" : "tv")}`}
            item={item}
            mediaType={mediaType}
          />
        ))}
      </div>
    </section>
  )
}
