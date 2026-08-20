"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Play,
  Film,
  Tv,
  Compass,
  Menu,
  ChevronDown,
  Sparkles,
  Layers,
  Flame,
  Globe,
  Swords,
  Laugh,
  Clapperboard,
  Wand2,
  Users,
  Ghost,
  Search,
  Heart,
  Zap,
  Rocket,
  Trophy,
  ShieldAlert,
} from "lucide-react"

import { ModeToggle } from "@/components/mode-toggle"
import { SearchDialog } from "@/components/search-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { GENRES_LIST, CATEGORIES_LIST, OTT_LIST } from "@/lib/constants"
import { cn } from "@/lib/utils"

const genreIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  action: Swords,
  adventure: Compass,
  animation: Sparkles,
  crime: ShieldAlert,
  comedy: Laugh,
  documentary: Clapperboard,
  fantasy: Wand2,
  family: Users,
  horror: Ghost,
  mystery: Search,
  romance: Heart,
  thriller: Zap,
  "science-fiction": Rocket,
  sports: Trophy,
}

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  bollywood: Film,
  hollywood: Globe,
  "south-indian": Flame,
}

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  const navLinks = [
    { href: "/", label: "Home", icon: Compass },
    { href: "/movies", label: "Movies", icon: Film },
    { href: "/tv", label: "TV Series", icon: Tv },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl transition-all">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8 gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
              <Play className="size-4.5 fill-current ml-0.5" />
            </div>
            <span className="font-heading font-extrabold text-xl tracking-tight">
              Watch<span className="text-primary">Me</span>
            </span>
          </Link>

          {/* Desktop Nav Links & Dropdowns */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold",
                    isActive
                      ? "bg-primary/15 text-primary shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="size-4" />
                  <span>{link.label}</span>
                </Link>
              )
            })}

            {/* 1. Genres Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer outline-none",
                      pathname.startsWith("/genre")
                        ? "bg-primary/15 text-primary shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  />
                }
              >
                <Layers className="size-4" />
                <span>Genres</span>
                <ChevronDown className="size-3.5 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80 p-2 border-white/10 bg-card/95 backdrop-blur-xl">
                <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center gap-1.5">
                  <Layers className="size-3.5 text-primary" />
                  <span>Explore by Genre</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <div className="grid grid-cols-2 gap-0.5 p-1">
                  {GENRES_LIST.map((genre) => {
                    const GenreIcon = genreIconMap[genre.slug] || Film
                    return (
                      <DropdownMenuItem
                        key={genre.slug}
                        className="cursor-pointer text-xs py-1.5 px-2 rounded-md hover:bg-primary/10 hover:text-primary font-medium flex items-center gap-2"
                        render={<Link href={`/genre/${genre.slug}`} />}
                      >
                        <GenreIcon className="size-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                        <span className="truncate">{genre.name}</span>
                      </DropdownMenuItem>
                    )
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 2. Category Dropdown (Bollywood, Hollywood, South Indian) */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer outline-none",
                      pathname.startsWith("/category")
                        ? "bg-primary/15 text-primary shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  />
                }
              >
                <Flame className="size-4 text-amber-500" />
                <span>Category</span>
                <ChevronDown className="size-3.5 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72 p-2 border-white/10 bg-card/95 backdrop-blur-xl">
                <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center gap-1.5">
                  <Globe className="size-3.5 text-amber-500" />
                  <span>Regional & Global Cinema</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <div className="space-y-1 p-1">
                  {CATEGORIES_LIST.map((cat) => {
                    const CatIcon = categoryIconMap[cat.slug] || Film
                    return (
                      <DropdownMenuItem
                        key={cat.slug}
                        className="cursor-pointer py-2 px-2.5 rounded-lg hover:bg-primary/10 hover:text-primary flex items-start gap-2.5"
                        render={<Link href={`/category/${cat.slug}`} />}
                      >
                        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                          <CatIcon className="size-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-heading font-semibold text-xs text-foreground">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground line-clamp-1">
                            {cat.description}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    )
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 3. OTT Streaming Platforms Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer outline-none",
                      pathname.startsWith("/ott")
                        ? "bg-primary/15 text-primary shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  />
                }
              >
                <Sparkles className="size-4 text-primary" />
                <span>OTT</span>
                <ChevronDown className="size-3.5 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72 p-2 border-white/10 bg-card/95 backdrop-blur-xl">
                <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center gap-1.5">
                  <Tv className="size-3.5 text-primary" />
                  <span>Streaming Networks</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <div className="grid grid-cols-2 gap-1 p-1">
                  {OTT_LIST.map((ott) => (
                    <DropdownMenuItem
                      key={ott.slug}
                      className="cursor-pointer py-1.5 px-2 rounded-md hover:bg-muted flex items-center gap-2"
                      render={<Link href={`/ott/${ott.slug}`} />}
                    >
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: ott.color }}
                      />
                      <span className="text-xs font-medium truncate">{ott.name}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <SearchDialog />
          <ModeToggle />

          {/* Mobile Navigation Hamburger */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                  />
                }
              >
                <Menu className="size-5" />
                <span className="sr-only">Toggle navigation</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-6 overflow-y-auto bg-card/95 backdrop-blur-2xl">
                <SheetHeader className="p-0 mb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
                      <Play className="size-4 fill-current ml-0.5" />
                    </div>
                    <span className="font-heading font-bold text-lg">WatchMe</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-6">
                  {/* Primary Nav */}
                  <div className="flex flex-col gap-1">
                    {navLinks.map((link) => {
                      const isActive = pathname === link.href
                      const Icon = link.icon
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                            isActive
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <Icon className="size-4.5" />
                          <span>{link.label}</span>
                        </Link>
                      )
                    })}
                  </div>

                  {/* Categories Section */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Globe className="size-3.5 text-amber-500" />
                      <span>Categories</span>
                    </span>
                    <div className="grid grid-cols-1 gap-1">
                      {CATEGORIES_LIST.map((cat) => {
                        const CatIcon = categoryIconMap[cat.slug] || Film
                        return (
                          <Link
                            key={cat.slug}
                            href={`/category/${cat.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <CatIcon className="size-3.5 text-primary" />
                              <span>{cat.name}</span>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground/60">
                              {cat.language.toUpperCase()}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>

                  {/* OTT Platforms Section */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Tv className="size-3.5 text-primary" />
                      <span>OTT Platforms</span>
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {OTT_LIST.map((ott) => (
                        <Link
                          key={ott.slug}
                          href={`/ott/${ott.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-lg border border-white/5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground truncate"
                        >
                          <span
                            className="size-2 rounded-full shrink-0"
                            style={{ backgroundColor: ott.color }}
                          />
                          <span className="truncate">{ott.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Genres Section */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Layers className="size-3.5 text-primary" />
                      <span>Genres</span>
                    </span>
                    <div className="grid grid-cols-2 gap-1">
                      {GENRES_LIST.map((g) => {
                        const GIcon = genreIconMap[g.slug] || Film
                        return (
                          <Link
                            key={g.slug}
                            href={`/genre/${g.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground truncate"
                          >
                            <GIcon className="size-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{g.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
