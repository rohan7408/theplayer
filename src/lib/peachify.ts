import {
  PEACHIFY_BASE_URL,
  type PeachifyEmbedConfig,
  type PeachifyUiControl,
} from "@/types/peachify"

/**
 * Validates if the given ID is an IMDb identifier (e.g., 'tt1234567')
 */
export function isImdbId(id: string | number): boolean {
  return typeof id === "string" && /^tt\d+$/i.test(id.trim())
}

/**
 * Validates if the given ID is a numeric TMDB identifier
 */
export function isTmdbId(id: string | number): boolean {
  if (typeof id === "number") return !isNaN(id) && id > 0
  return /^\d+$/.test(id.trim())
}

/**
 * Builds the complete Peachify iframe URL based on embed configuration and options.
 */
export function buildPeachifyUrl(config: PeachifyEmbedConfig): string {
  const { type, mediaId } = config

  if (!mediaId) {
    throw new Error("Peachify: mediaId is required")
  }

  // Format the media path
  let path = ""
  if (type === "movie") {
    path = `/embed/movie/${encodeURIComponent(String(mediaId).trim())}`
  } else if (type === "tv") {
    const season = Math.max(1, config.season || 1)
    const episode = Math.max(1, config.episode || 1)
    path = `/embed/tv/${encodeURIComponent(String(mediaId).trim())}/${season}/${episode}`
  } else {
    throw new Error(`Peachify: Unknown media type "${(config as PeachifyEmbedConfig).type}"`)
  }

  const url = new URL(path, PEACHIFY_BASE_URL)
  const params = url.searchParams

  // Audio / Dubbing language
  if (config.audio) {
    params.set("audio", config.audio.trim())
  }

  // Subtitle language / label
  if (config.subtitle) {
    params.set("subtitle", config.subtitle.trim())
  }

  // Quality preference
  if (config.quality !== undefined && config.quality !== "") {
    params.set("quality", String(config.quality).trim())
  }

  // Preferred server
  if (config.server) {
    params.set("server", config.server.trim())
  }

  // Custom API override
  if (config.api) {
    params.set("api", config.api.trim())
  }

  // Resume / Start timestamp (in seconds)
  if (typeof config.startAt === "number" && config.startAt > 0) {
    params.set("startAt", String(Math.floor(config.startAt)))
  }

  // TV specific: autoNext
  if (type === "tv" && config.autoNext !== undefined) {
    if (typeof config.autoNext === "number") {
      params.set("autoNext", String(config.autoNext))
    } else if (typeof config.autoNext === "boolean") {
      params.set("autoNext", config.autoNext ? "true" : "false")
    }
  }

  // TV specific: showNextBtn
  if (type === "tv" && config.showNextBtn !== undefined) {
    params.set("showNextBtn", config.showNextBtn ? "true" : "false")
  }

  // Custom UI accent color (strip leading # if present)
  if (config.accent) {
    const cleanHex = config.accent.replace(/^#/, "").trim()
    if (/^[0-9a-fA-F]{3,8}$/.test(cleanHex)) {
      params.set("accent", cleanHex)
    }
  }

  // AutoPlay behavior (default is true in Peachify, so set only if explicitly false)
  if (config.autoPlay === false) {
    params.set("autoPlay", "false")
  }

  // Hide UI controls
  if (config.hideControls) {
    const entries = Object.entries(config.hideControls) as [
      PeachifyUiControl,
      unknown
    ][]
    for (const [controlKey, hideVal] of entries) {
      if (hideVal === true || hideVal === "hide") {
        params.set(controlKey, "hide")
      } else if (hideVal === false || hideVal === "false") {
        params.set(controlKey, "false")
      } else if (hideVal === 0 || hideVal === "0") {
        params.set(controlKey, "0")
      } else if (hideVal === "off") {
        params.set(controlKey, "off")
      }
    }
  }

  return url.toString()
}

/**
 * Format playback seconds to human-readable format (HH:MM:SS or MM:SS)
 */
export function formatPlaybackTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00"
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const paddedMins = String(mins).padStart(2, "0")
  const paddedSecs = String(secs).padStart(2, "0")

  if (hrs > 0) {
    return `${hrs}:${paddedMins}:${paddedSecs}`
  }
  return `${paddedMins}:${paddedSecs}`
}
