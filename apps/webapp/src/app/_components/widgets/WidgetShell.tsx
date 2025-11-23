"use client";

import * as React from "react";
import { ChevronDown, Minus, Trash2 } from "lucide-react";

import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
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
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  description?: string;
  onCollapsedChange?: (collapsed: boolean) => void;
  onRemove?: () => Promise<void> | void;
}

const WidgetShell: React.FC<WidgetShellProps> = ({
  title,
  icon,
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
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);

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

  const handleRemoveConfirm = async () => {
    if (isRemoving) return;
    setIsRemoving(true);

    try {
      await onRemove?.();
      setIsConfirmOpen(false);
      setVisible(false);
    } catch (error) {
      console.error("Failed to remove widget", error);
    } finally {
      setIsRemoving(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      <WidgetSurface collapsed={collapsed}>
        <WidgetHeader collapsed={collapsed} aria-expanded={!collapsed}>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              {icon ? <span className="text-muted-foreground">{icon}</span> : null}
              <WidgetTitle>{title}</WidgetTitle>
            </div>
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
              onClick={() => setIsConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </WidgetToolbar>
        </WidgetHeader>
        <WidgetBody collapsed={collapsed}>{children}</WidgetBody>
      </WidgetSurface>

      <Dialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          if (isRemoving) return;
          setIsConfirmOpen(open);
        }}
      >
        <DialogContent aria-describedby="remove-widget-description">
          <DialogHeader>
            <DialogTitle>Remove {title}?</DialogTitle>
            <DialogDescription id="remove-widget-description">
              This widget and its data will disappear from your dashboard. You can add it again later, but any
              unsaved state will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={isRemoving} onClick={() => setIsConfirmOpen(false)}>
              Keep widget
            </Button>
            <Button type="button" variant="destructive" disabled={isRemoving} onClick={handleRemoveConfirm}>
              {isRemoving ? "Removing..." : "Remove widget"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WidgetShell;
