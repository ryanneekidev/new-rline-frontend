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
  title?: string
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
  title,
  isLiked = false,
  onLike,
  onComment,
}: PostCardProps) {
  const initial = author?.[0]?.toUpperCase() ?? "U"

  return (
    <article
      className="group rounded-2xl border border-border/70 bg-gradient-to-b from-white/98 via-white to-white/95 px-5 py-4 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:shadow-lg"
      role="article"
    >
      <header className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-pink-700"
          aria-hidden
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(244,114,182,0.18), transparent 55%), radial-gradient(circle at 80% 0%, rgba(59,130,246,0.18), transparent 45%), #fff5fa",
          }}
        >
          {initial}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{author}</span>
            <span className="text-xs text-foreground/50">{timeAgo}</span>
          </div>
          <span className="text-[0.75rem] text-foreground/45">Public post</span>
        </div>
      </header>

      <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
        {title && (
          <h2 className="text-base font-semibold leading-snug text-foreground">
            {title}
          </h2>
        )}
        <p>{content}</p>
      </div>

      <footer className="mt-5 flex items-center justify-end gap-2 border-t border-border/80 pt-4">
        <button
          onClick={onLike}
          aria-pressed={isLiked}
          className={[
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all",
            isLiked
              ? "border-pink-500/40 bg-pink-500/10 text-pink-600 hover:border-pink-500/60"
              : "border-border/80 text-foreground/70 hover:text-pink-600 hover:border-pink-500/30",
          ].join(" ")}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          <span>
            {isLiked ? "Liked" : "Like"}{" "}
            <span className="opacity-60">{likes}</span>
          </span>
        </button>

        <button
          onClick={onComment}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/80 px-3 py-1 text-xs font-semibold text-foreground/70 transition-all hover:border-blue-500/40 hover:text-blue-600"
        >
          <MessageCircle className="h-4 w-4" />
          <span>
            Reply <span className="opacity-60">{comments}</span>
          </span>
        </button>
      </footer>
    </article>
  )
}
