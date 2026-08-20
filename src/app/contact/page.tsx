"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

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
            <Mail className="size-5" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
            Contact Us
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Have a question, feedback, or inquiry? Send us a message below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Form */}
        <div className="md:col-span-7 p-6 rounded-2xl border border-white/5 bg-card/60 backdrop-blur-md space-y-4">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Send a Message
          </h2>

          {submitted ? (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-3 bg-primary/5 rounded-xl border border-primary/20">
              <CheckCircle2 className="size-10 text-primary" />
              <h3 className="font-heading font-bold text-base text-foreground">
                Message Received!
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Thank you for reaching out. We have received your message and will review it promptly.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Your Name</label>
                <Input
                  placeholder="John Doe"
                  required
                  className="bg-black/40 border-white/10 text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Your Email</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  required
                  className="bg-black/40 border-white/10 text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Subject</label>
                <Input
                  placeholder="Feedback / Inquiry / DMCA"
                  required
                  className="bg-black/40 border-white/10 text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Message</label>
                <textarea
                  rows={4}
                  placeholder="Write your message here..."
                  required
                  className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground font-heading font-bold gap-2 h-10 rounded-xl cursor-pointer"
              >
                <Send className="size-3.5" />
                Submit Message
              </Button>
            </form>
          )}
        </div>

        {/* Right: Info Card */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl border border-white/5 bg-card/60 space-y-3 text-xs leading-relaxed text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-heading font-bold text-sm">
              <MessageSquare className="size-4 text-primary" />
              General Inquiries
            </div>
            <p>
              Please allow 24-48 hours for responses regarding general feedback, feature requests, or technical bug reports.
            </p>
            <p className="border-t border-white/5 pt-3">
              For copyright removal requests, please specify the exact URLs and evidence of ownership under our{" "}
              <Link href="/dmca" className="text-primary hover:underline font-semibold">
                DMCA guidelines
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
