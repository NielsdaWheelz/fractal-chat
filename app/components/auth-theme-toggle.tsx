import { Moon, Sparkles, Sun } from "lucide-react";
import { useTheme } from "~/hooks/use-theme";
import type { ThemeName } from "~/types/theme";

const themeOptions: Array<{
  value: ThemeName;
  label: string;
  icon: typeof Sun;
}> = [
  { value: "light", label: "Switch to light mode", icon: Sun },
  { value: "dark", label: "Switch to dark mode", icon: Moon },
  { value: "neon", label: "Switch to neon mode", icon: Sparkles },
];

export default function AuthThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="auth-theme-toggle" role="group" aria-label="Theme">
      {themeOptions.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            type="button"
            className="auth-theme-toggle__button"
            data-state={isActive ? "active" : "inactive"}
            aria-pressed={isActive}
            aria-label={label}
            onClick={() => setTheme(value)}
          >
            <Icon className="size-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
