import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ShieldAlert, CheckCircle2 } from "lucide-react"

export const metadata: Metadata = {
  title: "DMCA Notice & Takedown Policy - The Player",
  description: "Digital Millennium Copyright Act (DMCA) notice and copyright infringement takedown policy for The Player.",
}

export default function DmcaPage() {
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
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-sm shadow-primary/20">
            <ShieldAlert className="size-5" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
            DMCA Policy
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Digital Millennium Copyright Act Notice & Takedown Procedure
        </p>
      </div>

      <div className="space-y-6 text-sm sm:text-base leading-relaxed text-muted-foreground">
        <div className="p-6 rounded-2xl border border-white/5 bg-card/60 backdrop-blur-md space-y-3">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Respecting Intellectual Property Rights
          </h2>
          <p>
            <strong className="text-foreground">The Player</strong> is an index and discovery platform that provides links to media hosted on external third-party streaming servers. We do not host, store, or transmit video files on our own servers.
          </p>
          <p>
            It is our policy to respond with prompt action to any formal infringement notices submitted in accordance with the Digital Millennium Copyright Act (DMCA) and international copyright legislation.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
            Filing a DMCA Takedown Request
          </h2>
          <p className="text-xs sm:text-sm">
            To file a valid copyright infringement notice, please provide our copyright agent with the following details via our{" "}
            <Link href="/contact" className="text-primary hover:underline font-semibold">
              Contact Form
            </Link>
            :
          </p>

          <div className="space-y-2.5 text-xs sm:text-sm">
            {[
              "A physical or electronic signature of the copyright owner or person authorized to act on their behalf.",
              "Identification of the copyrighted work claimed to have been infringed.",
              "Identification of the material that is claimed to be infringing, including specific URLs on The Player.",
              "Contact information including your full legal name, email address, physical address, and telephone number.",
              "A statement that you have a good faith belief that use of the material is not authorized by the copyright owner, its agent, or the law.",
              "A statement that the information in the notification is accurate under penalty of perjury.",
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl border border-white/5 bg-card/40">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
