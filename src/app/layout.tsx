// src/app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/contexts/auth-context"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "RLine - Share Your Thoughts",
  description: "A public place where people share text posts and interact through likes and comments",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={[
          "min-h-screen bg-background text-foreground antialiased",
          "selection:bg-pink-100 selection:text-pink-900",
          geistSans.variable,
          geistMono.variable,
        ].join(" ")}
      >
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.12),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),_transparent_55%)]">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  )
}