export interface User {
  id: string
  username: string
  like: Array<{
    id: string
    postId: string
  }>
}

export interface AuthState {
  token: string
  user: User | null
}

// Mock auth state - replace with real authentication later
export const mockAuth: AuthState = {
  token: "mock-token", // Set to empty string to test unauthenticated state
  user: {
    id: "user-1",
    username: "testuser",
    like: [
      { id: "like-1", postId: "1" },
      { id: "like-4", postId: "4" },
    ],
  },
}
