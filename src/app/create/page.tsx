"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { makeAuthenticatedRequest } from '@/lib/authFetch'

export default function CreatePage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const auth = useAuth()
  const user = auth?.user
  const token = auth?.token || ""
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.push("/login")
    }
  }, [token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      setError("Please fill in both title and content")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await makeAuthenticatedRequest(
        "https://api.rline.ryanneeki.xyz/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `title=${encodeURIComponent(title)}&content=${content}&userId=${user?.id}`,
        },
        auth
      )

      const data = await response.json()

      if (response.ok) {
        router.push("/")
      } else {
        console.log(data)
        setError(data.message || "Failed to create post")
      }
    } catch (err) {
      console.log(err)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-foreground/70">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <header className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/40">Create</p>
            <h1 className="text-2xl font-semibold text-foreground">Share your thoughts</h1>
            <p className="text-sm text-foreground/60">Write something meaningful for the RLine community.</p>
          </header>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="title" className="block text-xs font-medium uppercase tracking-[0.1em] text-foreground/50 mb-2">
                    Title
                  </label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your post a title..."
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-xs font-medium uppercase tracking-[0.1em] text-foreground/50 mb-2">
                    Content
                  </label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full min-h-[160px] resize-none"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-red-500/30 bg-red-50/50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/")}
                    className="flex-1 rounded-full border-border/80 text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-sm hover:from-pink-600 hover:to-pink-700"
                    disabled={isLoading || !title.trim() || !content.trim()}
                  >
                    {isLoading ? "Creating..." : "Publish"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
