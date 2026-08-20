import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Film, Search, X } from "lucide-react"

import {
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  discoverMovies,
  getMovieGenres,
  searchMulti,
} from "@/lib/tmdb"
import { MediaCard } from "@/components/media-card"
import { Input } from "@/components/ui/input"
import type { Movie, TvShow } from "@/types/tmdb"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Movies Catalog - The Player",
  description: "Browse popular, top rated, and latest trending movies on The Player.",
}

interface MoviesPageProps {
  searchParams: Promise<{
    category?: "popular" | "top_rated" | "now_playing" | "upcoming"
    genre?: string
    sort?: string
    q?: string
  }>
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const {
    category = "popular",
    genre,
    sort = "popularity.desc",
    q = "",
  } = await searchParams

  const genreRes = await getMovieGenres().catch(() => ({ genres: [] }))
  const genres = genreRes.genres || []

  let movies: Movie[] = []
  let pageTitle = "Popular Movies"
  const searchQuery = q.trim()

  try {
    if (searchQuery) {
      pageTitle = `Movies matching "${searchQuery}"`
      const res = await searchMulti(searchQuery)
      movies = (res.results || []).filter(
        (item: Movie | TvShow): item is Movie =>
          "title" in item && Boolean(item.title)
      )
    } else if (genre) {
      const selectedGenre = genres.find((g) => String(g.id) === genre)
      pageTitle = selectedGenre ? `${selectedGenre.name} Movies` : "Filtered Movies"
      const res = await discoverMovies({
        with_genres: genre,
        sort_by: sort,
      })
      movies = res.results || []
    } else {
      switch (category) {
        case "top_rated":
          pageTitle = "Top Rated Movies"
          movies = (await getTopRatedMovies()).results || []
          break
        case "now_playing":
          pageTitle = "Now Playing in Theaters"
          movies = (await getNowPlayingMovies()).results || []
          break
        case "upcoming":
          pageTitle = "Upcoming Releases"
          movies = (await getUpcomingMovies()).results || []
          break
        case "popular":
        default:
          pageTitle = "Popular Movies"
          movies = (await getPopularMovies()).results || []
          break
      }
    }
  } catch (err) {
    console.error("Failed to load movies:", err)
  }

  const categoryTabs = [
    { key: "popular", label: "Popular" },
    { key: "top_rated", label: "Top Rated" },
    { key: "now_playing", label: "Now Playing" },
    { key: "upcoming", label: "Upcoming" },
  ]

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Film className="size-4.5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {pageTitle}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Explore and stream the highest quality movies available online
            </p>
          </div>

          {/* Direct Search Form */}
          <form action="/movies" method="GET" className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              name="q"
              defaultValue={searchQuery}
              placeholder="Search movies..."
              className="pl-8.5 pr-8 h-9 text-xs bg-muted/50 border-border/80"
            />
            {searchQuery && (
              <Link
                href="/movies"
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
                  href={`/movies?category=${tab.key}`}
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
                href="/movies"
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
                    href={`/movies?genre=${g.id}`}
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

        {/* Movie Grid */}
        {movies.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No movies found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <MediaCard key={movie.id} item={movie} mediaType="movie" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
