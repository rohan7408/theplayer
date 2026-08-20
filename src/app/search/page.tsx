import * as React from "react"
import type { Metadata } from "next"
import { Search as SearchIcon } from "lucide-react"

import { searchMulti } from "@/lib/tmdb"
import { MediaCard } from "@/components/media-card"
import type { Movie, TvShow } from "@/types/tmdb"

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
  }>
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Search results for "${q}" - WatchMe` : "Search Movies & TV - WatchMe",
    description: "Search millions of movies and TV shows on WatchMe.",
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams
  const query = q.trim()

  let results: (Movie | TvShow)[] = []

  if (query) {
    try {
      const res = await searchMulti(query)
      results = (res.results || []).filter(
        (item: Movie | TvShow) =>
          ("title" in item && Boolean(item.title)) ||
          ("name" in item && Boolean(item.name))
      )
    } catch (err) {
      console.error("Search failed:", err)
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <SearchIcon className="size-6 text-primary" />
            {query ? (
              <span>
                Search Results for &ldquo;<span className="text-primary">{query}</span>&rdquo;
              </span>
            ) : (
              <span>Search Movies & Shows</span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {query
              ? `Found ${results.length} result(s)`
              : "Use the search dialog or enter a title above to discover content"}
          </p>
        </div>

        {/* Results Grid */}
        {results.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="size-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <SearchIcon className="size-6" />
            </div>
            <p className="text-sm font-semibold">
              {query ? `No results found for "${query}"` : "Search for your favorite movies and series"}
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Try searching with a different keyword, actor name, or series title.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((item) => (
              <MediaCard
                key={`${item.id}-${"title" in item ? "movie" : "tv"}`}
                item={item}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
