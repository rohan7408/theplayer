import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy - The Player",
  description: "Privacy policy regarding local storage, cookies, and user privacy on The Player.",
}

export default function PrivacyPolicyPage() {
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
            <Lock className="size-5" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
            Privacy Policy
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          How we protect your privacy and handle data on The Player.
        </p>
      </div>

      <div className="space-y-6 text-sm sm:text-base leading-relaxed text-muted-foreground">
        <div className="p-6 rounded-2xl border border-white/5 bg-card/60 backdrop-blur-md space-y-3">
          <h2 className="font-heading text-lg font-bold text-foreground">
            No Personal Data Collection
          </h2>
          <p>
            <strong className="text-foreground">The Player</strong> is committed to user privacy. We do not require account registration, and we do not collect, store, or sell any personally identifiable information (PII) on our servers.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
            Browser LocalStorage & Watch History
          </h2>
          <p>
            Playback progress and continue-watching timestamps are stored strictly inside your own device&apos;s browser using HTML5 LocalStorage (`peachifyProgress`). This data never leaves your computer or browser and can be cleared at any time directly through your browser settings or via the remove button in your Continue Watching list.
          </p>

          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
            Third-Party Embedded Content
          </h2>
          <p>
            When streaming media through embedded players, third-party content providers may set cookies or collect standard anonymous web traffic analytics. We encourage you to review the privacy policies of any third-party streaming hosts you interact with.
          </p>

          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
            Contact Regarding Privacy
          </h2>
          <p>
            If you have questions about our privacy practices, you may reach out through our{" "}
            <Link href="/contact" className="text-primary hover:underline font-semibold">
              Contact page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
