import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, ShieldAlert } from "lucide-react"

export const metadata: Metadata = {
  title: "Disclaimer - WatchMe",
  description: "Important disclaimer regarding content, personal project status, and usage terms on WatchMe.",
}

export default function DisclaimerPage() {
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
            Disclaimer
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Notice Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs sm:text-sm">
        <AlertTriangle className="size-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-foreground">Personal Non-Commercial Project</p>
          <p className="text-muted-foreground mt-0.5">
            WatchMe is an educational and personal portfolio project created solely for demonstration purposes. We do not host, store, or upload any multimedia files.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="prose prose-invert max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-muted-foreground">
        <p>
          Welcome to <strong className="text-foreground">WatchMe</strong>! This disclaimer page aims to provide important information about the usage of our website. By accessing and using our website, you acknowledge and agree to comply with the terms and conditions outlined in this disclaimer.
        </p>

        <div className="space-y-4 pt-2">
          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
            Content Availability
          </h2>
          <p>
            <strong className="text-foreground">WatchMe</strong> does not host any of the multimedia content available on our website. We provide links to third-party websites that host the content. We do not guarantee the availability, accuracy, or quality of the content provided by these third-party websites. Users are responsible for verifying the authenticity and legality of the content before accessing or downloading it.
          </p>

          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
            Third-Party Websites
          </h2>
          <p>
            <strong className="text-foreground">WatchMe</strong> may contain links to external websites that are not owned or controlled by us. We do not endorse or assume responsibility for the content, privacy policies, or practices of these third-party websites. Users should review the terms and conditions and privacy policies of these websites before engaging with them.
          </p>

          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
            Copyright Infringement
          </h2>
          <p>
            <strong className="text-foreground">WatchMe</strong> respects the intellectual property rights of others. We do not knowingly or intentionally host or promote copyrighted content without proper authorization. If you believe that your copyrighted material has been used without permission, please visit our{" "}
            <Link href="/dmca" className="text-primary hover:underline font-semibold">
              DMCA Page
            </Link>{" "}
            or contact us promptly to address the issue.
          </p>

          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
            User Responsibility
          </h2>
          <p>
            Users are solely responsible for their actions while using our website. Any reliance on the content provided on <strong className="text-foreground">WatchMe</strong> is at the user&apos;s own risk. We are not liable for any damages or losses resulting from the use of our website or the content accessed through it.
          </p>

          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
            Changes to Disclaimer
          </h2>
          <p>
            <strong className="text-foreground">WatchMe</strong> reserves the right to modify or update this disclaimer at any time without prior notice. It is the user&apos;s responsibility to review this page periodically for any changes.
          </p>

          <p className="pt-2 border-t border-white/5 text-xs text-muted-foreground">
            By continuing to use <strong className="text-foreground">WatchMe</strong>, you acknowledge that you have read and understood this disclaimer. If you do not agree with any part of this disclaimer, please refrain from accessing or using our website.
          </p>
        </div>
      </div>
    </div>
  )
}
