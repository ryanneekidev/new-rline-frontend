"use client"

import { Heart, MessageCircle, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface PostCardProps {
  id: string
  author: string
  content: string
  likes: number
  comments: number
  timeAgo: string
  isLiked?: boolean
  onLike: () => void | Promise<void>
  onComment: () => void
}

export function PostCard({
  id,
  author,
  content,
  likes,
  comments,
  timeAgo,
  isLiked = false,
  onLike,
  onComment,
}: PostCardProps) {
  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {author.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{author}</p>
              <p className="text-sm text-gray-500">{timeAgo}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        <p className="text-gray-800 leading-relaxed">{content}</p>
      </CardContent>

      <CardFooter className="pt-0 border-t border-gray-100">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className={`flex items-center space-x-2 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200 ${
                isLiked ? "text-pink-600" : "text-gray-500"
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-sm font-medium">{isLiked ? "Liked" : "Like"}</span>
              <span className="text-sm font-medium">({likes})</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onComment}
              className="flex items-center space-x-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Comment</span>
              <span className="text-sm font-medium">({comments})</span>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
