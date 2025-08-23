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
    if (auth.token !== "") {
      try {
        const response = await likePost(postId, auth.user!.id)
        auth.user!.like = response.updatedLikes
        await fetchPosts()
      } catch (error) {
        console.error("Error liking post:", error)
      }
    } else {
      router.push("/login")
    }
  }

  const handleDislikePost = async (postId: string) => {
    if (auth.token !== "") {
      try {
        const likeId = auth.user!.like.find((like) => like.postId === postId)?.id
        if (likeId) {
          const response = await dislikePost(postId, auth.user!.id, likeId)
          auth.user!.like = response.updatedLikes
          await fetchPosts()
        }
      } catch (error) {
        console.error("Error disliking post:", error)
      }
    } else {
      router.push("/login")
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
        const isLiked = Boolean(auth.token && auth.user?.like.some((like) => like.postId === post.id))

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
