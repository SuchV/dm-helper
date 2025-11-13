import { cn } from "@repo/ui";
import Image from "next/image";

interface BlurredTileProps {
  children: React.ReactNode;
  backgroundImage?: string; // Optional background image URL
  backgroundColor?: string; // Optional background color
  className?: string; // Optional additional class names
}

const BlurredTile = ({
  children,
  backgroundImage,
  backgroundColor,
  className,
}: BlurredTileProps) => {
  return (
    <div
      className={cn(
        "relative h-fit w-full overflow-hidden rounded-md",
        backgroundColor,
        className,
      )}
    >
      {backgroundImage && (
        <Image
          src={backgroundImage} // replace with your image path
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="inset-0 z-0 object-cover opacity-30 blur-md"
          priority
        />
      )}

      {/* Overlay */}
      <div className="bg-black/30 absolute inset-0 z-10" />

      {/* Tile */}
      <div className="relative z-20 flex h-full items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
};

export default BlurredTile;
