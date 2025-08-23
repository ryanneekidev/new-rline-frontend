"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"

export default function CreatePage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { user, token } = useAuth()
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
      const response = await fetch("https://api.rline.ryanneeki.xyz/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
        body: `title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}&userId=${user?.id}`,
      })

      if (response.ok) {
        router.push("/")
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to create post")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create a Post</h2>
            <p className="mt-2 text-sm text-gray-600">Share your thoughts with the RLine community</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-pink-600">New Post</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Post Title
                  </label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your post title..."
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Post Content
                  </label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full min-h-[120px] resize-none"
                    disabled={isLoading}
                  />
                </div>

                {error && <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">{error}</div>}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/")}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                    disabled={isLoading || !title.trim() || !content.trim()}
                  >
                    {isLoading ? "Creating..." : "Create Post"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
