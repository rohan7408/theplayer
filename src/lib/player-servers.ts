export interface StreamingServer {
  id: string
  name: string
  description: string
  badge?: string
  getUrl: (params: {
    type: "movie" | "tv"
    mediaId: string | number
    season?: number
    episode?: number
    startAt?: number
  }) => string
}

export const STREAMING_SERVERS: StreamingServer[] = [
  {
    id: "server-1",
    name: "Server 1 (Fast HD)",
    description: "Multi-quality stream with continue-watching sync",
    badge: "Recommended",
    getUrl: ({ type, mediaId, season = 1, episode = 1, startAt }) => {
      const base = "https://peachify.pro"
      const path =
        type === "movie"
          ? `/embed/movie/${mediaId}`
          : `/embed/tv/${mediaId}/${season}/${episode}`
      const url = new URL(path, base)
      if (startAt && startAt > 5) {
        url.searchParams.set("startAt", String(Math.floor(startAt)))
      }
      return url.toString()
    },
  },
  {
    id: "server-2",
    name: "Server 2 (2Embed)",
    description: "Alternative streaming server",
    badge: "Backup",
    getUrl: ({ type, mediaId, season = 1, episode = 1 }) => {
      return type === "movie"
        ? `https://www.2embed.cc/embed/${mediaId}`
        : `https://www.2embed.cc/embedtv/${mediaId}&s=${season}&e=${episode}`
    },
  },
]
