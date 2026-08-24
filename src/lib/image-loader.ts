"use client"

import type { ImageLoaderProps } from "next/image"

type TmdbImageType = "backdrop" | "poster" | "profile" | "still"

const TMDB_IMAGE_ORIGIN = "https://image.tmdb.org"
const TMDB_TYPE_PARAM = "tmdb_type"

const TMDB_SIZES: Record<TmdbImageType, Array<[number, string]>> = {
  backdrop: [
    [300, "w300"],
    [780, "w780"],
    [1280, "w1280"],
    [Number.POSITIVE_INFINITY, "original"],
  ],
  poster: [
    [92, "w92"],
    [154, "w154"],
    [185, "w185"],
    [342, "w342"],
    [500, "w500"],
    [780, "w780"],
    [Number.POSITIVE_INFINITY, "original"],
  ],
  profile: [
    [45, "w45"],
    [185, "w185"],
    [Number.POSITIVE_INFINITY, "original"],
  ],
  still: [
    [92, "w92"],
    [185, "w185"],
    [300, "w300"],
    [Number.POSITIVE_INFINITY, "original"],
  ],
}

function isTmdbImageType(value: string | null): value is TmdbImageType {
  return value !== null && value in TMDB_SIZES
}

function getTmdbSize(type: TmdbImageType, width: number): string {
  return TMDB_SIZES[type].find(([maximumWidth]) => width <= maximumWidth)?.[1] ?? "original"
}

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src, "http://localhost")

  if (url.origin === TMDB_IMAGE_ORIGIN) {
    const type = url.searchParams.get(TMDB_TYPE_PARAM)
    url.searchParams.delete(TMDB_TYPE_PARAM)

    if (isTmdbImageType(type)) {
      const size = getTmdbSize(type, width)
      url.pathname = url.pathname.replace(/^\/t\/p\/[^/]+\//, `/t/p/${size}/`)
    }

    return url.toString()
  }

  if (url.hostname === "images.unsplash.com") {
    url.searchParams.set("auto", "format")
    url.searchParams.set("fit", "max")
    url.searchParams.set("w", String(width))
    url.searchParams.set("q", String(quality ?? 75))
    return url.toString()
  }

  return src
}
