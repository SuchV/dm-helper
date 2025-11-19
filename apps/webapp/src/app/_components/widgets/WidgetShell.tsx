"use client";

import * as React from "react";
import { ChevronDown, Minus, Trash2 } from "lucide-react";

import { Button } from "@repo/ui/button";

interface WidgetShellProps {
  title: string;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  description?: string;
  onCollapsedChange?: (collapsed: boolean) => void;
  onRemove?: () => Promise<void> | void;
}

const WidgetShell: React.FC<WidgetShellProps> = ({
  title,
  children,
  defaultCollapsed = false,
  description,
  onCollapsedChange,
  onRemove,
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    setCollapsed(defaultCollapsed);
  }, [defaultCollapsed]);

  const handleToggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      onCollapsedChange?.(next);
      return next;
    });
  };

  const handleRemove = async () => {
    const confirmed = window.confirm(
      `Remove the "${title}" widget from your dashboard?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await onRemove?.();
      setVisible(false);
    } catch (error) {
      console.error("Failed to remove widget", error);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <section className="rounded-lg border bg-card shadow-sm">
      <header className="flex items-center justify-between gap-4 border-b px-4 py-2">
        <div className="flex flex-col">
          <h2 className="text-base font-semibold leading-tight">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={collapsed ? "Expand widget" : "Minimize widget"}
            onClick={handleToggle}
          >
            {collapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Remove widget"
            onClick={handleRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>
      {!collapsed ? <div className="p-4">{children}</div> : null}
    </section>
  );
};

export default WidgetShell;
