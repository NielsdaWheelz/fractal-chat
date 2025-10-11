"use client";

import { ChevronsUpDown, LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router";

import * as Tabs from "@radix-ui/react-tabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar-left";
import createFallback from "~/helperfunctions/createFallback";
import { clientSignOut } from "~/utils/auth.client";
import { TabsList, TabsTrigger } from "./ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function NavUser({
  user,
  setTheme,
  theme,
}: {
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  theme: string;
  user: {
    name: string;
    email: string;
    avatar: string;
    fallback: string;
  };
}) {
  user = createFallback(user)
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

  const handleClick = async () => {
    await clientSignOut();
    navigate("/");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{user.fallback}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex flex-row gap-3 items-end">

                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-s text-foreground">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">{user.fallback}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>

                <Tabs.Root defaultValue={theme}>
                  <TabsList>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <TabsTrigger
                            value="light"
                            className="py-3"
                            onClick={() => { setTheme("light") }}
                          >
                            <Sun size={16} aria-hidden="true" />
                          </TabsTrigger>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="px-2 py-1 text-xs">
                        Dark Mode
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <TabsTrigger
                            value="dark"
                            className="group py-3"
                            onClick={() => { setTheme("dark") }}
                          >
                            <span className="relative">
                              <Moon size={16} aria-hidden="true" />
                            </span>
                          </TabsTrigger>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="px-2 py-1 text-xs">
                        Light Mode
                      </TooltipContent>
                    </Tooltip>
                  </TabsList>
                </Tabs.Root>
              </div>


            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleClick}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
