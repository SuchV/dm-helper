import Link from "next/link";

const Footer = () => {
  return (
    <div className="flex">
      <p className="text-xs text-muted-foreground">
        &copy; 2025 SuchV Stack. All rights reserved.
      </p>
      <nav className="flex gap-4 sm:ml-auto sm:gap-6">
        <Link
          href="https://github.com/SuchV"
          className="text-xs underline-offset-4 hover:underline"
          prefetch={false}
        >
          Made by Mikołaj Zając
        </Link>
      </nav>
    </div>
  );
};

export { Footer };
