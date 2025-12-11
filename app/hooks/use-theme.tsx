"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ThemeName } from "~/types/theme";

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (next: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "fractal-theme";
const VALID_THEMES: ThemeName[] = ["light", "dark", "neon"];

function isThemeName(value: unknown): value is ThemeName {
  return typeof value === "string" && (VALID_THEMES as string[]).includes(value);
}

function resolveInitialTheme(): ThemeName {
  if (typeof document !== "undefined") {
    const datasetTheme = document.documentElement.dataset.theme;
    if (isThemeName(datasetTheme)) {
      return datasetTheme;
    }
  }

  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeName(stored)) {
      return stored;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  return "light";
}

function applyThemeToDocument(theme: ThemeName) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const isDarkContext = theme === "dark" || theme === "neon";

  root.dataset.theme = theme;
  root.classList.toggle("dark", isDarkContext);
  root.classList.toggle("neon", theme === "neon");
  root.style.colorScheme = isDarkContext ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => resolveInitialTheme());

  useEffect(() => {
    if (typeof document === "undefined") return;
    const datasetTheme = document.documentElement.dataset.theme;
    if (isThemeName(datasetTheme)) {
      setThemeState((current) => (current === datasetTheme ? current : datasetTheme));
    }
  }, []);

  useEffect(() => {
    applyThemeToDocument(theme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (!isThemeName(stored)) {
        setThemeState(event.matches ? "dark" : "light");
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState((current) => (current === next ? current : next));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
