"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export function Navigation() {
  const { user, token } = useAuth()

  return (
    <nav className="bg-pink-600 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold hover:text-pink-100 transition-colors duration-200">
              RLine
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="/"
                className="text-white hover:text-pink-100 hover:bg-pink-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                href="/create"
                className="text-white hover:text-pink-100 hover:bg-pink-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Create
              </Link>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {token ? (
              <Button
                className="bg-gradient-to-r from-white to-pink-50 text-pink-600 hover:from-pink-100 hover:to-pink-200 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                asChild
              >
                <Link href="/profile">Profile</Link>
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-white hover:text-pink-100 hover:bg-pink-700 transition-colors duration-200"
                  asChild
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button
                  className="bg-gradient-to-r from-white to-pink-50 text-pink-600 hover:from-pink-100 hover:to-pink-200 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                  asChild
                >
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button - placeholder for future responsive implementation */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="text-white hover:text-pink-100 hover:bg-pink-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
