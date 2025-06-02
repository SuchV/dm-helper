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
        <span className="font-semibold">Boring stack</span>
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
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-6 w-6", className)}
    >
      <path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        className="fill-primary stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 17L12 22L22 17"
        className="stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12L12 17L22 12"
        className="stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export { Logo };
