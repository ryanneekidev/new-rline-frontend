"use client"

import React from "react"
import { Heart, MessageCircle } from "lucide-react"

type PostCardProps = {
  id: string
  author: string
  content: string
  likes: number
  comments: number
  timeAgo: string
  isLiked?: boolean
  onLike?: () => void
  onComment?: () => void
}

export function PostCard({
  author,
  content,
  likes,
  comments,
  timeAgo,
  isLiked = false,
  onLike,
  onComment,
}: PostCardProps) {
  const initial = author?.[0]?.toUpperCase() ?? "U"

  return (
    <article
      className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 duration-150 border border-gray-200 hover:border-pink-200"
      role="article"
    >
      <div className="p-5">
        <header className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm overflow-hidden"
            aria-hidden
            style={{ background: "linear-gradient(135deg,#ffdfe8,#ffeef6)" }}
          >
            {initial}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{author}</span>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
        </header>

        <div className="mt-4 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>

        <footer className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onLike}
              aria-pressed={isLiked}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isLiked
                  ? "text-pink-600 bg-pink-50 hover:bg-pink-100"
                  : "text-gray-600 hover:text-pink-600 hover:bg-gray-100"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{likes}</span>
            </button>

            <button
              onClick={onComment}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{comments}</span>
            </button>
          </div>
        </footer>
      </div>
    </article>
  )
}
