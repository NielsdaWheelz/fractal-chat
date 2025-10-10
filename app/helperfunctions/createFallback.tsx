import type { User } from "~/types/types"

//pulling initials for fallback
export default function createFallback(user: User) {
    const parts = user.name.trim().split(/\s+/)

    const initials =
        parts.length >= 2
            ? parts[0][0] + parts[parts.length - 1][0]
            : parts[0][0]

    const fallback = initials.toUpperCase()
    return { ...user, fallback }
}