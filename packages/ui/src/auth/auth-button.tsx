import * as React from "react";

import { Button, type ButtonProps } from "../button";
import { cn } from "..";

type AuthIntent = "login" | "logout";

interface AuthButtonProps extends ButtonProps {
  intent?: AuthIntent;
}

const intentVariantMap: Record<AuthIntent, ButtonProps["variant"]> = {
  login: "primary",
  logout: "destructive",
};

const AuthButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ className, intent = "login", variant, size = "lg", ...props }, ref) => (
    <Button
      ref={ref}
      size={size}
      variant={variant ?? intentVariantMap[intent]}
      className={cn("font-semibold", className)}
      {...props}
    />
  ),
);
AuthButton.displayName = "AuthButton";

export { AuthButton };
