import type {
  Movie,
  MovieDetails,
  TvShow,
  TvDetails,
  SeasonDetails,
  CreditsResponse,
  VideosResponse,
  TmdbPaginatedResponse,
  Genre,
} from "@/types/tmdb"

const TMDB_API_KEY =
  process.env.TMDB_API_KEY || "9e8cfe2baf80459dbf937a0cb723d861"
const TMDB_API_BASE_URL =
  process.env.TMDB_API_BASE_URL || "https://api.themoviedb.org/3"

/**
 * In-Memory Request Cache with 10-minute TTL to prevent duplicate API hits
 */
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry<unknown>>()
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

/**
 * Concurrency Limiter & Rate Limiter Queue for TMDB API
 * Limits concurrent outbound requests to max 5 with 50ms pacing interval.
 */
class RequestQueue {
  private queue: (() => Promise<void>)[] = []
  private running = 0
  private maxConcurrent = 5
  private minIntervalMs = 50
  private lastRequestTime = 0

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const task = async () => {
        try {
          const now = Date.now()
          const timeSinceLast = now - this.lastRequestTime
          if (timeSinceLast < this.minIntervalMs) {
            await new Promise((r) => setTimeout(r, this.minIntervalMs - timeSinceLast))
          }
          this.lastRequestTime = Date.now()

          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          this.running--
          this.next()
        }
      }

      this.queue.push(task)
      this.next()
    })
  }

  private next() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) return
    const task = this.queue.shift()
    if (task) {
      this.running++
      task()
    }
  }
}

const tmdbQueue = new RequestQueue()

/**
 * Helper to build TMDB image URLs
 */
export function getTmdbImageUrl(
  path: string | null | undefined,
  size: "w300" | "w500" | "w780" | "w1280" | "original" = "w500"
): string {
  if (!path) {
    return "/images/placeholder-poster.png"
  }
  if (path.startsWith("http")) {
    return path
  }
  return `https://image.tmdb.org/t/p/${size}${path}`
}

/**
 * Core TMDB API fetcher with Rate Limiting, 429 Retry Backoff, and In-Memory Caching
 */
export async function fetchTmdb<T>(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined> = {},
  retries = 2
): Promise<T> {
  const cleanParams: Record<string, string> = {
    api_key: TMDB_API_KEY,
  }

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      cleanParams[key] = String(value)
    }
  }

  const queryString = new URLSearchParams(cleanParams).toString()
  const url = `${TMDB_API_BASE_URL}${endpoint}?${queryString}`

  // Check In-Memory Cache first
  const cached = memoryCache.get(url)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T
  }

  return tmdbQueue.add(async () => {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 3600, // 1 hour Next.js cache
        },
      })

      // Handle 429 Rate Limiting
      if (response.status === 429) {
        if (retries > 0) {
          const retryAfterHeader = response.headers.get("Retry-After")
          const delayMs = retryAfterHeader
            ? parseInt(retryAfterHeader, 10) * 1000
            : 1000 * (3 - retries)

          console.warn(`[TMDB 429 Rate Limit] Backing off for ${delayMs}ms before retrying ${endpoint}...`)
          await new Promise((r) => setTimeout(r, delayMs))
          return fetchTmdb<T>(endpoint, params, retries - 1)
        }
        throw new Error(`TMDB Rate Limit Exceeded (429) for endpoint: ${endpoint}`)
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "")
        throw new Error(
          `TMDB API Error [${response.status} ${response.statusText}]: ${endpoint} - ${errorText}`
        )
      }

      const data = (await response.json()) as T

      // Save to in-memory cache
      memoryCache.set(url, {
        data,
        expiresAt: Date.now() + CACHE_TTL_MS,
      })

      // Evict old cache entries if map exceeds 300 items
      if (memoryCache.size > 300) {
        const now = Date.now()
        for (const [k, v] of memoryCache.entries()) {
          if (v.expiresAt < now) memoryCache.delete(k)
        }
      }

      return data
    } catch (error) {
      if (retries > 0 && !(error instanceof Error && error.message.includes("429"))) {
        await new Promise((r) => setTimeout(r, 400))
        return fetchTmdb<T>(endpoint, params, retries - 1)
      }
      throw error
    }
  })
}

/**
 * Check if a date string is in the future
 */
export function isFutureDate(dateStr?: string | null): boolean {
  if (!dateStr) return false
  const today = new Date().toISOString().split("T")[0]
  return dateStr > today
}

/**
 * Quality & Release Date Filter Helper
 * Completely filters out unreleased future titles, placeholder cards with missing posters, and junk entries.
 */
export function cleanResults<T extends Movie | TvShow>(results: T[] = []): T[] {
  return results.filter((item) => {
    // Check if release date is in the future
    const dateStr =
      "release_date" in item && item.release_date
        ? item.release_date
        : "first_air_date" in item && item.first_air_date
        ? item.first_air_date
        : ""

    if (isFutureDate(dateStr)) {
      return false
    }

    return (
      Boolean(item.poster_path) &&
      Boolean(item.overview && item.overview.trim().length > 10) &&
      (item.vote_count === undefined || item.vote_count >= 0)
    )
  })
}

/**
 * Fetch Trending Movies and TV Shows (Day or Week)
 */
export async function getTrending(
  mediaType: "all" | "movie" | "tv" = "all",
  timeWindow: "day" | "week" = "day"
): Promise<TmdbPaginatedResponse<Movie | TvShow>> {
  const res = await fetchTmdb<TmdbPaginatedResponse<Movie | TvShow>>(
    `/trending/${mediaType}/${timeWindow}`
  )
  return {
    ...res,
    results: cleanResults(res.results || []),
  }
}

/**
 * Fetch Popular Movies
 */
export async function getPopularMovies(page = 1): Promise<TmdbPaginatedResponse<Movie>> {
  const today = new Date().toISOString().split("T")[0]
  const res = await fetchTmdb<TmdbPaginatedResponse<Movie>>("/discover/movie", {
    sort_by: "popularity.desc",
    "primary_release_date.lte": today,
    "vote_count.gte": 10,
    page,
    include_adult: false,
  })
  return {
    ...res,
    results: cleanResults(res.results || []),
  }
}

/**
 * Fetch Top Rated Movies
 */
export async function getTopRatedMovies(page = 1): Promise<TmdbPaginatedResponse<Movie>> {
  const today = new Date().toISOString().split("T")[0]
  const res = await fetchTmdb<TmdbPaginatedResponse<Movie>>("/discover/movie", {
    sort_by: "vote_average.desc",
    "primary_release_date.lte": today,
    "vote_count.gte": 100,
    "vote_average.gte": 6.0,
    page,
    include_adult: false,
  })
  return {
    ...res,
    results: cleanResults(res.results || []),
  }
}

/**
 * Fetch Now Playing Movies
 */
export async function getNowPlayingMovies(page = 1): Promise<TmdbPaginatedResponse<Movie>> {
  const today = new Date().toISOString().split("T")[0]
  const res = await fetchTmdb<TmdbPaginatedResponse<Movie>>("/discover/movie", {
    sort_by: "popularity.desc",
    "primary_release_date.lte": today,
    "vote_count.gte": 10,
    page,
    include_adult: false,
  })
  return {
    ...res,
    results: cleanResults(res.results || []),
  }
}

/**
 * Fetch Upcoming Movies (Released recently in theaters)
 */
export async function getUpcomingMovies(page = 1): Promise<TmdbPaginatedResponse<Movie>> {
  const today = new Date().toISOString().split("T")[0]
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]

  const res = await fetchTmdb<TmdbPaginatedResponse<Movie>>("/discover/movie", {
    sort_by: "primary_release_date.desc",
    "primary_release_date.lte": today,
    "primary_release_date.gte": oneYearAgo,
    "vote_count.gte": 10,
    page,
    include_adult: false,
  })
  return {
    ...res,
    results: cleanResults(res.results || []),
  }
}

/**
 * Fetch Popular TV Shows
 */
export async function getPopularTv(page = 1): Promise<TmdbPaginatedResponse<TvShow>> {
  const today = new Date().toISOString().split("T")[0]
  const res = await fetchTmdb<TmdbPaginatedResponse<TvShow>>("/discover/tv", {
    sort_by: "popularity.desc",
    "first_air_date.lte": today,
    "vote_count.gte": 5,
    page,
    include_adult: false,
  })
  return {
    ...res,
    results: cleanResults(res.results || []),
  }
}

/**
 * Fetch Top Rated TV Shows
 */
export async function getTopRatedTv(page = 1): Promise<TmdbPaginatedResponse<TvShow>> {
  const today = new Date().toISOString().split("T")[0]
  const res = await fetchTmdb<TmdbPaginatedResponse<TvShow>>("/discover/tv", {
    sort_by: "vote_average.desc",
    "first_air_date.lte": today,
    "vote_count.gte": 80,
    "vote_average.gte": 6.0,
    page,
    include_adult: false,
  })
  return {
    ...res,
    results: cleanResults(res.results || []),
  }
}

/**
 * Fetch On The Air TV Shows
 */
export async function getOnTheAirTv(page = 1): Promise<TmdbPaginatedResponse<TvShow>> {
  const today = new Date().toISOString().split("T")[0]
  const res = await fetchTmdb<TmdbPaginatedResponse<TvShow>>("/discover/tv", {
    sort_by: "popularity.desc",
    "first_air_date.lte": today,
    "vote_count.gte": 5,
    page,
    include_adult: false,
  })
  return {
    ...res,
    results: cleanResults(res.results || []),
  }
}

/**
 * Fetch Complete Movie Details
 */
export async function getMovieDetails(id: string | number): Promise<MovieDetails> {
  return fetchTmdb<MovieDetails>(`/movie/${id}`, {
    append_to_response: "credits,videos,similar,recommendations",
  })
}

/**
 * Fetch Movie Credits
 */
export async function getMovieCredits(id: string | number): Promise<CreditsResponse> {
  return fetchTmdb<CreditsResponse>(`/movie/${id}/credits`)
}

/**
 * Fetch Movie Videos / Trailers
 */
export async function getMovieVideos(id: string | number): Promise<VideosResponse> {
  return fetchTmdb<VideosResponse>(`/movie/${id}/videos`)
}

/**
 * Fetch Similar Movies
 */
export async function getSimilarMovies(
  id: string | number,
  page = 1
): Promise<TmdbPaginatedResponse<Movie>> {
  const res = await fetchTmdb<TmdbPaginatedResponse<Movie>>(`/movie/${id}/similar`, { page })
  return {
    ...res,
    results: cleanResults(res.results || []),
  }
}

/**
 * Fetch Complete TV Show Details
 */
export async function getTvDetails(id: string | number): Promise<TvDetails> {
  return fetchTmdb<TvDetails>(`/tv/${id}`, {
    append_to_response: "credits,videos,similar,recommendations",
  })
}

/**
 * Fetch TV Show Season Details
 */
export async function getTvSeasonDetails(
  tvId: string | number,
  seasonNumber: number
): Promise<SeasonDetails> {
  return fetchTmdb<SeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`)
}

/**
 * Fetch TV Show Videos / Trailers
 */
export async function getTvVideos(id: string | number): Promise<VideosResponse> {
  return fetchTmdb<VideosResponse>(`/tv/${id}/videos`)
}

/**
 * Fetch Similar TV Shows
 */
export async function getSimilarTv(
  id: string | number,
  page = 1
): Promise<TmdbPaginatedResponse<TvShow>> {
  const res = await fetchTmdb<TmdbPaginatedResponse<TvShow>>(`/tv/${id}/similar`, { page })
  return {
    ...res,
    results: cleanResults(res.results || []),
  }
}

/**
 * Multi Search across Movies and TV shows
 */
export async function searchMulti(
  query: string,
  page = 1
): Promise<TmdbPaginatedResponse<Movie | TvShow>> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 }
  }
  const res = await fetchTmdb<TmdbPaginatedResponse<Movie | TvShow>>("/search/multi", {
    query: query.trim(),
    page,
    include_adult: false,
  })
  return {
    ...res,
    results: cleanResults(res.results || []),
  }
}

/**
 * Discover by Industry / Language (Bollywood, Hollywood, South Indian)
 */
export async function discoverByLanguage(params: {
  language: string
  originCountry?: string
  mediaType?: "movie" | "tv"
  sortBy?: string
  page?: number
}): Promise<TmdbPaginatedResponse<Movie | TvShow>> {
  const {
    language,
    originCountry,
    mediaType = "movie",
    sortBy = "popularity.desc",
    page = 1,
  } = params

  const endpoint = mediaType === "movie" ? "/discover/movie" : "/discover/tv"
  const isTopRated = sortBy === "vote_average.desc"
  const isNew = sortBy === "primary_release_date.desc" || sortBy === "first_air_date.desc"

  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]

  const res = await fetchTmdb<TmdbPaginatedResponse<Movie | TvShow>>(endpoint, {
    with_original_language: language,
    with_origin_country: originCountry,
    sort_by: sortBy,
    "vote_count.gte": isTopRated ? 50 : isNew ? 10 : 5,
    "vote_average.gte": isTopRated ? 6.0 : undefined,
    "primary_release_date.lte": today,
    "primary_release_date.gte": isNew && mediaType === "movie" ? oneYearAgo : undefined,
    "first_air_date.lte": today,
    "first_air_date.gte": isNew && mediaType === "tv" ? oneYearAgo : undefined,
    "with_runtime.gte": mediaType === "movie" ? 50 : undefined,
    page,
    include_adult: false,
  })

  return {
    ...res,
    results: cleanResults(res.results || []),
  }
}

/**
 * Discover by OTT Watch Provider (Netflix, Prime, Disney+, Apple TV, etc.)
 */
export async function discoverByProvider(params: {
  providerId: number | string
  mediaType?: "movie" | "tv"
  region?: string
  sortBy?: string
  page?: number
}): Promise<TmdbPaginatedResponse<Movie | TvShow>> {
  const {
    providerId,
    mediaType = "movie",
    region = "IN",
    sortBy = "popularity.desc",
    page = 1,
  } = params

  const endpoint = mediaType === "movie" ? "/discover/movie" : "/discover/tv"
  const isTopRated = sortBy === "vote_average.desc"
  const isNew = sortBy === "primary_release_date.desc" || sortBy === "first_air_date.desc"

  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]

  const res = await fetchTmdb<TmdbPaginatedResponse<Movie | TvShow>>(endpoint, {
    with_watch_providers: String(providerId),
    watch_region: region,
    sort_by: sortBy,
    "vote_count.gte": isTopRated ? 100 : isNew ? 10 : 5,
    "vote_average.gte": isTopRated ? 6.0 : undefined,
    "primary_release_date.lte": today,
    "primary_release_date.gte": isNew && mediaType === "movie" ? oneYearAgo : undefined,
    "first_air_date.lte": today,
    "first_air_date.gte": isNew && mediaType === "tv" ? oneYearAgo : undefined,
    "with_runtime.gte": mediaType === "movie" ? 50 : undefined,
    page,
    include_adult: false,
  })

  return {
    ...res,
    results: cleanResults(res.results || []),
  }
}

/**
 * Discover Movies with genre filtering & sorting
 */
export async function discoverMovies(params: {
  with_genres?: string | number
  with_keywords?: string | number
  sort_by?: string
  page?: number
}): Promise<TmdbPaginatedResponse<Movie>> {
  const { sort_by = "popularity.desc", ...rest } = params
  const isTopRated = sort_by === "vote_average.desc"
  const isNew = sort_by === "primary_release_date.desc"

  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]

  const res = await fetchTmdb<TmdbPaginatedResponse<Movie>>("/discover/movie", {
    sort_by,
    "vote_count.gte": isTopRated ? 100 : isNew ? 15 : 10,
    "vote_average.gte": isTopRated ? 6.0 : undefined,
    "primary_release_date.lte": today,
    "primary_release_date.gte": isNew ? oneYearAgo : undefined,
    "with_runtime.gte": 50,
    ...rest,
    include_adult: false,
  })

  return {
    ...res,
    results: cleanResults(res.results || []),
  }
}

/**
 * Discover TV Shows with genre filtering & sorting
 */
export async function discoverTv(params: {
  with_genres?: string | number
  with_keywords?: string | number
  sort_by?: string
  page?: number
}): Promise<TmdbPaginatedResponse<TvShow>> {
  const { sort_by = "popularity.desc", ...rest } = params
  const isTopRated = sort_by === "vote_average.desc"
  const isNew = sort_by === "first_air_date.desc"

  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]

  const res = await fetchTmdb<TmdbPaginatedResponse<TvShow>>("/discover/tv", {
    sort_by,
    "vote_count.gte": isTopRated ? 80 : isNew ? 10 : 5,
    "vote_average.gte": isTopRated ? 6.0 : undefined,
    "first_air_date.lte": today,
    "first_air_date.gte": isNew ? oneYearAgo : undefined,
    ...rest,
    include_adult: false,
  })

  return {
    ...res,
    results: cleanResults(res.results || []),
  }
}

/**
 * Get Movie Genres list
 */
export async function getMovieGenres(): Promise<{ genres: Genre[] }> {
  return fetchTmdb<{ genres: Genre[] }>("/genre/movie/list")
}

/**
 * Get TV Genres list
 */
export async function getTvGenres(): Promise<{ genres: Genre[] }> {
  return fetchTmdb<{ genres: Genre[] }>("/genre/tv/list")
}
