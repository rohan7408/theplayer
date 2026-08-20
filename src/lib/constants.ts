export interface GenreItem {
  name: string
  slug: string
  movieGenreId?: number
  tvGenreId?: number
  keywordId?: number
}

export interface CategoryItem {
  name: string
  slug: string
  language: string
  originCountry?: string
  description: string
}

export interface OttItem {
  name: string
  slug: string
  providerId: number
  color: string
  description: string
}

export const GENRES_LIST: GenreItem[] = [
  { name: "Action", slug: "action", movieGenreId: 28, tvGenreId: 10759 },
  { name: "Adventure", slug: "adventure", movieGenreId: 12, tvGenreId: 10759 },
  { name: "Animation", slug: "animation", movieGenreId: 16, tvGenreId: 16 },
  { name: "Crime", slug: "crime", movieGenreId: 80, tvGenreId: 80 },
  { name: "Comedy", slug: "comedy", movieGenreId: 35, tvGenreId: 35 },
  { name: "Documentary", slug: "documentary", movieGenreId: 99, tvGenreId: 99 },
  { name: "Fantasy", slug: "fantasy", movieGenreId: 14, tvGenreId: 10765 },
  { name: "Family", slug: "family", movieGenreId: 10751, tvGenreId: 10751 },
  { name: "Horror", slug: "horror", movieGenreId: 27, tvGenreId: 27 },
  { name: "Mystery", slug: "mystery", movieGenreId: 9648, tvGenreId: 9648 },
  { name: "Romance", slug: "romance", movieGenreId: 10749, tvGenreId: 10749 },
  { name: "Thriller", slug: "thriller", movieGenreId: 53, tvGenreId: 53 },
  { name: "Science Fiction", slug: "science-fiction", movieGenreId: 878, tvGenreId: 10765 },
  { name: "Sports", slug: "sports", keywordId: 6075 }, // Sports keyword in TMDB
]

export const CATEGORIES_LIST: CategoryItem[] = [
  {
    name: "Bollywood",
    slug: "bollywood",
    language: "hi",
    originCountry: "IN",
    description: "Hindi & Indian mainstream blockbusters and hit cinema",
  },
  {
    name: "Hollywood",
    slug: "hollywood",
    language: "en",
    originCountry: "US",
    description: "English, American, and global blockbuster entertainment",
  },
  {
    name: "South Indian",
    slug: "south-indian",
    language: "te|ta|ml|kn",
    description: "Telugu, Tamil, Malayalam & Kannada cinematic universe",
  },
]

export const OTT_LIST: OttItem[] = [
  {
    name: "Netflix",
    slug: "netflix",
    providerId: 8,
    color: "#E50914",
    description: "Original series, films, and international entertainment",
  },
  {
    name: "Amazon Prime Video",
    slug: "prime-video",
    providerId: 119,
    color: "#00A8E1",
    description: "Amazon Originals, blockbuster movies, and TV shows",
  },
  {
    name: "Disney+ Hotstar",
    slug: "disney-plus",
    providerId: 337,
    color: "#113CCF",
    description: "Marvel, Star Wars, Disney classics, and regional hits",
  },
  {
    name: "Apple TV+",
    slug: "apple-tv",
    providerId: 350,
    color: "#404040",
    description: "Award-winning Apple Originals and acclaimed prestige dramas",
  },
  {
    name: "Max (HBO)",
    slug: "max",
    providerId: 1899,
    color: "#002BE7",
    description: "HBO originals, Warner Bros movies, and DC Universe",
  },
  {
    name: "Zee5",
    slug: "zee5",
    providerId: 232,
    color: "#FF0055",
    description: "Top Hindi, South Indian, and regional originals",
  },
  {
    name: "SonyLIV",
    slug: "sonyliv",
    providerId: 237,
    color: "#0066FF",
    description: "Hit Indian series, dramas, and entertainment",
  },
  {
    name: "Hulu",
    slug: "hulu",
    providerId: 15,
    color: "#1CE783",
    description: "Current season TV shows, movies, and FX originals",
  },
]
