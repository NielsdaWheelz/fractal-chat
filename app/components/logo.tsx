import type { ThemeName } from "~/types/theme";

interface LogoProps {
    theme: ThemeName;
}

export default function Logo({ theme }: LogoProps) {
    const logoSrc =
        theme === "light"
            ? "/logo-navy-transparent-bg.png"
            : "/logo-white-transparent-bg.png";

    return (
        <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
                <img
                    src={logoSrc}
                    alt="App logo"
                    className="h-full w-full object-contain"
                />
            </div>
        </div>
    )
}
