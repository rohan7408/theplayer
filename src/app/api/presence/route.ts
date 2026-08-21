import { NextResponse } from "next/server"

// In-memory active presence tracker
// Stores session IDs with their last active timestamp
const activeSessions = new Map<string, number>()

// Clean up stale sessions older than 45 seconds
function pruneStaleSessions() {
  const cutoff = Date.now() - 45000
  for (const [id, lastSeen] of activeSessions.entries()) {
    if (lastSeen < cutoff) {
      activeSessions.delete(id)
    }
  }
}

export async function GET() {
  pruneStaleSessions()
  const count = Math.max(1, activeSessions.size)
  return NextResponse.json(
    { count },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  )
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const sessionId = typeof body.sessionId === "string" && body.sessionId.trim()
      ? body.sessionId.trim()
      : null

    if (sessionId) {
      activeSessions.set(sessionId, Date.now())
    }

    pruneStaleSessions()
    const count = Math.max(1, activeSessions.size)

    return NextResponse.json(
      { count },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    )
  } catch {
    return NextResponse.json({ count: Math.max(1, activeSessions.size) })
  }
}
