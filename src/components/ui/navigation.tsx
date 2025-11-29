// src/components/ui/navigation.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export function Navigation() {
  const { user, token } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname?.startsWith(href)
  }

  const primaryLinks = [
    { href: "/", label: "Home" },
    { href: "/create", label: "Create" },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-4xl items-center px-4 sm:h-16 sm:px-6">
        {/* Brand (left) */}
        <div className="flex flex-1 items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="rline-logo inline-flex items-center rounded-full bg-gradient-to-r from-pink-500/18 to-blue-500/14 px-3.5 py-1.5 text-sm font-semibold text-pink-600 ring-1 ring-pink-500/25">
              RLine
            </span>
            <span className="hidden text-[0.8rem] font-medium tracking-tight text-foreground/70 sm:inline">
              A small place for big thoughts
            </span>
          </Link>
        </div>

        {/* Desktop navigation (center) */}
        <div className="hidden flex-1 items-center justify-center gap-2 text-xs md:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "inline-flex items-center justify-center rounded-full px-4 py-1.5 ring-1 transition-colors",
                isActive(link.href)
                  ? "bg-pink-600/10 text-pink-700 ring-pink-500/30"
                  : "ring-transparent text-foreground/70 hover:text-foreground hover:bg-foreground/5 hover:ring-foreground/10",
              ].join(" ")}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth (right) */}
        <div className="hidden flex-1 items-center justify-end gap-3 md:flex">
          {token ? (
            <>
              <span className="hidden text-xs text-foreground/60 sm:inline">
                Signed in as{" "}
                <span className="text-xs font-medium text-foreground/80">
                  {user?.username}
                </span>
              </span>
              <Button
                size="sm"
                className="inline-flex items-center gap-1.5 rounded-full bg-pink-500/6 px-4 text-xs font-medium text-pink-700 ring-1 ring-pink-500/45 hover:bg-pink-500/10 hover:text-pink-800"
                asChild
              >
                <Link href="/profile">Profile</Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground/80 hover:text-foreground hover:bg-foreground/5"
                asChild
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                size="sm"
                className="rounded-full bg-gradient-to-r from-pink-500 to-pink-600 px-4 text-xs font-medium text-white shadow-sm hover:from-pink-600 hover:to-pink-700"
                asChild
              >
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {token && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-foreground/70 hover:text-foreground hover:bg-foreground/5"
              asChild
            >
              <Link href="/profile">{user?.username ?? "Profile"}</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="text-foreground/80 hover:text-foreground hover:bg-foreground/5"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {open ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </Button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-4xl flex-col gap-1 px-4 py-3 text-sm">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={[
                  "rounded-md px-2 py-1.5",
                  isActive(link.href)
                    ? "bg-pink-600/10 text-pink-700"
                    : "text-foreground/80 hover:bg-foreground/5 hover:text-foreground",
                ].join(" ")}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 flex gap-2">
              {token ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-full border-pink-500/50 bg-pink-500/5 text-pink-700 hover:bg-pink-500/10"
                  asChild
                >
                  <Link href="/profile" onClick={() => setOpen(false)}>
                    Profile
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-foreground/80 hover:text-foreground hover:bg-foreground/5"
                    asChild
                  >
                    <Link href="/login" onClick={() => setOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-xs font-medium text-white shadow-sm hover:from-pink-600 hover:to-pink-700"
                    asChild
                  >
                    <Link href="/register" onClick={() => setOpen(false)}>
                      Sign up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navigation