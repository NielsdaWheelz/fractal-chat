'use client';
import {
    AvatarGroup,
    AvatarGroupTooltip,
} from './ui/avatar-group';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '../components/ui/avatar';


//pulling initials for fallback
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



    const colors = ["color-brand-50", "color-brand-100", "color-brand-200", "color-brand-300", "color-brand-400", "color-brand-500"];

    return (
        <div className="bg-gradient-to-r from-[#03B7F2] dark:from-[#9A5DFF] from-10% via-sky-100 dark:via-sky-950 via-30% to-emerald-100 dark:to-emerald-950 to-90% p-1.5 rounded-full">
            <AvatarGroup
                variant="css"
                invertOverlap
                tooltipProps={{ side: 'bottom', sideOffset: 12 }}
            >
                {updatedUsers.map((user, index) => (
                    <Avatar key={user.id} user={user} color={user.color}>
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