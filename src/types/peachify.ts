/**
 * Peachify Player Types & Interfaces
 */

export const PEACHIFY_BASE_URL = "https://peachify.pro" as const

export type PeachifyMediaType = "movie" | "tv"

/**
 * UI controls that can be hidden in the player
 */
export type PeachifyUiControl =
  | "pip"
  | "cast"
  | "fullscreen"
  | "volume"
  | "servers"
  | "captions"
  | "quality"
  | "play"
  | "rewind"
  | "forward"
  | "timegroup"
  | "timeslider"
  | "settings"

/**
 * Hide control parameter values accepted by Peachify
 */
export type PeachifyHideValue = "hide" | "false" | "0" | "off" | boolean

/**
 * Common configuration options for the Peachify player
 */
export interface PeachifyPlayerOptions {
  /**
   * Target audio / dubbing language (e.g. 'English', 'Japanese')
   */
  audio?: string
  /**
   * Target subtitle language or label (e.g. 'English', 'eng', 'Arabic')
   */
  subtitle?: string
  /**
   * Preferred streaming quality (e.g. '1080', '1080p', 720)
   */
  quality?: string | number
  /**
   * Force a specific provider first (e.g. 'iron', 'spider', 'wolf')
   */
  server?: string
  /**
   * Custom Peachify-compatible backend API base URL
   */
  api?: string
  /**
   * Start playback from timestamp in seconds
   */
  startAt?: number
  /**
   * TV only: Enable episode auto-next or provide threshold in seconds (e.g. true or 45)
   */
  autoNext?: boolean | number
  /**
   * TV only: Show or hide manual Next Episode button
   */
  showNextBtn?: boolean
  /**
   * Custom UI accent hex color (with or without '#', e.g. 'B54666')
   */
  accent?: string
  /**
   * Enable or disable autoplay (default: true)
   */
  autoPlay?: boolean
  /**
   * Controls to hide from the player interface
   */
  hideControls?: Partial<Record<PeachifyUiControl, PeachifyHideValue>>
}

/**
 * Embed configuration for movies
 */
export interface PeachifyMovieConfig extends PeachifyPlayerOptions {
  type: "movie"
  /**
   * TMDB numeric ID (e.g. 786892) or IMDb ID (e.g. 'tt12037194')
   */
  mediaId: string | number
}

/**
 * Embed configuration for TV shows
 */
export interface PeachifyTvConfig extends PeachifyPlayerOptions {
  type: "tv"
  /**
   * TMDB numeric ID (e.g. 76479) or IMDb ID (e.g. 'tt1190634')
   */
  mediaId: string | number
  /**
   * Season number (1-indexed)
   */
  season: number
  /**
   * Episode number (1-indexed)
   */
  episode: number
}

export type PeachifyEmbedConfig = PeachifyMovieConfig | PeachifyTvConfig

/**
 * Player Event Types posted from iframe
 */
export type PeachifyPlayerEventType =
  | "play"
  | "pause"
  | "seeked"
  | "ended"
  | "timeupdate"
  | string

export interface PeachifyPlayerEventPayload {
  event: PeachifyPlayerEventType
  currentTime: number
  duration: number
  tmdbId?: number | string
  mediaType?: PeachifyMediaType
  season?: number
  episode?: number
  [key: string]: unknown
}

export interface PeachifyPlayerEventMessage {
  type: "PLAYER_EVENT"
  data: PeachifyPlayerEventPayload
}

/**
 * Episode Progress Structure in Continue Watching
 */
export interface PeachifyEpisodeProgress {
  season: string | number
  episode: string | number
  progress: {
    watched: number
    duration: number
  }
}

/**
 * Media Item Progress Structure in Continue Watching
 */
export interface PeachifyMediaItemProgress {
  id: number | string
  type: PeachifyMediaType
  title?: string
  poster_path?: string
  backdrop_path?: string
  progress: {
    watched: number
    duration: number
  }
  last_season_watched?: string | number
  last_episode_watched?: string | number
  show_progress?: Record<string, PeachifyEpisodeProgress>
  last_updated?: number
  [key: string]: unknown
}

/**
 * Root Media Data Map (keyed by mediaId string)
 */
export type PeachifyProgressStorage = Record<string, PeachifyMediaItemProgress>

export interface PeachifyMediaDataMessage {
  type: "MEDIA_DATA"
  data: PeachifyProgressStorage
}

export type PeachifyWindowMessage =
  | PeachifyPlayerEventMessage
  | PeachifyMediaDataMessage
