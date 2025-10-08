import AvatarGroupBottomDemo from "./groupavatar";

type Group = {
    id: string
    name: string
}

export default function groupsList({ groups }: { groups: Group[] }) {
    <div>
        <ul className="space-y-2">
            {groups.map((group) => (
                <li
                    key={group.id}
                    className="flex items-center gap-3 rounded-md border p-2 hover:bg-muted"
                >
                    <AvatarGroupBottomDemo {...group} />
                    <span className="truncate font-medium">{group.name}</span>
                </li>
            ))}
        </ul>
    </div>
}