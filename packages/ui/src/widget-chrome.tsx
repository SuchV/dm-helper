import * as React from "react";

import { cn } from ".";

interface WidgetSurfaceProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  collapsed?: boolean;
}

const WidgetSurface = React.forwardRef<HTMLElement, WidgetSurfaceProps>(
  ({ as: Component = "section", className, collapsed, ...props }, ref) => {
    const Comp = Component;
    return (
      <Comp
        ref={ref as never}
        className={cn(
          "self-start rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm",
          collapsed ? "border-t-0" : "",
          className,
        )}
        {...props}
      />
    );
  },
);
WidgetSurface.displayName = "WidgetSurface";

const WidgetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { collapsed?: boolean }
>(({ className, collapsed, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-wrap items-start justify-between gap-3 px-4 py-3 text-left",
      collapsed ? "border-b-0" : "border-b border-border/60",
      className,
    )}
    {...props}
  />
));
WidgetHeader.displayName = "WidgetHeader";

const WidgetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-base font-semibold leading-tight tracking-tight", className)}
    {...props}
  />
));
WidgetTitle.displayName = "WidgetTitle";

const WidgetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
WidgetDescription.displayName = "WidgetDescription";

const WidgetToolbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-1", className)} {...props} />
));
WidgetToolbar.displayName = "WidgetToolbar";

const WidgetBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { collapsed?: boolean }
>(({ className, collapsed, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "transition-all duration-200",
      collapsed ? "max-h-0 overflow-hidden p-0" : "max-h-[2000px] p-4",
      className,
    )}
    {...props}
  />
));
WidgetBody.displayName = "WidgetBody";

export {
  WidgetSurface,
  WidgetHeader,
  WidgetTitle,
  WidgetDescription,
  WidgetToolbar,
  WidgetBody,
};
