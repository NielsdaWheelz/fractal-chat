import { cn } from "~/lib/utils";
import type { ThemeName } from "~/types/theme";

const iconButtonBase =
  "rounded-lg border transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background";

const iconButtonByTheme: Record<ThemeName, string> = {
  light:
    "bg-card text-muted-foreground hover:text-foreground hover:bg-accent/10 hover:border-accent/40 shadow-sm",
  dark:
    "bg-card/80 text-foreground hover:text-accent hover:bg-accent/10 hover:border-accent/40 shadow-md",
  neon:
    "border-sidebar-border bg-sidebar font-theme-accent text-sidebar-foreground/80 hover:-translate-y-px hover:border-sidebar-accent/60 hover:bg-sidebar-accent/20 hover:text-sidebar-foreground hover:shadow-lg focus-visible:ring-ring/35",
};

export function iconButtonClasses(theme: ThemeName) {
  return cn(iconButtonBase, iconButtonByTheme[theme]);
}

const inputShellBase =
  "rounded-lg border px-3 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2";

const inputShellByTheme: Record<ThemeName, string> = {
  light:
    "bg-background border-input font-sans tracking-normal text-foreground placeholder:text-muted-foreground shadow-sm focus-visible:ring-ring/20",
  dark:
    "bg-input/70 border-input font-sans tracking-normal text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/25",
  neon:
    "border-sidebar-border bg-sidebar font-theme-accent tracking-[0.08em] text-sidebar-foreground placeholder:text-sidebar-foreground/60 focus-visible:ring-ring/30 focus-visible:border-sidebar-accent/60",
};

export function inputShellClasses(theme: ThemeName) {
  return cn(inputShellBase, inputShellByTheme[theme]);
}

const secondaryPanelBase = "rounded-xl border p-3 transition-colors";

const secondaryPanelByTheme: Record<ThemeName, string> = {
  light: "bg-card shadow-sm border-border",
  dark: "bg-card/80 shadow-md border-border/70",
  neon:
    "border-sidebar-border bg-sidebar/90 shadow-lg",
};

export function secondaryPanelClasses(theme: ThemeName) {
  return cn(secondaryPanelBase, secondaryPanelByTheme[theme]);
}

const sectionTitleBase =
  "text-[0.7rem] uppercase tracking-[0.24em] transition-colors";

const sectionTitleByTheme: Record<ThemeName, string> = {
  light: "font-semibold text-muted-foreground",
  dark: "font-semibold text-muted-foreground/80",
  neon: "font-theme-accent text-sidebar-foreground/70",
};

export function sectionTitleClasses(theme: ThemeName) {
  return cn(sectionTitleBase, sectionTitleByTheme[theme]);
}

const tabTriggerBase =
  "flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background";

const tabTriggerByTheme: Record<ThemeName, string> = {
  light:
    "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent/10 hover:border-accent/40 data-[state=active]:border-accent data-[state=active]:bg-accent/20 data-[state=active]:text-accent-foreground shadow-sm",
  dark:
    "border-border/70 bg-card/80 text-foreground hover:text-accent hover:bg-accent/10 hover:border-accent/40 data-[state=active]:border-accent data-[state=active]:bg-accent/20 data-[state=active]:text-accent-foreground shadow-md",
  neon:
    "border-sidebar-border bg-sidebar/90 font-theme-accent text-sidebar-foreground/80 hover:border-sidebar-accent/60 hover:text-sidebar-foreground data-[state=active]:border-sidebar-primary data-[state=active]:bg-sidebar-primary/20 data-[state=active]:text-sidebar-primary-foreground",
};

export function tabTriggerClasses(theme: ThemeName) {
  return cn(tabTriggerBase, tabTriggerByTheme[theme]);
}
