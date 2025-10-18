import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet"
import { Skeleton } from "~/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { useIsMobile } from "~/hooks/use-mobile"
import { cn } from "~/lib/utils"

type SidebarConfig = {
  cookieName: string
  width: string
  widthMobile: string
  widthIcon: string
  keyboardShortcut: string
}

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

export function createSidebarComponents(config: SidebarConfig) {
  const SidebarContext = React.createContext<SidebarContextProps | null>(null)

  function useSidebar() {
    const context = React.useContext(SidebarContext)
    if (!context) {
      throw new Error("useSidebar must be used within a SidebarProvider.")
    }

    return context
  }

  function SidebarProvider({
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    ...props
  }: React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }) {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }

        document.cookie = `${config.cookieName}=${openState}; path=/; max-age=${60 * 60 * 24 * 7}`
      },
      [setOpenProp, open]
    )

    const toggleSidebar = React.useCallback(() => {
      return isMobile ? setOpenMobile((value) => !value) : setOpen((value) => !value)
    }, [isMobile, setOpen, setOpenMobile])

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === config.keyboardShortcut &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContextProps>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": config.width,
              "--sidebar-width-icon": config.widthIcon,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    )
  }

  function Sidebar({
    side = "left",
    variant = "sidebar",
    collapsible = "offcanvas",
    className,
    children,
    ...props
  }: React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }) {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (collapsible === "none") {
      return (
        <div
          data-slot="sidebar"
          className={cn(
            "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col justify-between",
            className
          )}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-slot="sidebar"
            data-mobile="true"
            className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
            style={
              {
                "--sidebar-width": config.widthMobile,
              } as React.CSSProperties
            }
            side={side}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Sidebar</SheetTitle>
              <SheetDescription>Displays the mobile sidebar.</SheetDescription>
            </SheetHeader>
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div
        className="group peer hidden text-sidebar-foreground md:block"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
        data-slot="sidebar"
      >
        <div
          data-slot="sidebar-gap"
          className={cn(
            "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[side=right]:rotate-180",
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
              : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
          )}
        />
        <div
          data-slot="sidebar-container"
          className={cn(
            "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
              : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
            className
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            data-slot="sidebar-inner"
            className={cn(
              "relative flex h-full w-full flex-col overflow-hidden border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm transition-colors",
              "group-data-[variant=floating]:rounded-xl group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-lg"
            )}
          >
            {children}
          </div>
        </div>
      </div>
    )
  }

  function createTrigger(
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>,
    label = "Toggle Sidebar"
  ) {
    const SidebarTrigger = ({
      className,
      onClick,
      ...props
    }: React.ComponentProps<typeof Button>) => {
      const { toggleSidebar } = useSidebar()

      return (
        <Button
          data-sidebar="trigger"
          data-slot="sidebar-trigger"
          variant="ghost"
          size="icon"
          className={cn(
            "size-9 rounded-lg border border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 ease-out hover:-translate-y-px hover:bg-sidebar-accent/15 hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
            className
          )}
          onClick={(event) => {
            onClick?.(event)
            toggleSidebar()
          }}
          {...props}
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      )
    }

    SidebarTrigger.displayName = "SidebarTrigger"

    return SidebarTrigger
  }

  function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
    const { toggleSidebar } = useSidebar()

    return (
      <button
        data-sidebar="rail"
        data-slot="sidebar-rail"
        aria-label="Toggle Sidebar"
        tabIndex={-1}
        onClick={toggleSidebar}
        title="Toggle Sidebar"
        className={cn(
          "absolute inset-y-0 z-20 hidden w-5 -translate-x-1/2 transition-all duration-300 ease-linear group-data-[side=left]:-right-5 group-data-[side=right]:left-0 sm:flex",
          "rounded-full border border-transparent bg-transparent hover:bg-sidebar-accent/15",
          "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
          "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
          "group-data-[collapsible=offcanvas]:translate-x-0",
          "[[data-side=left][data-collapsible=offcanvas]_&]:-right-3",
          "[[data-side=right][data-collapsible=offcanvas]_&]:-left-3",
          className
        )}
        {...props}
      />
    )
  }

  function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
    return (
      <main
        data-slot="sidebar-inset"
        className={cn(
          "bg-background relative flex w-full flex-1 flex-col",
          "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
          className
        )}
        {...props}
      />
    )
  }

  function SidebarInput({
    className,
    ...props
  }: React.ComponentProps<typeof Input>) {
    return (
      <Input
        data-slot="sidebar-input"
        data-sidebar="input"
        className={cn(
          "h-9 w-full border border-sidebar-border bg-sidebar font-theme-accent text-xs tracking-[0.08em] text-sidebar-foreground shadow-sm transition-colors placeholder:text-sidebar-foreground/60 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
          className
        )}
        {...props}
      />
    )
  }

  function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
      <div
        data-slot="sidebar-header"
        data-sidebar="header"
        className={cn(
          "relative isolate flex flex-col gap-3 border-b border-sidebar-border bg-sidebar/95 p-4 shadow-sm transition-colors",
          className
        )}
        {...props}
      />
    )
  }

  function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
      <div
        data-slot="sidebar-footer"
        data-sidebar="footer"
        className={cn(
          "relative isolate flex flex-col gap-3 border-t border-sidebar-border bg-sidebar/95 p-4 shadow-sm transition-colors",
          className
        )}
        {...props}
      />
    )
  }

  function SidebarSeparator({
    className,
    ...props
  }: React.ComponentProps<typeof Separator>) {
    return (
      <Separator
        data-slot="sidebar-separator"
        data-sidebar="separator"
        className={cn(
          "mx-0 my-4 h-px w-full bg-sidebar-border/60",
          className
        )}
        {...props}
      />
    )
  }

  function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
    return (
      <div
        data-slot="sidebar-content"
        data-sidebar="content"
        className={cn(
          "relative flex min-h-39 flex-col gap-3 overflow-auto px-4 py-4 group-data-[collapsible=icon]:overflow-hidden",
          className
        )}
        {...props}
      />
    )
  }

  function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
    return (
      <div
        data-slot="sidebar-group"
        data-sidebar="group"
        className={cn(
          "relative isolate flex w-full min-w-0 flex-col gap-3 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar/95 p-4 shadow-sm transition-colors",
          className
        )}
        {...props}
      />
    )
  }

  function SidebarGroupLabel({
    className,
    asChild = false,
    ...props
  }: React.ComponentProps<"div"> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : "div"

    return (
      <Comp
        data-slot="sidebar-group-label"
        data-sidebar="group-label"
        className={cn(
          "flex h-8 shrink-0 items-center gap-2 rounded-md border border-sidebar-border bg-sidebar/80 px-3 font-theme-accent text-[0.65rem] uppercase tracking-[0.28em] text-sidebar-foreground/70 outline-none ring-offset-2 ring-offset-background transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 focus-visible:ring-ring/40",
          "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
          className
        )}
        {...props}
      />
    )
  }

  function SidebarGroupAction({
    className,
    asChild = false,
    ...props
  }: React.ComponentProps<"button"> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        data-slot="sidebar-group-action"
        data-sidebar="group-action"
        className={cn(
          "absolute top-3 right-3 flex aspect-square w-7 items-center justify-center rounded-md border border-transparent bg-sidebar p-0 text-sidebar-foreground/70 transition-all duration-200 ease-out hover:border-sidebar-accent/60 hover:bg-sidebar-accent/20 hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background [&>svg]:size-4 [&>svg]:shrink-0",
          "after:absolute after:-inset-2 md:after:hidden",
          "group-data-[collapsible=icon]:hidden",
          className
        )}
        {...props}
      />
    )
  }

  function SidebarGroupContent({
    className,
    ...props
  }: React.ComponentProps<"div">) {
    return (
      <div
        data-slot="sidebar-group-content"
        data-sidebar="group-content"
        className={cn(
          "relative z-10 w-full text-sm text-sidebar-foreground/80",
          className
        )}
        {...props}
      />
    )
  }

  function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
    return (
      <ul
        data-slot="sidebar-menu"
        data-sidebar="menu"
        className={cn(
          "relative z-10 flex w-full min-w-0 flex-col gap-2",
          className
        )}
        {...props}
      />
    )
  }

  function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
    return (
      <li
        data-slot="sidebar-menu-item"
        data-sidebar="menu-item"
        className={cn("group/menu-item relative isolate", className)}
        {...props}
      />
    )
  }

  const sidebarMenuButtonVariants = cva(
    "peer/menu-button relative flex w-full items-center gap-3 overflow-hidden rounded-lg border border-sidebar-border bg-sidebar/90 p-2 text-left text-sm font-theme-accent tracking-[0.04em] text-sidebar-foreground/85 outline-none transition-all duration-200 ease-out ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring/40 hover:-translate-y-[1px] hover:border-sidebar-accent/60 hover:bg-sidebar-accent/15 hover:text-sidebar-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-9 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary/20 data-[active=true]:text-sidebar-primary-foreground data-[state=open]:border-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
    {
      variants: {
        variant: {
          default: "",
          outline:
            "border-sidebar-border bg-transparent hover:bg-sidebar-accent/10",
        },
        size: {
          default: "h-10 text-sm",
          sm: "h-9 px-2.5 py-2 text-xs",
          lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
        },
      },
      defaultVariants: {
        variant: "default",
        size: "default",
      },
    }
  )

  function SidebarMenuButton({
    asChild = false,
    isActive = false,
    variant = "default",
    size = "default",
    tooltip,
    className,
    ...props
  }: React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>) {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state } = useSidebar()

    const button = (
      <Comp
        data-slot="sidebar-menu-button"
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    )

    if (!tooltip) {
      return button
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      }
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== "collapsed" || isMobile}
          {...tooltip}
        />
      </Tooltip>
    )
  }

  function SidebarMenuAction({
    className,
    asChild = false,
    showOnHover = false,
    ...props
  }: React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }) {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        data-slot="sidebar-menu-action"
        data-sidebar="menu-action"
        className={cn(
          "absolute top-1.5 right-1 flex aspect-square w-6 items-center justify-center rounded-md border border-transparent bg-sidebar p-0 font-theme-accent text-xs uppercase text-sidebar-foreground/70 transition-all duration-200 ease-out hover:border-sidebar-accent/60 hover:bg-sidebar-accent/20 hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background [&>svg]:size-4 [&>svg]:shrink-0",
          "after:absolute after:-inset-2 md:after:hidden",
          "peer-data-[size=sm]/menu-button:top-1",
          "peer-data-[size=default]/menu-button:top-1.5",
          "peer-data-[size=lg]/menu-button:top-2.5",
          "group-data-[collapsible=icon]:hidden",
          showOnHover &&
            "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
          className
        )}
        {...props}
      />
    )
  }

  function SidebarMenuBadge({
    className,
    ...props
  }: React.ComponentProps<"div">) {
    return (
      <div
        data-slot="sidebar-menu-badge"
        data-sidebar="menu-badge"
        className={cn(
          "pointer-events-none absolute right-2 flex h-5 min-w-6 items-center justify-center rounded-full border border-sidebar-accent/50 bg-sidebar-accent/10 px-2 font-theme-accent text-[0.6rem] uppercase tracking-[0.2em] text-sidebar-accent-foreground shadow-sm",
          "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
          "peer-data-[size=sm]/menu-button:top-1",
          "peer-data-[size=default]/menu-button:top-1.5",
          "peer-data-[size=lg]/menu-button:top-2.5",
          "group-data-[collapsible=icon]:hidden",
          className
        )}
        {...props}
      />
    )
  }

  function SidebarMenuSkeleton({
    className,
    showIcon = false,
    ...props
  }: React.ComponentProps<"div"> & {
    showIcon?: boolean
  }) {
    const width = React.useMemo(() => {
      return `${Math.floor(Math.random() * 40) + 50}%`
    }, [])

    return (
      <div
        data-slot="sidebar-menu-skeleton"
        data-sidebar="menu-skeleton"
        className={cn(
          "flex h-9 items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar/80 px-3",
          className
        )}
        {...props}
      >
        {showIcon && (
          <Skeleton
            className="size-5 rounded-md bg-sidebar-border/40"
            data-sidebar="menu-skeleton-icon"
          />
        )}
        <Skeleton
          className="h-3.5 max-w-(--skeleton-width) flex-1 rounded bg-sidebar-border/30"
          data-sidebar="menu-skeleton-text"
          style={
            {
              "--skeleton-width": width,
            } as React.CSSProperties
          }
        />
      </div>
    )
  }

  function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
    return (
      <ul
        data-slot="sidebar-menu-sub"
        data-sidebar="menu-sub"
        className={cn(
          "relative z-10 mx-3.5 flex min-w-0 translate-x-px flex-col gap-2 border-l border-dashed border-sidebar-border/70 px-3 py-1",
          "group-data-[collapsible=icon]:hidden",
          className
        )}
        {...props}
      />
    )
  }

  function SidebarMenuSubItem({
    className,
    ...props
  }: React.ComponentProps<"li">) {
    return (
      <li
        data-slot="sidebar-menu-sub-item"
        data-sidebar="menu-sub-item"
        className={cn("group/menu-sub-item relative isolate", className)}
        {...props}
      />
    )
  }

  function SidebarMenuSubButton({
    asChild = false,
    size = "md",
    isActive = false,
    className,
    ...props
  }: React.ComponentProps<"a"> & {
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
  }) {
    const Comp = asChild ? Slot : "a"

    return (
      <Comp
        data-slot="sidebar-menu-sub-button"
        data-sidebar="menu-sub-button"
        data-size={size}
        data-active={isActive}
        className={cn(
          "relative flex h-8 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md border border-transparent bg-transparent px-2.5 text-[0.7rem] font-theme-accent tracking-[0.08em] text-sidebar-foreground/70 transition-all duration-200 ease-out hover:border-sidebar-accent/60 hover:bg-sidebar-accent/15 hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-foreground/60",
          "data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary/20 data-[active=true]:text-sidebar-primary-foreground",
          size === "sm" && "h-7 px-2 text-[0.6rem]",
          size === "md" && "h-8 text-[0.7rem]",
          "group-data-[collapsible=icon]:hidden",
          className
        )}
        {...props}
      />
    )
  }

  return {
    SidebarProvider,
    Sidebar,
    SidebarInset,
    SidebarInput,
    SidebarHeader,
    SidebarFooter,
    SidebarSeparator,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarRail,
    useSidebar,
    createTrigger,
  }
}
