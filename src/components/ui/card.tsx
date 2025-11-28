import React from "react"

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`comfy-card p-4 md:p-6 ${className}`}>{children}</div>
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-2 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`prose text-sm text-gray-800 ${className}`}>{children}</div>
}

export function CardFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mt-4 border-t border-gray-100 pt-4 ${className}`}>{children}</div>
}
