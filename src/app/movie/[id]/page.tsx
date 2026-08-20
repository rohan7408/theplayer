import * as React from "react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Star,
  Clock,
  Calendar,
  Layers,
  ArrowLeft,
  Play,
  User,
} from "lucide-react"

import { getMovieDetails, getTmdbImageUrl, isFutureDate } from "@/lib/tmdb"
import { PeachifyPlayer } from "@/components/peachify-player"
import { MediaCard } from "@/components/media-card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CastMember, VideoTrailer, Genre } from "@/types/tmdb"

interface MoviePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const { id } = await params
  try {
    const movie = await getMovieDetails(id)
    return {
      title: `${movie.title} (${movie.release_date ? new Date(movie.release_date).getFullYear() : "Movie"}) - WatchMe`,
      description:
        movie.overview ||
        `Stream ${movie.title} online in high definition on WatchMe.`,
      openGraph: {
        title: `${movie.title} - WatchMe`,
        description: movie.overview,
        images: movie.backdrop_path
          ? [getTmdbImageUrl(movie.backdrop_path, "original")]
          : [],
      },
    }
  } catch {
    return {
      title: "Movie - WatchMe",
    }
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params
  let movie

  try {
    movie = await getMovieDetails(id)
  } catch (err) {
    console.error("Failed to load movie details:", err)
    notFound()
  }

  const isFutureRelease = isFutureDate(movie.release_date)
  const formattedReleaseDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "TBD"

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A"
  const runtimeHours = movie.runtime ? Math.floor(movie.runtime / 60) : 0
  const runtimeMinutes = movie.runtime ? movie.runtime % 60 : 0
  const formattedRuntime =
    movie.runtime > 0
      ? `${runtimeHours > 0 ? `${runtimeHours}h ` : ""}${runtimeMinutes}m`
      : "N/A"

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null
  const posterUrl = getTmdbImageUrl(movie.poster_path, "w500")
  const cast = (movie.credits?.cast || []).slice(0, 10)
  const trailers = (movie.videos?.results || []).filter(
    (v: VideoTrailer) => v.site === "YouTube"
  )
  const primaryTrailer =
    trailers.find((t) => t.type === "Trailer" && t.site === "YouTube") ||
    trailers[0]
  const similarMovies = movie.similar?.results || []

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Top Breadcrumb */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-8 py-4">
        <Link
          href="/movies"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Movies</span>
        </Link>
      </div>

      {/* Hero / Player Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-8 space-y-6">
        {/* Video Player or Unreleased Coming Soon Frame */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {movie.title}
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-white/10 bg-white/5">
                {releaseYear}
              </Badge>
            </div>
            {rating && (
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm bg-black/50 px-2.5 py-1 rounded-lg border border-white/5 font-mono">
                <Star className="size-4 fill-current" />
                <span>{rating}</span>
              </div>
            )}
          </div>

          {isFutureRelease ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs sm:text-sm">
                <Calendar className="size-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">
                    Unreleased Movie — Coming Soon ({formattedReleaseDate})
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    This movie is scheduled to release on {formattedReleaseDate}. Full streaming will become available upon its public release.
                  </p>
                </div>
              </div>

              {primaryTrailer ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Play className="size-3.5 text-primary fill-current" />
                    <span>Official Trailer</span>
                  </div>
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl border border-white/5">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${primaryTrailer.key}?autoplay=0&rel=0`}
                      title={`${movie.title} Trailer`}
                      className="size-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-card border border-white/5 flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <Clock className="size-10 text-muted-foreground/60" />
                  <h3 className="font-heading font-bold text-lg text-foreground">
                    Releasing on {formattedReleaseDate}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Streaming links will be automatically enabled once this movie premieres publicly.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <PeachifyPlayer
              config={{
                type: "movie",
                mediaId: movie.id,
                autoPlay: true,
              }}
              autoResume={true}
              className="shadow-2xl border border-white/5 rounded-2xl overflow-hidden"
            />
          )}
        </div>

        {/* Movie Info & Synopsis Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-6 border-t border-white/5">
          {/* Left: Poster Image (3 Cols) */}
          <div className="hidden md:block md:col-span-3">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/5 bg-muted/40 shadow-md">
              {movie.poster_path ? (
                <Image
                  src={posterUrl}
                  alt={movie.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  No Poster
                </div>
              )}
            </div>
          </div>

          {/* Right: Metadata & Synopsis (9 Cols) */}
          <div className="md:col-span-9 space-y-5">
            {/* Quick Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="text-xs font-semibold bg-primary text-primary-foreground">
                Movie
              </Badge>

              {movie.genres?.map((genre: Genre) => (
                <Link key={genre.id} href={`/genre/${genre.name.toLowerCase().replace(/\s+/g, "-")}`}>
                  <Badge
                    variant="outline"
                    className="text-xs hover:border-primary hover:text-primary transition-colors cursor-pointer border-white/10"
                  >
                    {genre.name}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Quick Metadata Details */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-muted-foreground">
              {movie.runtime > 0 && (
                <div className="flex items-center gap-1.5 font-mono">
                  <Clock className="size-4 text-primary" />
                  <span>{formattedRuntime}</span>
                </div>
              )}

              {movie.release_date && (
                <div className="flex items-center gap-1.5 font-mono">
                  <Calendar className="size-4 text-primary" />
                  <span>{movie.release_date}</span>
                </div>
              )}

              {movie.original_language && (
                <div className="flex items-center gap-1.5 font-mono uppercase">
                  <Layers className="size-4 text-primary" />
                  <span>Audio: {movie.original_language}</span>
                </div>
              )}
            </div>

            {/* Tagline */}
            {movie.tagline && (
              <p className="text-sm font-medium italic text-primary/90 border-l-2 border-primary pl-3">
                &ldquo;{movie.tagline}&rdquo;
              </p>
            )}

            {/* Overview / Storyline */}
            <div className="space-y-2">
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Storyline
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
                {movie.overview || "No overview available for this title."}
              </p>
            </div>
          </div>
        </div>

        {/* Cast, Trailers, and More Info Tabs */}
        <div className="pt-6">
          <Tabs defaultValue="cast" className="w-full">
            <TabsList className="bg-card border border-white/5 p-1 rounded-xl">
              <TabsTrigger value="cast" className="text-xs cursor-pointer">
                Top Cast ({cast.length})
              </TabsTrigger>
              {trailers.length > 0 && (
                <TabsTrigger value="trailers" className="text-xs cursor-pointer">
                  Trailers ({trailers.length})
                </TabsTrigger>
              )}
            </TabsList>

            {/* Cast Tab Content */}
            <TabsContent value="cast" className="pt-4">
              {cast.length === 0 ? (
                <p className="text-xs text-muted-foreground">No cast information listed.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {cast.map((actor: CastMember) => {
                    const profileUrl = getTmdbImageUrl(actor.profile_path, "w300")
                    return (
                      <div
                        key={actor.id}
                        className="flex items-center gap-2.5 p-2 rounded-xl border border-white/5 bg-card hover:bg-muted/40 transition-colors"
                      >
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted/60">
                          {actor.profile_path ? (
                            <Image
                              src={profileUrl}
                              alt={actor.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-muted-foreground">
                              <User className="size-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-heading font-semibold text-xs text-foreground truncate">
                            {actor.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {actor.character}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            {/* Trailers Tab Content */}
            {trailers.length > 0 && (
              <TabsContent value="trailers" className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {trailers.map((trailer: VideoTrailer) => (
                    <div
                      key={trailer.id}
                      className="overflow-hidden rounded-xl border border-white/5 bg-card space-y-2 p-2 shadow-xs"
                    >
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${trailer.key}`}
                          title={trailer.name}
                          className="size-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <p className="text-xs font-semibold text-foreground line-clamp-1 px-1">
                        {trailer.name}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Similar Movies Row */}
        {similarMovies.length > 0 && (
          <div className="pt-8 space-y-4">
            <h2 className="font-heading text-lg font-bold text-foreground">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {similarMovies.slice(0, 6).map((item) => (
                <MediaCard key={item.id} item={item} mediaType="movie" />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
