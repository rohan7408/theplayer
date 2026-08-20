import type { Metadata } from "next";
import { Outfit, Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import {
  Play,
  Film,
  Tv,
  Search,
  Info,
  Mail,
  ShieldAlert,
  Lock,
  AlertTriangle,
} from "lucide-react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Player - Stream Movies & TV Series Online",
  description:
    "Explore, discover, and stream thousands of movies and TV shows in ultra high quality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased flex flex-col selection:bg-primary selection:text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Navbar />
            <main className="flex-1 pb-16 lg:pb-0">{children}</main>
            <footer className="border-t border-white/5 py-8 sm:py-12 bg-card/40 backdrop-blur-md mt-auto pb-24 lg:pb-12">
              <div className="container mx-auto max-w-7xl px-4 sm:px-8 space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
                      <Play className="size-3.5 fill-current ml-0.5" />
                    </div>
                    <span className="font-heading font-extrabold text-base text-foreground tracking-tight">
                      The <span className="text-primary">Player</span>
                    </span>
                    <span className="text-[11px] ml-2 text-muted-foreground/80">
                      © {new Date().getFullYear()} All rights reserved.
                    </span>
                  </div>

                  {/* Main Links with Lucide Icons */}
                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium">
                    <Link
                      href="/movies"
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <Film className="size-3.5 text-primary" />
                      <span>Movies</span>
                    </Link>
                    <Link
                      href="/tv"
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <Tv className="size-3.5 text-primary" />
                      <span>TV Shows</span>
                    </Link>
                    <Link
                      href="/search"
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <Search className="size-3.5 text-primary" />
                      <span>Search</span>
                    </Link>
                  </div>
                </div>

                {/* Secondary Legal & Info Links with Lucide Icons */}
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2 pt-4 border-t border-white/5 text-[11px] text-muted-foreground/80">
                  <Link
                    href="/about"
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    <Info className="size-3 text-muted-foreground hover:text-primary" />
                    <span>About Us</span>
                  </Link>
                  <Link
                    href="/contact"
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    <Mail className="size-3 text-muted-foreground hover:text-primary" />
                    <span>Contact</span>
                  </Link>
                  <Link
                    href="/dmca"
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    <ShieldAlert className="size-3 text-muted-foreground hover:text-primary" />
                    <span>DMCA</span>
                  </Link>
                  <Link
                    href="/privacy-policy"
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    <Lock className="size-3 text-muted-foreground hover:text-primary" />
                    <span>Privacy Policy</span>
                  </Link>
                  <Link
                    href="/disclaimer"
                    className="flex items-center gap-1.5 hover:text-primary transition-colors font-semibold text-muted-foreground"
                  >
                    <AlertTriangle className="size-3 text-amber-500/80" />
                    <span>Disclaimer</span>
                  </Link>
                </div>
              </div>
            </footer>
            <MobileBottomNav />
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
