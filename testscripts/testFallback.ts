import users from "./dummydata"

// retrieving initials from name for fallback
const updatedUsers = users.map((user) => {
    const parts = user.name.trim().split(/\s+/)

    const initials =
        parts.length >= 2
            ? parts[0][0] + parts[parts.length - 1][0]
            : parts[0][0]

    const fallback = initials.toUpperCase()
    return { ...user, fallback }
})
console.log(updatedUsers[0])