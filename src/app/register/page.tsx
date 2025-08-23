"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Navigation } from "@/components/ui/navigation"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { register, registerError, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await register(username, password, confirmPassword, email)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">Join RLine and start sharing your thoughts</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-pink-600">Sign Up</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                {registerError && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{registerError}</div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-pink-600 hover:text-pink-700 font-medium">
                    Sign in here!
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
