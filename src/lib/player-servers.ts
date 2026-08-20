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
    description: "Multi-quality with automated continue-watching sync",
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
    name: "Server 2 (VidLink)",
    description: "Ultra-fast direct streaming with minimal ads",
    badge: "Clean",
    getUrl: ({ type, mediaId, season = 1, episode = 1, startAt }) => {
      const path =
        type === "movie"
          ? `https://vidlink.pro/movie/${mediaId}`
          : `https://vidlink.pro/tv/${mediaId}/${season}/${episode}`
      const url = new URL(path)
      if (startAt && startAt > 5) {
        url.searchParams.set("startAt", String(Math.floor(startAt)))
      }
      return url.toString()
    },
  },
  {
    id: "server-3",
    name: "Server 3 (VidSrc Pro)",
    description: "Prestige high-bitrate multi-audio stream",
    getUrl: ({ type, mediaId, season = 1, episode = 1 }) => {
      return type === "movie"
        ? `https://vidsrc.pro/embed/movie/${mediaId}`
        : `https://vidsrc.pro/embed/tv/${mediaId}/${season}/${episode}`
    },
  },
  {
    id: "server-4",
    name: "Server 4 (AutoEmbed)",
    description: "Reliable fallback server with global CDN",
    getUrl: ({ type, mediaId, season = 1, episode = 1 }) => {
      return type === "movie"
        ? `https://player.autoembed.cc/embed/movie/${mediaId}`
        : `https://player.autoembed.cc/embed/tv/${mediaId}/${season}/${episode}`
    },
  },
  {
    id: "server-5",
    name: "Server 5 (2Embed)",
    description: "Alternative multi-language server",
    getUrl: ({ type, mediaId, season = 1, episode = 1 }) => {
      return type === "movie"
        ? `https://www.2embed.cc/embed/${mediaId}`
        : `https://www.2embed.cc/embedtv/${mediaId}&s=${season}&e=${episode}`
    },
  },
]
