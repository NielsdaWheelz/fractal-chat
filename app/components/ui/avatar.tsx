"use client"

import * as AvatarPrimitive from "@radix-ui/react-avatar"
import * as React from "react"
import { cn } from "~/lib/utils"
import type { User } from "~/types/types"

// const borderColor = "#000000"

type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root> & {
  user: User
}

function Avatar({
  className, user, color,
  ...props
}: AvatarProps) {

  const colors = ["#a87af5", "#f57ac7", "#f5a87a", "#c7f57a", "#7af5a8", "#7ac7f5"];

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

export { Avatar, AvatarFallback, AvatarImage }

