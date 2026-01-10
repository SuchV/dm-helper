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
          "w-full min-w-0 self-start rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm",
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
      "flex cursor-grab items-start gap-3 px-4 py-3 text-left active:cursor-grabbing",
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
>(({ className, onPointerDown, ...props }, ref) => {
  // Prevent pointer events from starting drag when clicking toolbar buttons
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onPointerDown?.(e);
  };

  return (
    <div 
      ref={ref} 
      className={cn("flex items-center gap-1", className)} 
      onPointerDown={handlePointerDown}
      {...props} 
    />
  );
});
WidgetToolbar.displayName = "WidgetToolbar";

const WidgetBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { collapsed?: boolean }
>(({ className, collapsed, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid transition-[grid-template-rows] duration-200 ease-in-out",
      collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
    )}
    {...props}
  >
    <div className="overflow-hidden">
      <div className={cn(collapsed ? "p-0" : "p-3 sm:p-4", className)}>{children}</div>
    </div>
  </div>
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
