import * as React from "react"
import type { Metadata } from "next"

import {
  getTrending,
  getPopularMovies,
  getPopularTv,
} from "@/lib/tmdb"
import { HeroBanner } from "@/components/hero-banner"
import { MediaRow } from "@/components/media-row"
import { ContinueWatchingRow } from "@/components/continue-watching-row"
import type { Movie, TvShow } from "@/types/tmdb"

export const metadata: Metadata = {
  title: "The Player - Stream Movies & TV Series Online",
  description:
    "Discover and stream popular and trending movies and TV shows online in HD quality.",
}

export default async function HomePage() {
  // Fetch only essential trending and popular catalogs
  const [trendingRes, popularMoviesRes, popularTvRes] =
    await Promise.allSettled([
      getTrending("all", "day"),
      getPopularMovies(),
      getPopularTv(),
    ])

  const trendingItems =
    trendingRes.status === "fulfilled" ? trendingRes.value.results || [] : []
  const popularMovies =
    popularMoviesRes.status === "fulfilled" ? popularMoviesRes.value.results || [] : []
  const popularTv =
    popularTvRes.status === "fulfilled" ? popularTvRes.value.results || [] : []

  // Select top 6 high-rated trending items with backdrop images for the 30-second carousel
  const featuredHeroes = trendingItems
    .filter(
      (item: Movie | TvShow) =>
        Boolean(item.backdrop_path) &&
        Boolean(item.overview && item.overview.trim().length > 20) &&
        item.vote_average >= 6.0
    )
    .slice(0, 6)

  const heroSlides = featuredHeroes.length > 0 ? featuredHeroes : trendingItems.slice(0, 5)

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Hero Showcase Billboard Carousel */}
      {heroSlides.length > 0 && (
        <section className="container mx-auto max-w-7xl px-4 sm:px-8 pt-4 sm:pt-6">
          <HeroBanner items={heroSlides} />
        </section>
      )}

      {/* Main Streaming Sections */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-8 pt-10 space-y-12">
        {/* Continue Watching Section (Reactive from LocalStorage / Peachify) */}
        <ContinueWatchingRow />

        {/* 1. Trending Now */}
        <MediaRow
          title="Trending Today"
          description="Most watched movies and shows today"
          items={trendingItems}
        />

        {/* 2. Popular Movies */}
        <MediaRow
          title="Popular Movies"
          description="Fan-favorite blockbusters and top trending films"
          items={popularMovies}
          mediaType="movie"
          viewAllHref="/movies?category=popular"
        />

        {/* 3. Popular TV Shows */}
        <MediaRow
          title="Popular TV Shows"
          description="Binge-worthy series and trending TV shows"
          items={popularTv}
          mediaType="tv"
          viewAllHref="/tv?category=popular"
        />
      </div>
    </div>
  )
}
