"use client";

import * as React from "react";
import { ChevronDown, Minus, Trash2 } from "lucide-react";

import { Button } from "@repo/ui/button";
import {
  WidgetBody,
  WidgetDescription,
  WidgetHeader,
  WidgetSurface,
  WidgetTitle,
  WidgetToolbar,
} from "@repo/ui/widget-chrome";

interface WidgetShellProps {
  title: string;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  description?: string;
  onCollapsedChange?: (collapsed: boolean) => void;
  onRemove?: () => Promise<void> | void;
}

const WidgetShell: React.FC<WidgetShellProps> = ({
  title,
  children,
  defaultCollapsed = false,
  collapsed: collapsedProp,
  description,
  onCollapsedChange,
  onRemove,
}) => {
  const isControlled = collapsedProp !== undefined;
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
  const collapsed = isControlled ? (collapsedProp as boolean) : internalCollapsed;
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (!isControlled) {
      setInternalCollapsed(defaultCollapsed);
    }
  }, [defaultCollapsed, isControlled]);

  const handleToggle = () => {
    const next = !collapsed;
    if (!isControlled) {
      setInternalCollapsed(next);
    }
    onCollapsedChange?.(next);
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
    <WidgetSurface collapsed={collapsed}>
      <WidgetHeader collapsed={collapsed} aria-expanded={!collapsed}>
        <div className="flex flex-col gap-0.5">
          <WidgetTitle>{title}</WidgetTitle>
          {description ? <WidgetDescription>{description}</WidgetDescription> : null}
        </div>
        <WidgetToolbar>
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
        </WidgetToolbar>
      </WidgetHeader>
      <WidgetBody collapsed={collapsed}>{children}</WidgetBody>
    </WidgetSurface>
  );
};

export default WidgetShell;
