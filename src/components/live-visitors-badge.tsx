"use client"

import * as React from "react"
import { Users } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

let currentLiveVisitors = 1
const presenceListeners = new Set<() => void>()

function subscribePresence(callback: () => void) {
  presenceListeners.add(callback)
  return () => {
    presenceListeners.delete(callback)
  }
}

function getLiveSnapshot() {
  return currentLiveVisitors
}

function getServerLiveSnapshot() {
  return 1
}

// Function to send heartbeat and update presence store
async function updatePresence() {
  if (typeof window === "undefined") return

  let sessionId = ""
  try {
    sessionId = sessionStorage.getItem("theplayer_sess_id") || ""
    if (!sessionId) {
      sessionId = `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`
      sessionStorage.setItem("theplayer_sess_id", sessionId)
    }
  } catch {
    sessionId = `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`
  }

  try {
    const res = await fetch("/api/presence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
    if (res.ok) {
      const data = await res.json()
      if (typeof data.count === "number") {
        currentLiveVisitors = data.count
        presenceListeners.forEach((fn) => fn())
      }
    }
  } catch {
    // Ignore network errors
  }
}

export function LiveVisitorsBadge({ className }: { className?: string }) {
  const visitors = React.useSyncExternalStore(
    subscribePresence,
    getLiveSnapshot,
    getServerLiveSnapshot
  )

  React.useEffect(() => {
    updatePresence()
    const timer = setInterval(updatePresence, 20000)
    return () => clearInterval(timer)
  }, [])

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs text-muted-foreground select-none cursor-default shadow-xs transition-all hover:border-emerald-500/30 shrink-0",
              className
            )}
          />
        }
      >
        {/* Pulsing Live Emerald Dot */}
        <span className="relative flex size-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
        </span>

        <Users className="size-3 text-muted-foreground/80 hidden xl:inline" />

        <span className="font-mono font-bold text-foreground tabular-nums text-xs">
          {visitors}
        </span>

        <span className="text-[10px] text-muted-foreground font-medium">
          Online
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Real-Time Active Visitors
        </p>
        <p className="text-muted-foreground mt-0.5">
          {visitors} live active {visitors === 1 ? "user" : "users"} currently browsing The Player.
        </p>
      </TooltipContent>
    </Tooltip>
  )
}
