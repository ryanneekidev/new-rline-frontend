"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { followUser, unfollowUser } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface FollowButtonProps {
    userId: string
    initialIsFollowing?: boolean
    isCheckingStatus?: boolean
}

export function FollowButton({ userId, initialIsFollowing = false, isCheckingStatus = false }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [loading, setLoading] = useState(false)
    const auth = useAuth()
    const router = useRouter()

    useEffect(() => {
        setIsFollowing(initialIsFollowing)
    }, [initialIsFollowing])

    const handleFollow = async () => {
        if (!auth.token) {
            router.push("/login")
            return
        }

        setLoading(true)
        setIsFollowing(true)

        try {
            await followUser(userId, auth)
        } catch (error) {
            setIsFollowing(false)
            console.error("Error following user:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleUnfollow = async () => {
        setLoading(true)
        setIsFollowing(false)

        try {
            await unfollowUser(userId, auth)
        } catch (error) {
            setIsFollowing(true)
            console.error("Error unfollowing user:", error)
        } finally {
            setLoading(false)
        }
    }

    if (isCheckingStatus) {
        return (
            <Button
                disabled
                variant="outline"
                size="sm"
                className="cursor-wait"
            >
                ...
            </Button>
        )
    }

    return (
        <Button
            onClick={isFollowing ? handleUnfollow : handleFollow}
            disabled={loading}
            variant={isFollowing ? "outline" : "default"}
            size="sm"
        >
            {loading ? "..." : isFollowing ? "Following" : "Follow"}
        </Button>
    )
}