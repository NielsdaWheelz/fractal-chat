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
import type { User } from '~/types/types';
import { users } from 'testscripts/dummydata';

// const members = [
//     {
//         src: 'https://pbs.twimg.com/profile_images/1909615404789506048/MTqvRsjo_400x400.jpg',
//         fallback: 'SK',
//         tooltip: 'Skyleen',
//     },
//     {
//         src: 'https://pbs.twimg.com/profile_images/1593304942210478080/TUYae5z7_400x400.jpg',
//         fallback: 'CN',
//         tooltip: 'Shadcn',
//     },
//     {
//         src: 'https://pbs.twimg.com/profile_images/1677042510839857154/Kq4tpySA_400x400.jpg',
//         fallback: 'AW',
//         tooltip: 'Adam Wathan',
//     },
//     {
//         src: 'https://pbs.twimg.com/profile_images/1783856060249595904/8TfcCN0r_400x400.jpg',
//         fallback: 'GR',
//         tooltip: 'Guillermo Rauch',
//     },
//     {
//         src: 'https://pbs.twimg.com/profile_images/1534700564810018816/anAuSfkp_400x400.jpg',
//         fallback: 'JH',
//         tooltip: 'Jhey',
//     },
// ];

// user = {
//     id: text("id").primaryKey(),
//     name: text("name").notNull(),
//     email: text(email).notNull().unique(),
//     emailVerified: boolean("email_verified").default(false).notNull(),
//     image: text("image"),
//     friends: text("friends").array(),
//     createdAt: timestamp("created_at").defaultNow().notNull(),
//     updatedAt: timestamp("created_at").defaultNow().notNull()
// }

//fetch user data with getUsers(in groups.server.ts)

//fetch group members with getGroups(in groups.server.ts)

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

//creating avatar stack
export const GroupAvatarStack = ({ id, name }) => {
    return (
        <div className="bg-gradient-to-r from-indigo-100 dark:from-indigo-950 from-10% via-sky-100 dark:via-sky-950 via-30% to-emerald-100 dark:to-emerald-950 to-90% p-1.5 rounded-full">
            <AvatarGroup
                variant="css"
                invertOverlap
                tooltipProps={{ side: 'bottom', sideOffset: 12 }}
            >
                {updatedUsers.map((user, index) => (
                    <Avatar key={index}>
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