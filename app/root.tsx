import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { ThemeProvider } from "~/hooks/use-theme";

const themeInitScript = `
(function() {
  try {
    const storageKey = "fractal-theme";
    const valid = new Set(["light", "dark", "neon"]);
    const root = document.documentElement;
    const stored = window.localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = valid.has(stored) ? stored : (prefersDark ? "dark" : "light");
    const isDarkContext = theme === "dark" || theme === "neon";
    root.dataset.theme = theme;
    root.classList.toggle("dark", isDarkContext);
    root.classList.toggle("neon", theme === "neon");
    root.style.colorScheme = isDarkContext ? "dark" : "light";
    if (!valid.has(stored)) {
      window.localStorage.setItem(storageKey, theme);
    }
  } catch (_) {
    /* no-op */
  }
})();`;

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <Meta />
        <Links />

      </head>
      <body>
        <ThemeProvider>
          <TooltipProvider delayDuration={500}>
            {children}
            <ScrollRestoration />
            <Scripts />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
