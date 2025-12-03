"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/ui/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, FileText, UsersRound, UserRoundPlus } from "lucide-react"
import { getPosts, getFollowCounts } from "@/lib/api"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [postsCount, setPostsCount] = useState(0)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  useEffect(() => {
    if (user?.username) {
      getPosts().then((posts) => {
        const userPosts = posts.filter((post) => post.author?.username === user.username)
        setPostsCount(userPosts.length)
      })

      getFollowCounts(user.id).then(
        (data) => {
          setFollowersCount(data.followersCount)
          setFollowingCount(data.followingCount)
        })
    }
  }, [user?.username])

  const handleLogout = () => {
    logout()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <Card className="shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-foreground/70">Please log in to view your profile.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const initial = user.username?.[0]?.toUpperCase() ?? "U"

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <header className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/40">Profile</p>
            <h1 className="text-2xl font-semibold text-foreground">Your account</h1>
            <p className="text-sm text-foreground/60">Manage your RLine presence and preferences.</p>
          </header>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-pink-700"
                  aria-hidden
                  style={{
                    background:
                      "radial-gradient(circle at 20% 20%, rgba(244,114,182,0.18), transparent 55%), radial-gradient(circle at 80% 0%, rgba(59,130,246,0.18), transparent 45%), #fff5fa",
                  }}
                >
                  {initial}
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-foreground mb-1">{user.username}</h2>
                  <p className="text-sm text-foreground/60">{user.email}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-border/80">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/10">
                      <Heart className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">{user.like?.length || "Loading"}</p>
                      <p className="text-xs text-foreground/50">Posts liked</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">{postsCount == 0 ? postsCount : postsCount || "Loading..."}</p>
                      <p className="text-xs text-foreground/50">Your posts</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10">
                      <UserRoundPlus className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">{followersCount}</p>
                      <p className="text-xs text-foreground/50">Followers</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
                      <UsersRound className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">{followingCount}</p>
                      <p className="text-xs text-foreground/50">Following</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border/80">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full rounded-full border-border/80 text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                >
                  Sign out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
