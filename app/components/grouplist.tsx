import GroupAvatarStack from "./groupavatar";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "./ui/form";
import { Popover } from "./ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "./ui/command";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Tooltip } from "./ui/tooltip";
import { useSonner } from "sonner";
import { Skeleton } from "./ui/skeleton";
import type { Group } from "~/types/types";

export default function groupsList({ groups }: { groups: Group[] }) {
    <div>
        <ul className="space-y-2">
            {groups.map((group) => (
                <li
                    key={group.id}
                    className="flex items-center gap-3 rounded-md border p-2 hover:bg-muted"
                >
                    <GroupAvatarStack {...group} />
                    <span className="truncate font-medium">{group.name}</span>
                </li>
            ))}
        </ul>
    </div>
}


