"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PostCard } from "./post-card"
import { getPosts, likePost, dislikePost, type Post } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { formatTimeAgo } from "@/lib/utils"

export function PostsFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const auth = useAuth()
  const router = useRouter()

  const fetchPosts = async () => {
    try {
      const fetchedPosts = await getPosts()
      setPosts(fetchedPosts)
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
    return <div className="text-center py-8">Loading posts...</div>
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const isLiked = Boolean(auth.token && auth.user?.like?.some((like) => like.postId === post.id))

        return (
          <PostCard
            key={post.id}
            id={post.id}
            author={post.author.username}
            content={post.content}
            likes={post.likes}
            comments={post.comments.length}
            timeAgo={formatTimeAgo(post.createdAt)}
            isLiked={isLiked}
            onLike={() => (isLiked ? handleDislikePost(post.id) : handleLikePost(post.id))}
            onComment={() => navigateToPost(post.id)}
          />
        )
      })}
    </div>
  )
}
