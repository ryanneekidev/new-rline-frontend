"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"

interface User {
  id: string
  username: string
  email: string
  like: Array<{ id: string; postId: string }>
}

interface AuthContextType {
  user: User | null
  token: string
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
      const response = await fetch("https://api.rline.ryanneeki.xyz/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `username=${username}&password=${password}`,
      })
      const json = await response.json()

      if (json.token) {
        const decodedUser = jwtDecode<User>(json.token)
        setToken(json.token)
        setUser(decodedUser)
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
      const response = await fetch("https://api.rline.ryanneeki.xyz/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
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

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loginError,
        registerError,
        login,
        logout,
        register,
        clearAuthErrors,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
