import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Play, Sparkles, Film, ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us - The Player",
  description: "Learn more about The Player personal streaming and movie catalog project.",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-8 py-10 sm:py-14 space-y-8">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        <span>Back to Home</span>
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <Play className="size-4 fill-current ml-0.5" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
            About The <span className="text-primary">Player</span>
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          A modern cinematic web application exploring the future of media streaming and discovery.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-6 text-sm sm:text-base leading-relaxed text-muted-foreground">
        <div className="p-6 rounded-2xl border border-white/5 bg-card/60 backdrop-blur-md space-y-4">
          <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Our Mission & Project Vision
          </h2>
          <p>
            <strong className="text-foreground">The Player</strong> is an experimental, non-commercial web project designed to provide an ultra-clean, intuitive, and high-performance movie and TV series discovery platform.
          </p>
          <p>
            Built with modern technologies including Next.js, Tailwind CSS, and embedded player integrations, The Player demonstrates responsive design, synchronized playback memory, dynamic filtering, and seamless multi-device media streaming.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-white/5 bg-card/60 space-y-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Film className="size-4" />
            </div>
            <h3 className="font-heading text-base font-bold text-foreground">Global Catalog</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore thousands of titles across Hollywood, Bollywood, South Indian cinema, and 14+ genres with instantaneous filtering.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-white/5 bg-card/60 space-y-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-4" />
            </div>
            <h3 className="font-heading text-base font-bold text-foreground">Personal Portfolio</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Created for portfolio demonstration. We do not store or host video files directly on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
