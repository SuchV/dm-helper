import * as React from "react";

import { Button, type ButtonProps } from "./button";
import { cn } from ".";

const NavActionButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "icon", variant = "outline", ...props }, ref) => (
    <Button
      ref={ref}
      size={size}
      variant={variant}
      className={cn("rounded-full shadow-sm", className)}
      {...props}
    />
  ),
);
NavActionButton.displayName = "NavActionButton";

export { NavActionButton };
