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