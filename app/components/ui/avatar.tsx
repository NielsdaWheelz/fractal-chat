"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import type { User } from "~/types/types"
import { cn } from "~/lib/utils"

// const borderColor = "#000000"

type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root> & {
  user: User
}

function Avatar({
  className, user, color,
  ...props
}: AvatarProps) {

  const colors = ["red", "purple", "blue", "green", "orange", "gray"];


  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full border-3",
        className
      )}
      // onClick={() => console.log("color" + color)}
      style={{ borderColor: colors[Number(color)] }}
      {...props}
    />
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

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
