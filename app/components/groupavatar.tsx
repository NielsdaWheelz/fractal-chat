'use client';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '../components/ui/avatar';
import {
    AvatarGroup,
    AvatarGroupTooltip,
} from '../../components/ui/shadcn-io/avatar-group';
import { useEffect, useState } from "react"
import type { User } from '~/types/types';
import { users } from 'testscripts/dummydata';


//creating avatar stack
export const GroupAvatarStack = ({ users }) => {
    const updatedUsers = users.map((user) => {
        const parts = user.name.trim().split(/\s+/)

        const initials =
            parts.length >= 2
                ? parts[0][0] + parts[parts.length - 1][0]
                : parts[0][0]

        const fallback = initials.toUpperCase()
        return { ...user, fallback }
    })

    const colors = ["red", "purple", "blue", "green", "orange", "gray"];

    return (
        <div className="bg-gradient-to-r from-indigo-100 dark:from-indigo-950 from-10% via-sky-100 dark:via-sky-950 via-30% to-emerald-100 dark:to-emerald-950 to-90% p-1.5 rounded-full">
            <AvatarGroup
                variant="css"
                invertOverlap
                tooltipProps={{ side: 'bottom', sideOffset: 12 }}
            >
                {updatedUsers.map((user, index) => (
                    <Avatar key={user.id} user={user}>
                        <AvatarImage src={user.image} />
                        <AvatarFallback>{user.fallback}</AvatarFallback>
                        <AvatarGroupTooltip>
                            <p>{user.name}</p>
                        </AvatarGroupTooltip>
                    </Avatar>
                ))}
            </AvatarGroup>
        </div>
    );
};
export default GroupAvatarStack;