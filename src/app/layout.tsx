import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/contexts/auth-context"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <head>
        <style>{`
html {
  font-family: ${geistSans.style.fontFamily};
  --font-sans: ${geistMono.variable};
  --font-mono: ${geistMono.variable};
}
        `}</style>
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}