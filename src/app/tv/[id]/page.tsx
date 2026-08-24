import * as React from "react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Star,
  Calendar,
  Layers,
  ArrowLeft,
  Tv,
} from "lucide-react"

import { getTvDetails, getTmdbImageUrl } from "@/lib/tmdb"
import { TvPlayerView } from "@/components/tv-player-view"
import { MediaCard } from "@/components/media-card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CastMember, VideoTrailer } from "@/types/tmdb"

interface TvPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ season?: string; episode?: string }>
}

export async function generateMetadata({ params }: TvPageProps): Promise<Metadata> {
  const { id } = await params
  try {
    const tv = await getTvDetails(id)
    return {
      title: `${tv.name} (${new Date(tv.first_air_date || "").getFullYear() || "TV Series"}) - The Player`,
      description: tv.overview || `Watch ${tv.name} online on The Player.`,
      openGraph: {
        images: tv.backdrop_path ? [getTmdbImageUrl(tv.backdrop_path, "original")] : [],
      },
    }
  } catch {
    return {
      title: "TV Series Details - The Player",
    }
  }
}

export default async function TvPage({ params, searchParams }: TvPageProps) {
  const { id } = await params
  const { season, episode } = await searchParams

  const initialSeason = Math.max(1, Number(season) || 1)
  const initialEpisode = Math.max(1, Number(episode) || 1)

  let tv

  try {
    tv = await getTvDetails(id)
  } catch (err) {
    console.error("Failed to load TV details:", err)
    notFound()
  }

  const releaseYear = tv.first_air_date
    ? new Date(tv.first_air_date).getFullYear()
    : "N/A"
  const rating = tv.vote_average ? tv.vote_average.toFixed(1) : null
  const posterUrl = getTmdbImageUrl(tv.poster_path, "w500", "poster")
  const cast = (tv.credits?.cast || []).slice(0, 10)
  const trailers = (tv.videos?.results || []).filter(
    (v: VideoTrailer) => v.site === "YouTube"
  )
  const similarTv = tv.similar?.results || []

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Top Breadcrumb */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-8 py-4">
        <Link
          href="/tv"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to TV Shows</span>
        </Link>
      </div>

      {/* Hero & Player Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-8 space-y-6">
        {/* Dynamic TV Player and Episode Browser */}
        <TvPlayerView
          tv={tv}
          initialSeasonNumber={initialSeason}
          initialEpisodeNumber={initialEpisode}
        />

        {/* TV Info & Synopsis Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-6 border-t border-white/5">
          {/* Left: Poster (3 Cols) */}
          <div className="hidden md:block md:col-span-3">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/5 bg-muted/40 shadow-md">
              {tv.poster_path ? (
                <Image
                  src={posterUrl}
                  alt={tv.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <Tv className="size-10 opacity-40" />
                </div>
              )}
            </div>
          </div>

          {/* Right: Details (9 Cols) */}
          <div className="md:col-span-9 space-y-5">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="font-bold text-xs bg-primary text-primary-foreground">
                TV Series
              </Badge>
              {rating && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-black/50 px-2.5 py-1 rounded-lg border border-white/5 font-mono">
                  <Star className="size-3.5 fill-current" />
                  <span>{rating}</span>
                </div>
              )}
              {tv.genres?.map((g) => (
                <Badge key={g.id} variant="outline" className="text-xs border-white/10 bg-white/5">
                  {g.name}
                </Badge>
              ))}
              <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto font-mono">
                <span className="flex items-center gap-1">
                  <Layers className="size-3.5" />
                  {tv.number_of_seasons} Seasons ({tv.number_of_episodes} Episodes)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {releaseYear}
                </span>
              </div>
            </div>

            {/* Tagline */}
            {tv.tagline && (
              <p className="text-sm italic text-muted-foreground font-serif">
                &ldquo;{tv.tagline}&rdquo;
              </p>
            )}

            {/* Overview */}
            <div className="space-y-1.5">
              <h3 className="font-heading text-sm font-bold text-foreground uppercase tracking-wider">
                Overview
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tv.overview || "No overview available for this title."}
              </p>
            </div>

            {/* Production Studios */}
            {tv.production_companies && tv.production_companies.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">
                  Networks / Studios:{" "}
                </span>
                <span className="text-xs text-foreground font-medium">
                  {tv.production_companies.map((p) => p.name).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Cast, Trailers, and Similar Series Tabs */}
        <div className="pt-8 border-t border-white/5">
          <Tabs defaultValue="cast" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md mb-6 bg-black/40 border border-white/5 p-1 rounded-xl">
              <TabsTrigger value="cast" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-xs">Top Cast</TabsTrigger>
              <TabsTrigger value="trailers" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-xs">
                Trailers {trailers.length > 0 && `(${trailers.length})`}
              </TabsTrigger>
              <TabsTrigger value="similar" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold text-xs">Similar Series</TabsTrigger>
            </TabsList>

            {/* TAB: Top Cast */}
            <TabsContent value="cast" className="space-y-4">
              {cast.length === 0 ? (
                <p className="text-xs text-muted-foreground">No cast information available.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {cast.map((actor: CastMember) => {
                    const profileUrl = actor.profile_path
                      ? getTmdbImageUrl(actor.profile_path, "w300", "profile")
                      : null

                    return (
                      <div
                        key={actor.id}
                        className="flex items-center gap-3 p-2.5 rounded-2xl border border-white/5 bg-card/75"
                      >
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-muted border border-white/10">
                          {profileUrl ? (
                            <Image
                              src={profileUrl}
                              alt={actor.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-xs font-bold text-muted-foreground">
                              {actor.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-heading font-semibold text-xs truncate">
                            {actor.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {actor.character}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            {/* TAB: Trailers */}
            <TabsContent value="trailers" className="space-y-4">
              {trailers.length === 0 ? (
                <p className="text-xs text-muted-foreground">No trailers available.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {trailers.slice(0, 4).map((trailer: VideoTrailer) => (
                    <div
                      key={trailer.id}
                      className="flex flex-col space-y-2 rounded-2xl border border-white/5 p-3 bg-card/75"
                    >
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${trailer.key}`}
                          title={trailer.name}
                          className="size-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <span className="font-heading text-xs font-semibold line-clamp-1">
                        {trailer.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB: Similar TV Shows */}
            <TabsContent value="similar" className="space-y-4">
              {similarTv.length === 0 ? (
                <p className="text-xs text-muted-foreground">No similar series found.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {similarTv.slice(0, 12).map((item) => (
                    <MediaCard key={item.id} item={item} mediaType="tv" />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}
