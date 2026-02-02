"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { API_URL } from '@/lib/api-config';

export type User = {
  id: string
  username?: string
  email?: string
  like?: { id: string; postId: string }[]
}

export type AuthContextType = {
  user: User | null
  token: string
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  togglePostLike: (postId: string, liked: boolean, likeRecord?: { id: string; postId: string } | null) => void
  loginError: string
  registerError: string
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  register: (username: string, password: string, confirmedPassword: string, email: string) => Promise<void>
  clearAuthErrors: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string>("")
  const [loginError, setLoginError] = useState<string>("")
  const [registerError, setRegisterError] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const router = useRouter()

  useEffect(() => {
	const savedToken = localStorage.getItem("rline_token")
	if (savedToken) {
	  try {
		const decodedUser = jwtDecode<User>(savedToken)
		setToken(savedToken)
		setUser(decodedUser)

		const fetchUserLikes = async () => {
		  if (decodedUser?.id) {
			const response = await fetch(`${API_URL}/users/${decodedUser.id}/likes`)
			const data = await response.json()
			setUser(prev => prev ? { ...prev, like: data.likes } : null)
		  }
		}
		fetchUserLikes()
	  } catch (error) {
		console.error("Invalid token in localStorage:", error)
		localStorage.removeItem("rline_token")
	  }
	}
	setIsLoading(false)
  }, [])

  const clearAuthErrors = () => {
	setLoginError("")
	setRegisterError("")
  }

  const login = async (username: string, password: string) => {
	try {
	  clearAuthErrors()
	  const response = await fetch(`${API_URL}/login`, {
		method: "POST",
		headers: {
		  "Content-Type": "application/x-www-form-urlencoded",
		},
		credentials: "include",
		body: `username=${username}&password=${password}`,
	  })
	  const json = await response.json()

	  if (json.token) {
		const decodedUser = jwtDecode<User>(json.token)
		setToken(json.token)
		setUser({
		  ...decodedUser,
		  like: json.likes
		})
		localStorage.setItem("rline_token", json.token)
		clearAuthErrors()
		router.push("/")
		return
	  }

	  setLoginError(json.message)
	  throw new Error(json.message)
	} catch (err) {
	  console.error(err)
	}
  }

  const logout = () => {
	if (token !== "" && user) {
	  setUser(null)
	  setToken("")
	  localStorage.removeItem("rline_token")
	  clearAuthErrors()
	  router.push("/login")
	}
  }

  const register = async (username: string, password: string, confirmedPassword: string, email: string) => {
	try {
	  clearAuthErrors()
	  const response = await fetch(`${API_URL}/register`, {
		method: "POST",
		headers: {
		  "Content-Type": "application/x-www-form-urlencoded",
		},
		credentials: "include",
		body: `username=${username}&password=${password}&confirmedPassword=${confirmedPassword}&email=${email}`,
	  })
	  const json = await response.json()

	  if (json.pass) {
		router.push("/login")
		clearAuthErrors()
		return
	  }

	  setRegisterError(json.message)
	  throw new Error(json.message)
	} catch (err) {
	  console.error(err)
	}
  }

  const togglePostLike = (postId: string, liked: boolean, likeRecord: { id: string; postId: string } | null = null) => {
	setUser((prev) => {
	  if (!prev) return prev
	  const currentLikes = [...(prev.like ?? [])]
	  if (liked) {
		// add a like record (avoid duplicates)
		if (!currentLikes.some((l) => l.postId === postId)) {
		  currentLikes.push(likeRecord ?? { id: String(Date.now()), postId })
		}
	  } else {
		// remove
		const filtered = currentLikes.filter((l) => l.postId !== postId)
		return { ...prev, like: filtered }
	  }
	  return { ...prev, like: currentLikes }
	})
  }

  const value: AuthContextType = { user, token, setUser, togglePostLike, loginError, registerError, login, logout, register, clearAuthErrors, isLoading }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
	throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
