import Image from "next/image";
import Link from "next/link";

import { cn } from "..";

interface LogoProps {
  className?: string;
  variant?: "default" | "icon";
  href?: string;
}

function Logo({ className, variant = "default", href = "/" }: LogoProps) {
  const content =
    variant === "default" ? (
      <div className="flex items-center gap-2">
        <LogoIcon />
        <span className="font-semibold">DM Dashboard</span>
      </div>
    ) : (
      <LogoIcon />
    );

  return (
    <Link
      href={href}
      className={cn("transition-opacity hover:opacity-90", className)}
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
      width={32}
      height={32}
      className={cn("rounded-full", className)}
      loading="lazy"
    />
  );
}

export { Logo };
