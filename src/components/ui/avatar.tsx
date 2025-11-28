"use client"

import * as AvatarPrimitive from "@radix-ui/react-avatar"
import React from "react"
import { cn } from "@/lib/utils"

function Avatar({ children, className = "" }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden ${className}`}
    >
      {children}
    </div>
  )
}

export function AvatarFallback({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center text-xs md:text-sm font-semibold uppercase bg-gradient-to-br from-[#fff0f4] to-[#fff7fb] text-[#d94678] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarImage }
