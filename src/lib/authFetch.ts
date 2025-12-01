import type { AuthContextType } from "@/contexts/auth-context"
import { jwtDecode } from "jwt-decode"
import type { User } from "@/contexts/auth-context"

export const makeAuthenticatedRequest = async (
  url: string,
  options: RequestInit = {},
  auth: AuthContextType
): Promise<Response> => {
  // Get current token from auth context
  const token = auth.token

  // First attempt with current token
  let response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    }
  })

  // If we get 401, try to refresh and retry once
  if (response.status === 403) {
    const refreshResponse = await fetch("https://api.rline.ryanneeki.xyz/refresh", {
      method: "POST",
      credentials: "include",
    })

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json()
      const newToken = refreshData.token
      const decodedUser = jwtDecode<User>(newToken)
      
      // Update context state using setters
      auth.setUser(decodedUser)
      // Note: You need to add setToken to your context (see below)
      
      // Update localStorage
      localStorage.setItem("rline_token", newToken)
      
      // Retry original request with new token
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
        credentials: 'include',
      })
    } else {
      // Refresh failed - clear auth and redirect
      auth.logout()
      throw new Error("Session expired. Please login again.")
    }
  }

  return response
}