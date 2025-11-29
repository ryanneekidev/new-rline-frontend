"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PostCard } from "./post-card"
import { getPosts, likePost, dislikePost, type Post } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { formatTimeAgo } from "@/lib/utils"

export function PostsFeed({ showHeader = true }: { showHeader?: boolean }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const auth = useAuth()
  const router = useRouter()

  const fetchPosts = async () => {
    try {
      const fetchedPosts = await getPosts()
      // Sort posts by createdAt in descending order (newest first)
      const sortedPosts = fetchedPosts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setPosts(sortedPosts)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleLikePost = async (postId: string) => {
    if (auth.token === "") {
      router.push("/login")
      return
    }

    // optimistic update: mark the post liked locally
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likes: (p.likes ?? 0) + 1, _optimisticLiked: true } : p
      )
    )

    // update auth immutably via provider
    auth.togglePostLike(postId, true)

    try {
      const response = await likePost(postId, auth.user!.id)
      // use real response to update auth if it contains canonical likes
      if (response?.updatedLikes) auth.setUser((u) => (u ? { ...u, like: response.updatedLikes } : u))
      // replace optimistic flag
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, _optimisticLiked: undefined } : p)))
    } catch (error) {
      // revert on error
      auth.togglePostLike(postId, false)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likes: Math.max((p.likes ?? 1) - 1, 0), _optimisticLiked: undefined } : p
        )
      )
      console.error("Error liking post:", error)
    }
  }

  const handleDislikePost = async (postId: string) => {
    if (auth.token === "") {
      router.push("/login")
      return
    }

    // optimistic local update
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: Math.max((p.likes ?? 1) - 1, 0), _optimisticLiked: false } : p))
    )

    auth.togglePostLike(postId, false)

    try {
      const likeId = auth.user!.like?.find((like) => like.postId === postId)?.id
      if (likeId) {
        const response = await dislikePost(postId, auth.user!.id, likeId)
        if (response?.updatedLikes) auth.setUser((u) => (u ? { ...u, like: response.updatedLikes } : u))
      }
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, _optimisticLiked: undefined } : p)))
    } catch (error) {
      // revert
      auth.togglePostLike(postId, true)
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: (p.likes ?? 0) + 1, _optimisticLiked: undefined } : p))
      )
      console.error("Error disliking post:", error)
    }
  }

  const navigateToPost = (postId: string) => {
    router.push(`/post?postId=${postId}`)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, idx) => (
          <div
            key={idx}
            className="animate-pulse rounded-2xl border border-border/70 bg-white/80 px-5 py-5 ring-1 ring-black/5"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-border/80" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-border/80" />
                <div className="h-3 w-1/4 rounded bg-border/60" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded bg-border/70" />
              <div className="h-3 w-2/3 rounded bg-border/60" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <section className="space-y-6">
      {showHeader && (
        <header className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/40">Latest</p>
          <h2 className="text-xl font-semibold text-foreground">A simple, soulful feed</h2>
          <p className="text-sm text-foreground/60">Gentle microblogging without the noise.</p>
        </header>
      )}

      <div className="space-y-5">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-white/70 p-10 text-center">
            <p className="text-sm text-foreground/70">No posts yet — be the first to share something.</p>
          </div>
        ) : (
          posts.map((post) => {
            const isLiked = Boolean(auth.token && auth.user?.like?.some((like) => like.postId === post.id))

            return (
              <PostCard
                key={post.id}
                id={post.id}
                author={post.author?.username ?? "Unknown"}
                content={post.content}
                likes={post.likes}
                comments={post.comments?.length ?? 0}
                title={post.title}
                timeAgo={formatTimeAgo(post.createdAt)}
                isLiked={isLiked}
                onLike={() => (isLiked ? handleDislikePost(post.id) : handleLikePost(post.id))}
                onComment={() => navigateToPost(post.id)}
              />
            )
          })
        )}
      </div>
    </section>
  )
}
