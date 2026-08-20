import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Sparkles,
  ArrowLeft,
  Film,
  Swords,
  Laugh,
  Clapperboard,
  Wand2,
  Users,
  Ghost,
  Search,
  Heart,
  Zap,
  Rocket,
  Trophy,
  ShieldAlert,
  Compass,
} from "lucide-react"

import { discoverMovies, discoverTv, searchMulti } from "@/lib/tmdb"
import { GENRES_LIST } from "@/lib/constants"
import { MediaCard } from "@/components/media-card"
import { CatalogFilterBar } from "@/components/catalog-filter-bar"
import { Badge } from "@/components/ui/badge"
import type { Movie, TvShow } from "@/types/tmdb"
import { cn } from "@/lib/utils"

const genreIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  action: Swords,
  adventure: Compass,
  animation: Sparkles,
  crime: ShieldAlert,
  comedy: Laugh,
  documentary: Clapperboard,
  fantasy: Wand2,
  family: Users,
  horror: Ghost,
  mystery: Search,
  romance: Heart,
  thriller: Zap,
  "science-fiction": Rocket,
  sports: Trophy,
}

interface GenrePageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ type?: "movie" | "tv"; sort?: string; q?: string }>
}

export async function generateMetadata({
  params,
}: GenrePageProps): Promise<Metadata> {
  const { slug } = await params
  const genre = GENRES_LIST.find((g) => g.slug === slug)
  if (!genre) return { title: "Genre - WatchMe" }

  return {
    title: `${genre.name} Movies & TV Shows - WatchMe`,
    description: `Stream the latest, top rated, and most popular ${genre.name} movies and TV series online on WatchMe.`,
  }
}

export default async function GenrePage({
  params,
  searchParams,
}: GenrePageProps) {
  const { slug } = await params
  const { type = "movie", sort = "popularity.desc", q = "" } = await searchParams

  const genre = GENRES_LIST.find((g) => g.slug === slug)
  if (!genre) {
    notFound()
  }

  const genreId =
    type === "movie" ? genre.movieGenreId : genre.tvGenreId

  let items: (Movie | TvShow)[] = []
  const searchQuery = q.trim().toLowerCase()

  try {
    if (searchQuery) {
      const res = await searchMulti(searchQuery)
      items = (res.results || []).filter((item: Movie | TvShow) => {
        const itemType = "title" in item ? "movie" : "tv"
        return itemType === type
      })
    } else if (type === "movie") {
      const res = await discoverMovies({
        with_genres: genreId,
        with_keywords: genre.keywordId,
        sort_by: sort,
      })
      items = res.results || []
    } else {
      const res = await discoverTv({
        with_genres: genreId,
        with_keywords: genre.keywordId,
        sort_by: sort,
      })
      items = res.results || []
    }
  } catch (err) {
    console.error("Failed to load genre items:", err)
  }

  const HeaderIcon = genreIconMap[genre.slug] || Film

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8 py-8 space-y-8">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Hero Header */}
        <div className="flex flex-col gap-3 p-6 sm:p-8 rounded-2xl border border-white/5 bg-gradient-to-r from-card via-muted/20 to-card shadow-md">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs uppercase font-bold px-2 py-0.5 bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <Sparkles className="size-3 mr-1" />
              Genre
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <HeaderIcon className="size-5" />
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight">
              {genre.name} Movies & TV Shows
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Stream the latest, top-rated, and most popular {genre.name} titles online in HD quality.
          </p>

          {/* Sibling Genre Pills with Lucide Icons */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pt-2 pb-1">
            {GENRES_LIST.map((g) => {
              const GIcon = genreIconMap[g.slug] || Film
              const isSelected = g.slug === genre.slug

              return (
                <Link
                  key={g.slug}
                  href={`/genre/${g.slug}?type=${type}&sort=${sort}`}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors shrink-0",
                    isSelected
                      ? "border-primary bg-primary/15 text-primary font-semibold shadow-xs"
                      : "border-white/10 bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <GIcon className="size-3" />
                  <span>{g.name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Interactive Filter Bar */}
        <CatalogFilterBar
          currentType={type}
          currentSort={sort}
          currentQuery={q}
        />

        {/* Grid Results */}
        {items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No titles found matching the selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {items.map((item) => (
              <MediaCard
                key={`${item.id}-${type}`}
                item={item}
                mediaType={type}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
