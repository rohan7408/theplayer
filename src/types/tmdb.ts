export type TmdbMediaType = "movie" | "tv"

export interface Genre {
  id: number
  name: string
}

export interface ProductionCompany {
  id: number
  logo_path: string | null
  name: string
  origin_country: string
}

export interface CastMember {
  id: number
  name: string
  original_name: string
  character: string
  profile_path: string | null
  order: number
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface CreditsResponse {
  id: number
  cast: CastMember[]
  crew: CrewMember[]
}

export interface VideoTrailer {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
  published_at: string
}

export interface VideosResponse {
  id: number
  results: VideoTrailer[]
}

export interface Movie {
  id: number
  title: string
  original_title: string
  original_language?: string
  origin_country?: string[]
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  genre_ids?: number[]
  genres?: Genre[]
  media_type?: "movie"
}

export interface MovieDetails extends Movie {
  runtime: number
  budget: number
  revenue: number
  status: string
  tagline: string | null
  imdb_id: string | null
  homepage: string | null
  production_companies: ProductionCompany[]
  credits?: CreditsResponse
  videos?: VideosResponse
  similar?: TmdbPaginatedResponse<Movie>
  recommendations?: TmdbPaginatedResponse<Movie>
}

export interface Episode {
  id: number
  name: string
  overview: string
  air_date: string
  episode_number: number
  season_number: number
  still_path: string | null
  vote_average: number
  vote_count: number
  runtime?: number
}

export interface Season {
  id: number
  name: string
  overview: string
  season_number: number
  episode_count: number
  air_date: string | null
  poster_path: string | null
}

export interface SeasonDetails extends Season {
  episodes: Episode[]
}

export interface TvShow {
  id: number
  name: string
  original_name: string
  original_language?: string
  origin_country?: string[]
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  popularity: number
  genre_ids?: number[]
  genres?: Genre[]
  media_type?: "tv"
}

export interface TvDetails extends TvShow {
  number_of_episodes: number
  number_of_seasons: number
  seasons: Season[]
  status: string
  tagline: string | null
  homepage: string | null
  episode_run_time?: number[]
  production_companies: ProductionCompany[]
  credits?: CreditsResponse
  videos?: VideosResponse
  similar?: TmdbPaginatedResponse<TvShow>
  recommendations?: TmdbPaginatedResponse<TvShow>
}

export type MediaItem = (Movie & { media_type: "movie" }) | (TvShow & { media_type: "tv" })

export interface TmdbPaginatedResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}
