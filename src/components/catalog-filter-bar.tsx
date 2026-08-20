"use client"

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Film, Tv, Flame, Star, Sparkles, Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface CatalogFilterBarProps {
  currentType: "movie" | "tv"
  currentSort: string
  currentQuery?: string
  className?: string
}

export function CatalogFilterBar({
  currentType,
  currentSort,
  currentQuery = "",
  className,
}: CatalogFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [prevQuery, setPrevQuery] = React.useState(currentQuery)
  const [searchInput, setSearchInput] = React.useState(currentQuery)

  // Sync state during render when prop changes (React recommended pattern)
  if (prevQuery !== currentQuery) {
    setPrevQuery(currentQuery)
    setSearchInput(currentQuery)
  }

  // Helper to build updated query URL
  const updateUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrl({ q: searchInput.trim() || undefined })
  }

  const sortOptions = [
    {
      key: "popularity.desc",
      label: "Popular",
      icon: Flame,
    },
    {
      key: "vote_average.desc",
      label: "Top Rated",
      icon: Star,
    },
    {
      key: currentType === "movie" ? "primary_release_date.desc" : "first_air_date.desc",
      label: "New Releases",
      icon: Sparkles,
    },
  ]

  // Detect active sort key
  const isNewActive =
    currentSort === "primary_release_date.desc" || currentSort === "first_air_date.desc"
  const isTopRatedActive = currentSort === "vote_average.desc"
  const isPopularActive = !isNewActive && !isTopRatedActive

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-3.5 rounded-2xl border border-white/5 bg-card/75 backdrop-blur-xl shadow-lg",
        className
      )}
    >
      {/* Left: Media Type Switcher & Sort Options */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Media Type (Movie / TV) */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => updateUrl({ type: "movie" })}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              currentType === "movie"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Film className="size-3.5" />
            <span>Movies</span>
          </button>
          <button
            type="button"
            onClick={() => updateUrl({ type: "tv" })}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              currentType === "tv"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Tv className="size-3.5" />
            <span>TV Series</span>
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="hidden sm:block h-6 w-px bg-white/10" />

        {/* Sort Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {sortOptions.map((opt) => {
            const Icon = opt.icon
            const isSelected =
              (opt.label === "Popular" && isPopularActive) ||
              (opt.label === "Top Rated" && isTopRatedActive) ||
              (opt.label === "New Releases" && isNewActive)

            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => updateUrl({ sort: opt.key })}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer",
                  isSelected
                    ? "bg-white/10 text-white border border-white/15 font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon className={cn("size-3.5", isSelected ? "text-primary" : "")} />
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: In-Catalog Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative min-w-[240px] md:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={`Search ${currentType === "movie" ? "movies" : "shows"}...`}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-8.5 pr-8 h-9 text-xs bg-black/40 border-white/10 focus-visible:bg-black/70 focus-visible:border-primary/50"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("")
              updateUrl({ q: undefined })
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        )}
      </form>
    </div>
  )
}
