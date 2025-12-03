"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageCircle, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Navigation from "@/components/ui/navigation"
import { PostCard } from "@/components/ui/post-card"
import { API_URL } from '@/lib/api-config';
import { FollowButton } from "@/components/ui/follow-button"
import { isFollowing } from "@/lib/api"

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
    id?: string
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
  const [followStatus, setFollowStatus] = useState(false)
  const [checkingFollowStatus, setCheckingFollowStatus] = useState(false)

  const postId = searchParams.get("postId")

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (auth.token && post?.author?.id && auth.user?.id !== post.author.id) {
        setCheckingFollowStatus(true)
        try {
          const status = await isFollowing(post.author.id, auth)
          setFollowStatus(status.isFollowing)
        } catch (error) {
          console.error("Error checking follow status:", error)
        } finally {
          setCheckingFollowStatus(false)
        }
      } else {
        console.log("Skipping follow check")
        setFollowStatus(false)
      }
    }

    checkFollowStatus()
  }, [auth.token, post?.author?.id, auth.user?.id])

  const fetchPost = async () => {
    if (!postId) return

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/post`, {
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
      const response = await fetch(`${API_URL}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `userId=${auth.user?.id}&postId=${postId}&content=${encodeURIComponent(commentContent)}`,
        credentials: "include",
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
    return fetch(`${API_URL}/posts/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `userId=${userId}&postId=${postId}`,
    })
  }

  const dislikePost = async (postId: string, userId: string, likeId: string) => {
    return fetch(`${API_URL}/posts/dislike`, {
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
      <div className="min-h-screen">
        <Navigation />
        <main className="mx-auto flex max-w-4xl items-center justify-center px-4 py-16">
          <div className="rounded-2xl border border-border/70 bg-white/95 px-8 py-10 text-center shadow-sm">
            <h1 className="mb-3 text-xl font-semibold text-foreground">Post not found</h1>
            <p className="mb-6 text-sm text-foreground/65">
              We couldn&apos;t find that post. It may have been removed or the link is incorrect.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 rounded-full border-border/80 bg-background/80 px-4 py-1.5 text-xs font-medium text-foreground/80 hover:border-foreground/40 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="mx-auto max-w-4xl px-4 py-10">
          <div className="space-y-4">
            <div className="h-5 w-32 animate-pulse rounded bg-border/70" />
            <div className="rounded-2xl border border-border/70 bg-white/90 px-5 py-6 shadow-sm ring-1 ring-black/5">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 animate-pulse rounded-full bg-border/70" />
                <div className="flex-1 space-y-3">
                  <div className="h-3 w-1/3 rounded bg-border/80" />
                  <div className="h-3 w-2/3 rounded bg-border/70" />
                  <div className="h-3 w-full rounded bg-border/60" />
                  <div className="h-3 w-5/6 rounded bg-border/60" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="mx-auto flex max-w-4xl items-center justify-center px-4 py-16">
          <div className="rounded-2xl border border-border/70 bg-white/95 px-8 py-10 text-center shadow-sm">
            <h1 className="mb-3 text-xl font-semibold text-foreground">Post not found</h1>
            <p className="mb-6 text-sm text-foreground/65">
              We couldn&apos;t find that post. It may have been removed or the link is incorrect.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 rounded-full border-border/80 bg-background/80 px-4 py-1.5 text-xs font-medium text-foreground/80 hover:border-foreground/40 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen">
        <Navigation />

        <main className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 rounded-full border-border/80 bg-background/80 px-4 py-1.5 text-xs font-medium text-foreground/80 hover:border-foreground/40 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to feed
            </Button>
          </div>

          {auth.user?.id !== post.author?.id && post.author?.id && (
            <FollowButton
              key={`${post.author.id}-${followStatus}`}
              userId={post.author.id}
              initialIsFollowing={followStatus}
              isCheckingStatus={checkingFollowStatus}
            />
          )}

          <section className="mb-8">
            <PostCard
              id={post.id}
              author={post.author?.username ?? "Unknown"}
              content={post.content}
              title={post.title}
              likes={post.likes}
              comments={post.comments?.length ?? 0}
              timeAgo={formatTimeAgo(post.createdAt)}
              isLiked={isLiked}
              onLike={() => onToggleLike(postId!, !isLiked)}
              onComment={() => {
                const replySection = document.getElementById("rline-replies")
                if (replySection) replySection.scrollIntoView({ behavior: "smooth", block: "start" })
              }}
            />
          </section>

          <div className="space-y-6">
            <header id="rline-replies" className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/40">
                  Replies
                </p>
                <h2 className="text-lg font-semibold text-foreground">Conversation</h2>
                <p className="text-xs text-foreground/60">
                  Thoughts, reactions, and quiet back-and-forth.
                </p>
              </div>
              <span className="hidden rounded-full border border-border/80 px-3 py-1 text-xs font-medium text-foreground/70 sm:inline-flex">
                {post.comments?.length || 0}{" "}
                {(post.comments?.length || 0) === 1 ? "reply" : "replies"}
              </span>
            </header>

            {auth.token ? (
              <Card className="p-4 shadow-sm">
                <form onSubmit={handleCommentSubmit} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="mt-1 h-9 w-9 flex-shrink-0 ring-2 ring-pink-100">
                      <AvatarFallback>
                        {auth.user?.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <Textarea
                        placeholder="Share your thoughts..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        className="min-h-[100px] resize-none border-input text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={!commentContent.trim() || submittingComment}
                      className="rounded-full bg-gradient-to-r from-pink-600 to-pink-700 px-5 py-2 text-sm text-white shadow-sm hover:from-pink-700 hover:to-pink-800"
                    >
                      {submittingComment ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card>
                <CardContent className="mx-auto max-w-sm p-6 text-center">
                  <div>
                    <MessageCircle className="mx-auto mb-3 h-10 w-10 text-pink-300" />
                    <h3 className="mb-2 text-base font-semibold text-foreground">
                      Join the conversation
                    </h3>
                    <p className="mb-4 text-sm text-foreground/70">
                      Sign in to share your thoughts and reply to this post.
                    </p>
                    <Button
                      onClick={() => router.push("/login")}
                      className="rounded-full bg-gradient-to-r from-pink-600 to-pink-700 px-5 py-2 text-sm text-white shadow-sm hover:from-pink-700 hover:to-pink-800"
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
                  <li
                    key={c.id}
                    className="flex items-start gap-3 rounded-2xl border border-border/80 bg-white/95 p-4 shadow-sm transition-all hover:border-pink-200 hover:shadow-md"
                  >
                    <Avatar className="mt-0.5 h-8 w-8 flex-shrink-0 ring-2 ring-pink-100">
                      <AvatarFallback>
                        {(c.author?.username?.[0] ?? "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {c.author?.username ?? "Unknown"}
                        </span>
                        <span className="text-xs text-foreground/50">
                          {formatTimeAgo(c.createdAt)}
                        </span>
                      </div>

                      <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
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