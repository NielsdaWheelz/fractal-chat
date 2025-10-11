interface LogoProps {
    theme: "light" | "dark"
}

export default function Logo({ theme }: LogoProps) {
    return (
        <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
                <img
                    src={
                        theme === "dark"
                            ? "/logo-white-transparent-bg.png"
                            : "/logo-navy-transparent-bg.png"
                    }
                    alt="App logo"
                    className="h-full w-full object-contain"
                />
            </div>
        </div>
    )
}