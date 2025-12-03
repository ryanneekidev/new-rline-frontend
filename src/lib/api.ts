import { API_URL } from '@/lib/api-config';
import { makeAuthenticatedRequest } from './authFetch';
import type { AuthContextType } from "@/contexts/auth-context"

export interface Post {
  id: string
  title?: string
  content: string
  author: {
    username: string
  }
  createdAt: string
  postStatus: string
  likes: number
  comments: Array<any>
}

export const getPosts = async (): Promise<Post[]> => {
  try {
    const response = await fetch(`${API_URL}/posts`, {
      method: "GET",
    })
    const res = await response.json()
    return res
  } catch (error) {
    console.error("Error fetching posts:", error)
    // Return mock data if API fails
    return [
      {
        id: "1",
        content:
          "Just finished reading an amazing book about web development. The way modern frameworks handle state management is fascinating! Anyone else diving deep into React lately?",
        author: { username: "Alex Johnson" },
        createdAt: "2024-01-15T10:00:00Z",
        postStatus: "published",
        likes: 12,
        comments: [{}, {}, {}],
      },
      {
        id: "2",
        content:
          "Beautiful sunset today! Sometimes you just need to step away from the screen and appreciate the simple things in life. Hope everyone is having a great day! 🌅",
        author: { username: "Sarah Chen" },
        createdAt: "2024-01-15T08:00:00Z",
        postStatus: "published",
        likes: 8,
        comments: [{}],
      },
      {
        id: "3",
        content:
          "Working on a new project using Next.js and it's incredible how much the developer experience has improved. The app router is a game changer for building modern web applications.",
        author: { username: "Mike Rodriguez" },
        createdAt: "2024-01-15T06:00:00Z",
        postStatus: "published",
        likes: 15,
        comments: [{}, {}, {}, {}, {}, {}, {}],
      },
      {
        id: "4",
        content:
          "Coffee shop coding session complete! There's something magical about the ambient noise that helps with focus. What's your favorite place to work from?",
        author: { username: "Emma Wilson" },
        createdAt: "2024-01-15T04:00:00Z",
        postStatus: "published",
        likes: 6,
        comments: [{}, {}],
      },
    ]
  }
}

export const likePost = async (postId: string, userId: string): Promise<any> => {
  const response = await fetch(`${API_URL}/posts/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `userId=${userId}&postId=${postId}`,
    credentials: "include",
  })
  return await response.json()
}

export const dislikePost = async (postId: string, userId: string, likeId: string): Promise<any> => {
  const response = await fetch(`${API_URL}/posts/dislike`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `userId=${userId}&postId=${postId}&likeId=${likeId}`,
    credentials: "include",
  })
  return await response.json()
}

export const followUser = async (followingId: string, auth: AuthContextType): Promise<any> => {
  const response = await makeAuthenticatedRequest(
    `${API_URL}/users/follow`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `followingId=${followingId}`,
    },
    auth
  )
  return await response.json()
}

export const unfollowUser = async (followingId: string, auth: AuthContextType): Promise<any> => {
  const response = await makeAuthenticatedRequest(
    `${API_URL}/users/unfollow`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `followingId=${followingId}`,
    },
    auth
  )
  return await response.json()
}

export const getFollowCounts = async (userId: string): Promise<any> => {
  const response = await fetch(`${API_URL}/users/${userId}/follow-counts`)
  return await response.json()
}

export const isFollowing = async (userId: string, auth: AuthContextType): Promise<any> => {
  const response = await makeAuthenticatedRequest(
    `${API_URL}/users/${userId}/is-following`,
    { method: "GET" },
    auth
  )
  return await response.json()
}
