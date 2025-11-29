import Navigation from "@/components/ui/navigation"
import { PostsFeed } from "@/components/ui/posts-feed"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <section className="space-y-3">
          <header className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/50">
              The feed
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.65rem]">
              Latest posts from the RLine community
            </h1>
            <p className="text-sm text-foreground/65">
              Simple, text-first posts from people who want a quieter social space.
            </p>
          </header>

          <div className="mt-4 rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm sm:p-6">
            <PostsFeed showHeader={false} />
          </div>
        </section>
      </main>
    </div>
  )
}
