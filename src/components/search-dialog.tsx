"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Loader2, Star, Film, Tv, ArrowRight } from "lucide-react"

import type { Movie, TvShow } from "@/types/tmdb"
import { searchMulti, getTmdbImageUrl } from "@/lib/tmdb"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function SearchDialog() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<(Movie | TvShow)[]>([])
  const [isSearching, setIsSearching] = React.useState(false)

  // Keyboard shortcut Ctrl+K / Cmd+K
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  // Debounced search without synchronous setState in effect
  React.useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) return

    const timeout = setTimeout(() => {
      setIsSearching(true)
      searchMulti(trimmed)
        .then((res) => {
          const valid = (res.results || []).filter(
            (item: Movie | TvShow) =>
              ("title" in item && Boolean(item.title)) ||
              ("name" in item && Boolean(item.name))
          )
          setSearchResults(valid.slice(0, 8))
        })
        .catch((err) => console.warn("Search error:", err))
        .finally(() => setIsSearching(false))
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  const results = query.trim() ? searchResults : []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="relative h-9 w-9 p-0 md:h-9 md:w-52 lg:w-60 md:justify-between md:px-3 text-xs text-muted-foreground cursor-pointer rounded-xl bg-card/40 hover:bg-card/70 border-white/10 shrink-0"
          />
        }
      >
        <span className="flex items-center gap-2 min-w-0">
          <Search className="size-3.5 shrink-0" />
          <span className="hidden md:inline truncate">Search movies, shows...</span>
        </span>
        <kbd className="hidden md:inline-flex pointer-events-none h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 shrink-0">
          <span className="text-xs">⌘</span>K
        </kbd>
      </DialogTrigger>

      <DialogContent className="w-[95vw] sm:max-w-2xl p-0 overflow-hidden gap-0 rounded-2xl border-white/10 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Movies and Series</DialogTitle>
        </DialogHeader>

        {/* Search Input Bar */}
        <div className="flex items-center border-b px-3 bg-card">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Search by title, character, or show..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 text-sm h-12"
            autoFocus
          />
          {isSearching && <Loader2 className="size-4 animate-spin text-primary shrink-0" />}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.trim() === "" ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Type to search movies and TV shows
            </div>
          ) : results.length === 0 && !isSearching ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item) => {
                const isMovie =
                  ("title" in item && Boolean(item.title)) ||
                  ("media_type" in item && item.media_type === "movie")
                const type = isMovie ? "movie" : "tv"
                const title = "title" in item && item.title ? item.title : ("name" in item ? item.name : "")
                const date = "release_date" in item && item.release_date ? item.release_date : ("first_air_date" in item ? item.first_air_date : "")
                const year = date ? new Date(date).getFullYear() : ""
                const posterUrl = getTmdbImageUrl(item.poster_path, "w300")
                const rating = item.vote_average ? item.vote_average.toFixed(1) : null

                return (
                  <Link
                    key={`${item.id}-${type}`}
                    href={`/${type}/${item.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors group cursor-pointer"
                  >
                    <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-muted">
                      {item.poster_path ? (
                        <Image
                          src={posterUrl}
                          alt={title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
                          {isMovie ? <Film className="size-4 opacity-50" /> : <Tv className="size-4 opacity-50" />}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                          {title}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[9px] uppercase px-1 py-0 h-4 font-mono shrink-0"
                        >
                          {type}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        {year && <span>{year}</span>}
                        {rating && (
                          <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                            <Star className="size-3 fill-current" />
                            {rating}
                          </span>
                        )}
                      </div>
                    </div>

                    <ArrowRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                )
              })}

              {query && (
                <div className="pt-2 border-t mt-2">
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center py-2 text-xs font-semibold text-primary hover:underline gap-1.5"
                  >
                    <span>View all results for &ldquo;{query}&rdquo;</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
