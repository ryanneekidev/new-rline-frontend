"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageCircle, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Navigation from "@/components/ui/navigation"

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    username: string
  }
}

interface Post {
  id: string
  title: string
  content: string
  likes: number
  createdAt: string
  author: {
    username: string
  }
  comments: Comment[]
}

function PostContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const auth = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [likingPost, setLikingPost] = useState(false)

  const postId = searchParams.get("postId")

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  const fetchPost = async () => {
    if (!postId) return

    try {
      setLoading(true)
      const response = await fetch("https://api.rline.ryanneeki.xyz/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `postId=${postId}`,
      })

      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
      }
    } catch (error) {
      console.error("Error fetching post:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!auth.token) {
      router.push("/login")
      return
    }

    if (!commentContent.trim()) return

    try {
      setSubmittingComment(true)
      const response = await fetch("https://api.rline.ryanneeki.xyz/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `userId=${auth.user?.id}&postId=${postId}&content=${encodeURIComponent(commentContent)}`,
      })

      if (response.ok) {
        setCommentContent("")
        fetchPost() // Refresh post to show new comment
      }
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const likePost = async (postId: string, userId: string) => {
    return fetch("https://api.rline.ryanneeki.xyz/posts/like", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `userId=${userId}&postId=${postId}`,
    })
  }

  const dislikePost = async (postId: string, userId: string, likeId: string) => {
    return fetch("https://api.rline.ryanneeki.xyz/posts/dislike", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `userId=${userId}&postId=${postId}&likeId=${likeId}`,
    })
  }

  const onToggleLike = async (postId: string, like: boolean) => {
    // optimistic update of local post state
    setPost((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        likes: like ? (prev.likes ?? 0) + 1 : Math.max((prev.likes ?? 1) - 1, 0),
        liked: like,
      }
    })

    auth.togglePostLike(postId, like)

    try {
      if (like) await likePost(postId, auth.user!.id)
      else {
        const likeId = auth.user!.like?.find((l) => l.postId === postId)?.id
        if (likeId) await dislikePost(postId, auth.user!.id, likeId)
      }
    } catch (err) {
      // revert on error
      setPost((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          likes: like ? Math.max((prev.likes ?? 1) - 1, 0) : (prev.likes ?? 0) + 1,
          liked: !like,
        }
      })
      auth.togglePostLike(postId, !like)
      console.error("Error toggling like:", err)
    }
  }

  const isLiked = Boolean(auth.token && auth.user?.like?.some((like) => like.postId === postId))

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (!postId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
            <Button onClick={() => router.push("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading post...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
            <Button onClick={() => router.push("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="hover:bg-pink-50 hover:border-pink-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <Card className="mb-8 shadow-sm border-0 bg-white">
            <CardContent className="p-5">
              <div className="flex items-start gap-4 mb-5">
                <Avatar className="w-12 h-12 ring-2 ring-pink-100">
                  <AvatarFallback className="avatar-fallback">
                    {post.author?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">{post.author?.username || "Unknown User"}</span>
                    <span className="text-gray-500 text-xs">{formatTimeAgo(post.createdAt)}</span>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{post.title}</h1>
                  <p className="text-gray-700 leading-relaxed text-sm">{post.content}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-5 py-4 border-t bg-gray-50/50">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  onClick={() => onToggleLike(postId!, !isLiked)}
                  disabled={likingPost}
                  className={`flex items-center gap-2 transition-colors text-sm ${
                    isLiked ? "text-pink-600 hover:text-pink-700" : "text-gray-600 hover:text-pink-600"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                  <span className="text-sm">
                    {post.likes} {post.likes === 1 ? "like" : "likes"}
                  </span>
                </Button>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {post.comments?.length || 0} {(post.comments?.length || 0) === 1 ? "comment" : "comments"}
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Comments</h2>
              <span className="bg-pink-100 text-pink-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {post.comments?.length || 0}
              </span>
            </div>

            {auth.token ? (
              <Card className="shadow-sm border-0 bg-white p-4">
                <form onSubmit={handleCommentSubmit} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-9 h-9 flex-shrink-0 mt-1">
                      <AvatarFallback>
                        {auth.user?.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Textarea
                        placeholder="Share your thoughts..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        className="min-h-[100px] resize-none text-sm border-gray-200 focus:border-pink-300 focus:ring-pink-200"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={!commentContent.trim() || submittingComment}
                      className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white shadow-sm px-5 py-2 text-sm"
                    >
                      {submittingComment ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card className="shadow-sm border-0 bg-white">
                <CardContent className="p-6 text-center">
                  <div className="max-w-sm mx-auto">
                    <MessageCircle className="w-10 h-10 text-pink-300 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Join the conversation</h3>
                    <p className="text-sm text-gray-600 mb-4">Sign in to share your thoughts</p>
                    <Button
                      onClick={() => router.push("/login")}
                      className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white shadow-sm px-5 py-2 text-sm"
                    >
                      Sign In
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {post.comments && post.comments.length > 0 ? (
              <ul className="space-y-3">
                {post.comments.map((c) => (
                  <li key={c.id} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:border-pink-200 hover:shadow-sm transition-all">
                    <Avatar className="w-8 h-8 flex-shrink-0 mt-0.5">
                      <AvatarFallback>
                        {(c.author?.username?.[0] ?? "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">{c.author?.username ?? "Unknown"}</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(c.createdAt)}</span>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                        {c.content}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-600 text-center py-6">
                No comments yet — be the first to respond.
              </div>
            )}
          </div>
        </main>
      </div>
    </Suspense>
  )
}

export default function PostPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostContent />
    </Suspense>
  )
}