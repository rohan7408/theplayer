"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Play,
  Info,
  Star,
  Sparkles,
  Volume2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import type { Movie, TvShow, VideoTrailer } from "@/types/tmdb"
import { getTmdbImageUrl, getMovieVideos, getTvVideos } from "@/lib/tmdb"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export interface HeroBannerProps {
  items?: (Movie | TvShow)[]
  item?: Movie | TvShow
  mediaType?: "movie" | "tv"
}

export function HeroBanner({
  items,
  item,
  mediaType,
}: HeroBannerProps) {
  // Normalize items array
  const slides = React.useMemo(() => {
    if (items && items.length > 0) return items
    if (item) return [item]
    return []
  }, [items, item])

  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)
  const [trailerKey, setTrailerKey] = React.useState<string | null>(null)
  const [isTrailerOpen, setIsTrailerOpen] = React.useState(false)

  // Touch drag tracking for smooth mobile swipe
  const [touchStart, setTouchStart] = React.useState<number | null>(null)
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null)

  const currentItem = slides[currentIndex] || slides[0]

  // 3-Second Smooth Auto-play Timer
  React.useEffect(() => {
    if (slides.length <= 1 || isPaused || isTrailerOpen) return

    const timer = setInterval(() => {
      setTrailerKey(null)
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 3000)

    return () => clearInterval(timer)
  }, [slides.length, isPaused, isTrailerOpen])

  const goToNext = React.useCallback(() => {
    setTrailerKey(null)
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const goToPrev = React.useCallback(() => {
    setTrailerKey(null)
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  const goToIndex = (idx: number) => {
    setTrailerKey(null)
    setCurrentIndex(idx)
  }

  // Handle touch gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const minSwipeDistance = 40

    if (distance > minSwipeDistance) {
      goToNext()
    } else if (distance < -minSwipeDistance) {
      goToPrev()
    }
  }

  // Fetch trailer when user opens trailer modal
  const fetchTrailer = async (mediaItem: Movie | TvShow) => {
    try {
      const isMov =
        mediaType === "movie" ||
        ("title" in mediaItem && mediaItem.title !== undefined) ||
        ("media_type" in mediaItem && mediaItem.media_type === "movie")

      const res = isMov
        ? await getMovieVideos(mediaItem.id)
        : await getTvVideos(mediaItem.id)

      const trailers = res.results || []
      const official =
        trailers.find(
          (v: VideoTrailer) =>
            v.site === "YouTube" &&
            (v.type === "Trailer" || v.type === "Teaser") &&
            v.official
        ) ||
        trailers.find(
          (v: VideoTrailer) =>
            v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
        ) ||
        trailers[0]

      if (official?.key) {
        setTrailerKey(official.key)
      }
    } catch (err) {
      console.warn("Failed to fetch trailer:", err)
    }
  }

  if (!currentItem) return null

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-black text-white shadow-2xl border border-white/10 group select-none"
    >
      {/* Background Slides with Crossfade & Ken Burns Zoom */}
      <div className="relative aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9] w-full min-h-[440px] sm:min-h-[480px] overflow-hidden">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex
          const backdropUrl = getTmdbImageUrl(slide.backdrop_path, "original", "backdrop")
          const posterFallback = getTmdbImageUrl(slide.poster_path, "original", "poster")
          const slideTitle =
            "title" in slide && slide.title
              ? slide.title
              : ("name" in slide && slide.name
              ? slide.name
              : "Featured")

          return (
            <div
              key={String(slide.id)}
              className={cn(
                "absolute inset-0 size-full transition-opacity duration-1000 ease-in-out pointer-events-none",
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            >
              {slide.backdrop_path || slide.poster_path ? (
                <Image
                  src={backdropUrl || posterFallback}
                  alt={slideTitle}
                  fill
                  priority={idx < 2}
                  sizes="100vw"
                  className={cn(
                    "object-cover object-center sm:object-top opacity-55 transition-transform duration-3000 ease-out",
                    isActive ? "scale-105" : "scale-100"
                  )}
                />
              ) : (
                <div className="size-full bg-gradient-to-br from-zinc-950 via-neutral-950 to-black" />
              )}
            </div>
          )
        })}

        {/* Ambient Red Glow */}
        <div className="absolute -top-24 -left-24 size-96 bg-primary/20 rounded-full blur-3xl pointer-events-none z-15" />

        {/* Responsive Gradient overlays for seamless mobile readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent sm:via-background/50 z-15 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent w-full md:w-3/4 z-15 pointer-events-none" />
      </div>

      {/* Content Container (Layered with Smooth Transitions) */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 md:p-14 max-w-3xl space-y-3 sm:space-y-4 z-20">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex
          if (!isActive) return null

          const isMov =
            mediaType === "movie" ||
            ("title" in slide && slide.title !== undefined) ||
            ("media_type" in slide && slide.media_type === "movie")

          const slideType = isMov ? "movie" : "tv"
          const slideTitle =
            "title" in slide && slide.title
              ? slide.title
              : ("name" in slide && slide.name
              ? slide.name
              : "Featured")

          const slideDate =
            "release_date" in slide && slide.release_date
              ? slide.release_date
              : ("first_air_date" in slide && slide.first_air_date
              ? slide.first_air_date
              : "")

          const slideYear = slideDate ? new Date(slideDate).getFullYear() : ""
          const slideRating = slide.vote_average
            ? slide.vote_average.toFixed(1)
            : null
          const watchHref = `/${slideType}/${slide.id}`

          return (
            <div
              key={String(slide.id)}
              className="space-y-3 sm:space-y-4 transition-all duration-700 ease-out animate-in fade-in slide-in-from-bottom-3"
            >
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Badge
                  variant="default"
                  className="bg-primary text-primary-foreground font-bold uppercase text-[9px] sm:text-[10px] tracking-wider px-2 sm:px-2.5 py-0.5 shadow-md shadow-primary/30"
                >
                  <Sparkles className="size-2.5 sm:size-3 mr-1" />
                  Trending {slideType === "movie" ? "Movie" : "Series"}
                </Badge>

                {slideRating && (
                  <div className="flex items-center gap-1 rounded-md bg-black/70 px-1.5 sm:px-2 py-0.5 text-[11px] font-bold text-amber-400 backdrop-blur-md border border-white/10 font-mono">
                    <Star className="size-3 fill-current" />
                    <span>{slideRating}</span>
                  </div>
                )}

                {slideYear && (
                  <span className="text-[11px] font-semibold text-white/80 font-mono bg-white/10 px-1.5 sm:px-2 py-0.5 rounded-md backdrop-blur-md">
                    {slideYear}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-heading text-xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md line-clamp-2">
                {slideTitle}
              </h1>

              {/* Overview Synopsis */}
              {slide.overview && (
                <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-2xl drop-shadow-sm font-normal">
                  {slide.overview}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
                <Link
                  href={watchHref}
                  className={cn(
                    buttonVariants({ size: "default" }),
                    "font-heading font-bold gap-2 cursor-pointer shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all bg-primary text-primary-foreground h-9 sm:h-11 px-4 sm:px-6 rounded-xl text-xs sm:text-sm"
                  )}
                >
                  <Play className="size-4 fill-current" />
                  Watch Now
                </Link>

                {/* Trailer Dialog */}
                <Dialog
                  open={isTrailerOpen}
                  onOpenChange={(open) => {
                    setIsTrailerOpen(open)
                    if (open && !trailerKey) {
                      fetchTrailer(slide)
                    }
                  }}
                >
                  <DialogTrigger
                    render={
                      <Button
                        variant="outline"
                        size="default"
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md cursor-pointer gap-1.5 sm:gap-2 h-9 sm:h-11 px-3.5 sm:px-5 rounded-xl font-medium text-xs sm:text-sm"
                      />
                    }
                  >
                    <Volume2 className="size-3.5 sm:size-4" />
                    Trailer
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] sm:max-w-3xl p-2 bg-black border-zinc-800 rounded-2xl">
                    <DialogHeader className="px-3 pt-2">
                      <DialogTitle className="text-white text-xs sm:text-sm truncate">
                        {slideTitle} - Official Trailer
                      </DialogTitle>
                    </DialogHeader>
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                      {trailerKey ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                          title={`${slideTitle} Trailer`}
                          className="size-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                          Loading trailer...
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Link
                  href={watchHref}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "default" }),
                    "text-white/80 hover:text-white hover:bg-white/10 cursor-pointer gap-1.5 h-9 sm:h-11 px-3 sm:px-4 rounded-xl text-xs sm:text-sm hidden xs:inline-flex"
                  )}
                >
                  <Info className="size-3.5 sm:size-4" />
                  Details
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Carousel Navigation Arrows */}
      {slides.length > 1 && (
        <>
          {/* Previous Slide Button */}
          <button
            type="button"
            onClick={goToPrev}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 size-11 items-center justify-center rounded-full bg-black/60 text-white/90 hover:text-white hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md border border-white/10 cursor-pointer z-30 hover:scale-105 active:scale-95"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="size-6" />
          </button>

          {/* Next Slide Button */}
          <button
            type="button"
            onClick={goToNext}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 size-11 items-center justify-center rounded-full bg-black/60 text-white/90 hover:text-white hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md border border-white/10 cursor-pointer z-30 hover:scale-105 active:scale-95"
            aria-label="Next Slide"
          >
            <ChevronRight className="size-6" />
          </button>

          {/* Bottom Right Slide Indicator Pills */}
          <div className="absolute bottom-3 right-4 sm:bottom-8 sm:right-8 z-30 flex items-center gap-1.5 sm:gap-2 bg-black/60 px-2.5 py-1 sm:px-3.5 sm:py-2 rounded-full backdrop-blur-md border border-white/10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToIndex(idx)}
                className={cn(
                  "h-1.5 sm:h-2 rounded-full transition-all duration-500 ease-out cursor-pointer",
                  idx === currentIndex
                    ? "w-5 sm:w-7 bg-primary shadow-xs shadow-primary"
                    : "w-1.5 sm:w-2 bg-white/30 hover:bg-white/60"
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
