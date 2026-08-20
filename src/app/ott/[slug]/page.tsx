import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Sparkles, ArrowLeft, Tv } from "lucide-react"

import { discoverByProvider, searchMulti } from "@/lib/tmdb"
import { OTT_LIST } from "@/lib/constants"
import { MediaCard } from "@/components/media-card"
import { CatalogFilterBar } from "@/components/catalog-filter-bar"
import { Badge } from "@/components/ui/badge"
import type { Movie, TvShow } from "@/types/tmdb"
import { cn } from "@/lib/utils"

interface OttPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    type?: "movie" | "tv"
    sort?: string
    region?: string
    q?: string
  }>
}

export async function generateMetadata({
  params,
}: OttPageProps): Promise<Metadata> {
  const { slug } = await params
  const ott = OTT_LIST.find((o) => o.slug === slug)
  if (!ott) return { title: "OTT Platform - The Player" }

  return {
    title: `${ott.name} Movies & TV Shows - The Player`,
    description: `Stream ${ott.name} streaming originals, series, and blockbuster movies on The Player. ${ott.description}`,
  }
}

export default async function OttPage({ params, searchParams }: OttPageProps) {
  const { slug } = await params
  const {
    type = "movie",
    sort = "popularity.desc",
    region = "IN",
    q = "",
  } = await searchParams

  const ott = OTT_LIST.find((o) => o.slug === slug)
  if (!ott) {
    notFound()
  }

  let items: (Movie | TvShow)[] = []
  const searchQuery = q.trim().toLowerCase()

  try {
    if (searchQuery) {
      const res = await searchMulti(searchQuery)
      items = (res.results || []).filter((item: Movie | TvShow) => {
        const itemType = "title" in item ? "movie" : "tv"
        return itemType === type
      })
    } else {
      const res = await discoverByProvider({
        providerId: ott.providerId,
        mediaType: type,
        region,
        sortBy: sort,
      })
      items = res.results || []
    }
  } catch (err) {
    console.error("Failed to load OTT items:", err)
  }

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

        {/* Hero Header with Brand Accent */}
        <div
          className="flex flex-col gap-3 p-6 sm:p-8 rounded-2xl border border-white/5 bg-card text-foreground shadow-md relative overflow-hidden"
          style={{ borderLeft: `6px solid ${ott.color}` }}
        >
          <div className="flex items-center gap-2">
            <Badge
              variant="default"
              className="text-xs uppercase font-bold px-2.5 py-0.5 shadow-sm"
              style={{ backgroundColor: ott.color, color: "#fff" }}
            >
              <Sparkles className="size-3 mr-1" />
              OTT Network
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ backgroundColor: ott.color }}
            >
              <Tv className="size-5" />
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight">
              {ott.name} Originals & Catalog
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            {ott.description}
          </p>

          {/* Sibling OTT Platform Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2">
            {OTT_LIST.map((item) => (
              <Link
                key={item.slug}
                href={`/ott/${item.slug}?type=${type}&sort=${sort}&region=${region}`}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border transition-colors shrink-0 flex items-center gap-2",
                  item.slug === ott.slug
                    ? "border-primary bg-primary/15 text-primary font-semibold shadow-xs"
                    : "border-white/10 bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}</span>
              </Link>
            ))}
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
