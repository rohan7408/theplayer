import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Sparkles, ArrowLeft, Film, Globe, Flame } from "lucide-react"

import { discoverByLanguage, searchMulti } from "@/lib/tmdb"
import { CATEGORIES_LIST } from "@/lib/constants"
import { MediaCard } from "@/components/media-card"
import { CatalogFilterBar } from "@/components/catalog-filter-bar"
import { Badge } from "@/components/ui/badge"
import type { Movie, TvShow } from "@/types/tmdb"
import { cn } from "@/lib/utils"

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  bollywood: Film,
  hollywood: Globe,
  "south-indian": Flame,
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ type?: "movie" | "tv"; sort?: string; q?: string }>
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = CATEGORIES_LIST.find((c) => c.slug === slug)
  if (!category) return { title: "Category - The Player" }

  return {
    title: `${category.name} Movies & TV Series - The Player`,
    description: `Stream the latest and top rated ${category.name} cinema online. ${category.description}`,
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params
  const { type = "movie", sort = "popularity.desc", q = "" } = await searchParams

  const category = CATEGORIES_LIST.find((c) => c.slug === slug)
  if (!category) {
    notFound()
  }

  let items: (Movie | TvShow)[] = []
  const searchQuery = q.trim().toLowerCase()

  try {
    if (searchQuery) {
      const res = await searchMulti(searchQuery)
      const valid = (res.results || []).filter((item: Movie | TvShow) => {
        const itemType = "title" in item ? "movie" : "tv"
        if (itemType !== type) return false

        const lang = item.original_language
        const allowedLangs = category.language.split("|")
        return allowedLangs.includes(lang || "")
      })
      items = valid
    } else {
      const res = await discoverByLanguage({
        language: category.language,
        originCountry: category.originCountry,
        mediaType: type,
        sortBy: sort,
      })
      items = res.results || []
    }
  } catch (err) {
    console.error("Failed to load category items:", err)
  }

  const HeaderIcon = categoryIconMap[category.slug] || Globe

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
              Category
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Lang: {category.language.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <HeaderIcon className="size-5" />
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight">
              {category.name} Cinema
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            {category.description}
          </p>

          {/* Sibling Category Pills with Lucide Icons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2">
            {CATEGORIES_LIST.map((cat) => {
              const CatIcon = categoryIconMap[cat.slug] || Film
              const isSelected = cat.slug === category.slug

              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}?type=${type}&sort=${sort}`}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors shrink-0",
                    isSelected
                      ? "border-primary bg-primary/15 text-primary font-semibold shadow-xs"
                      : "border-white/10 bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <CatIcon className="size-3" />
                  <span>{cat.name}</span>
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
