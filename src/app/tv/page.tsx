import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Tv, Search, X } from "lucide-react"

import {
  getPopularTv,
  getTopRatedTv,
  getOnTheAirTv,
  discoverTv,
  getTvGenres,
  searchMulti,
} from "@/lib/tmdb"
import { MediaCard } from "@/components/media-card"
import { Input } from "@/components/ui/input"
import type { Movie, TvShow } from "@/types/tmdb"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "TV Series Catalog - WatchMe",
  description: "Browse popular, top rated, and on-air TV shows and series on WatchMe.",
}

interface TvSeriesPageProps {
  searchParams: Promise<{
    category?: "popular" | "top_rated" | "on_the_air"
    genre?: string
    sort?: string
    q?: string
  }>
}

export default async function TvSeriesPage({ searchParams }: TvSeriesPageProps) {
  const {
    category = "popular",
    genre,
    sort = "popularity.desc",
    q = "",
  } = await searchParams

  const genreRes = await getTvGenres().catch(() => ({ genres: [] }))
  const genres = genreRes.genres || []

  let shows: TvShow[] = []
  let pageTitle = "Popular TV Series"
  const searchQuery = q.trim()

  try {
    if (searchQuery) {
      pageTitle = `TV Series matching "${searchQuery}"`
      const res = await searchMulti(searchQuery)
      shows = (res.results || []).filter(
        (item: Movie | TvShow): item is TvShow =>
          "name" in item && Boolean(item.name)
      )
    } else if (genre) {
      const selectedGenre = genres.find((g) => String(g.id) === genre)
      pageTitle = selectedGenre ? `${selectedGenre.name} Series` : "Filtered Series"
      const res = await discoverTv({
        with_genres: genre,
        sort_by: sort,
      })
      shows = res.results || []
    } else {
      switch (category) {
        case "top_rated":
          pageTitle = "Top Rated Series"
          shows = (await getTopRatedTv()).results || []
          break
        case "on_the_air":
          pageTitle = "Currently On The Air"
          shows = (await getOnTheAirTv()).results || []
          break
        case "popular":
        default:
          pageTitle = "Popular TV Series"
          shows = (await getPopularTv()).results || []
          break
      }
    }
  } catch (err) {
    console.error("Failed to load TV shows:", err)
  }

  const categoryTabs = [
    { key: "popular", label: "Popular" },
    { key: "top_rated", label: "Top Rated" },
    { key: "on_the_air", label: "On The Air" },
  ]

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Tv className="size-4.5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {pageTitle}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Explore episodes and stream TV shows from top networks
            </p>
          </div>

          {/* Direct Search Form */}
          <form action="/tv" method="GET" className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              name="q"
              defaultValue={searchQuery}
              placeholder="Search TV shows..."
              className="pl-8.5 pr-8 h-9 text-xs bg-muted/50 border-border/80"
            />
            {searchQuery && (
              <Link
                href="/tv"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </Link>
            )}
          </form>
        </div>

        {/* Category Tabs */}
        {!genre && !searchQuery && (
          <div className="flex items-center gap-2 border-b pb-4 overflow-x-auto">
            {categoryTabs.map((tab) => {
              const isActive = category === tab.key
              return (
                <Link
                  key={tab.key}
                  href={`/tv?category=${tab.key}`}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  )}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
        )}

        {/* Genre Pills */}
        {!searchQuery && (
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Filter by Genre
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Link
                href="/tv"
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                  !genre
                    ? "bg-primary/15 border-primary/40 text-primary font-semibold"
                    : "bg-card border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                All Genres
              </Link>
              {genres.map((g) => {
                const isSelected = genre === String(g.id)
                return (
                  <Link
                    key={g.id}
                    href={`/tv?genre=${g.id}`}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                      isSelected
                        ? "bg-primary/15 border-primary/40 text-primary font-semibold"
                        : "bg-card border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {g.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Shows Grid */}
        {shows.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No TV shows found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {shows.map((show) => (
              <MediaCard key={show.id} item={show} mediaType="tv" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
