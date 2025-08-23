"use client"

import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/ui/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfilePage() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-2xl mx-auto py-12 px-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">Please log in to view your profile.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-2xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Username</label>
              <p className="text-lg text-gray-900">{user.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Posts Liked</label>
              <p className="text-lg text-gray-900">{user.like?.length || 0}</p>
            </div>
            <div className="pt-4">
              <Button onClick={handleLogout} variant="destructive" className="w-full">
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
