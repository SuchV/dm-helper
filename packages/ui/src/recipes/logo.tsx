import Image from "next/image";
import Link from "next/link";

import { cn } from "..";

interface LogoProps {
  className?: string;
  variant?: "default" | "icon";
  href?: string;
}

function Logo({ className, variant = "default", href = "/" }: LogoProps) {
  const isIconOnly = variant === "icon";

  const content = (
    <div className={cn("flex items-center gap-2", isIconOnly ? "gap-2" : "gap-3")}
         aria-label="DM Dashboard logo">
      <LogoIcon className={isIconOnly ? "h-9 w-9" : "h-10 w-10"} />
      {isIconOnly ? null : (
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="text-base font-semibold tracking-tight text-foreground sm:hidden">
            DM Dash
          </span>
          <span className="hidden text-base font-semibold tracking-tight text-foreground sm:inline sm:text-lg">
            DM Dashboard
          </span>
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.35em] text-muted-foreground md:inline">
            Command Center
          </span>
        </div>
      )}
    </div>
  );

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center transition-opacity hover:opacity-90",
        className,
      )}
      aria-label="Go to DM Dashboard home"
    >
      {content}
    </Link>
  );
}

function LogoIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="DM Dashboard Logo"
      width={40}
      height={40}
      className={cn(
        "rounded-2xl border border-border/60 bg-card/80 p-1 shadow-sm",
        className,
      )}
      loading="lazy"
      priority={false}
    />
  );
}

export { Logo };
