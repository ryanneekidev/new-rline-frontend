import { Navigation } from "@/components/ui/navigation"
import { PostsFeed } from "@/components/ui/posts-feed"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Latest posts</h1>

          <PostsFeed />
        </div>
      </main>
    </div>
  )
}
