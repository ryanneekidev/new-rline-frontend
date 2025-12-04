"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navigation } from "@/components/ui/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, FileText, UsersRound, UserRoundPlus } from "lucide-react"
import { getPosts, getFollowCounts, isFollowing, getUserPostCount } from "@/lib/api"
import { FollowButton } from "@/components/ui/follow-button"
import { API_URL } from "@/lib/api-config"

export default function ProfilePage() {
    const params = useParams()
    const username = params.username as string
    const auth = useAuth()
    const { user: currentUser, token, logout } = auth

    const [profileUser, setProfileUser] = useState<any>(null)
    const [postsCount, setPostsCount] = useState(0)
    const [followersCount, setFollowersCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)
    const [followStatus, setFollowStatus] = useState(false)
    const [checkingFollowStatus, setCheckingFollowStatus] = useState(false)
    const [loading, setLoading] = useState(true)

    const isOwnProfile = currentUser?.username === username

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true)

                // Fetch user by username
                const response = await fetch(`${API_URL}/users/username/${username}`)
                const data = await response.json()
                setProfileUser(data.user)

                if (data.user) {
                    // Fetch posts count
                    const userPostCount = await getUserPostCount(data.user.id)
                    setPostsCount(userPostCount)

                    // Fetch follow counts
                    const counts = await getFollowCounts(data.user.id)
                    setFollowersCount(counts.followersCount)
                    setFollowingCount(counts.followingCount)

                    // Check follow status if not own profile
                    if (!isOwnProfile && token) {
                        setCheckingFollowStatus(true)
                        const status = await isFollowing(data.user.id, auth)
                        setFollowStatus(status.isFollowing)
                        setCheckingFollowStatus(false)
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error)
            } finally {
                setLoading(false)
            }
        }

        if (username) {
            fetchProfile()
        }
    }, [username, currentUser?.username])

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation />
                <main className="max-w-4xl mx-auto px-4 py-12">
                    <Card className="shadow-sm">
                        <CardContent className="p-8 text-center">
                            <p className="text-sm text-foreground/70">Loading profile...</p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen bg-background">
                <Navigation />
                <main className="max-w-4xl mx-auto px-4 py-12">
                    <Card className="shadow-sm">
                        <CardContent className="p-8 text-center">
                            <p className="text-sm text-foreground/70">User not found.</p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    const initial = profileUser.username?.[0]?.toUpperCase() ?? "U"

    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="space-y-6">
                    <header className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/40">
                            {isOwnProfile ? "Profile" : "User Profile"}
                        </p>
                        <p className="text-sm text-foreground/60">
                            {isOwnProfile
                                ? "Manage your RLine presence and preferences."
                                : "View posts and activity."}
                        </p>
                    </header>

                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div className="flex items-start gap-4">
                                    <div
                                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-pink-700"
                                        style={{
                                            background:
                                                "radial-gradient(circle at 20% 20%, rgba(244,114,182,0.18), transparent 55%), radial-gradient(circle at 80% 0%, rgba(59,130,246,0.18), transparent 45%), #fff5fa",
                                        }}
                                    >
                                        {initial}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg font-semibold text-foreground mb-1">{profileUser.username}</h2>
                                        {isOwnProfile && <p className="text-sm text-foreground/60">{profileUser.email}</p>}
                                    </div>
                                </div>

                                {/* Follow button for other users */}
                                {!isOwnProfile && (
                                    <FollowButton
                                        userId={profileUser.id}
                                        initialIsFollowing={followStatus}
                                        isCheckingStatus={checkingFollowStatus}
                                        onFollowChange={(delta) => setFollowersCount(prev => prev + delta)}
                                    />
                                )}
                            </div>

                            <div className="pt-6 border-t border-border/80">
                                <div className="grid grid-cols-2 gap-6">
                                    {isOwnProfile && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/10">
                                                <Heart className="h-5 w-5 text-pink-600" />
                                            </div>
                                            <div>
                                                <p className="text-base font-semibold text-foreground">
                                                    {currentUser.like?.length || 0}
                                                </p>
                                                <p className="text-xs text-foreground/50">Posts liked</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-base font-semibold text-foreground">{postsCount}</p>
                                            <p className="text-xs text-foreground/50">Posts</p>
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

                            {isOwnProfile && (
                                <div className="mt-6 pt-6 border-t border-border/80">
                                    <Button
                                        onClick={logout}
                                        variant="outline"
                                        className="w-full rounded-full border-border/80 text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                                    >
                                        Sign out
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}