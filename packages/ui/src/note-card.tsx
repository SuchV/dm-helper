import * as React from "react";
import { Plus } from "lucide-react";

import { cn } from ".";

const NoteGrid = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid auto-rows-[minmax(180px,_auto)] grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4",
        className,
      )}
      {...props}
    />
  ),
);
NoteGrid.displayName = "NoteGrid";

interface NoteCardProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
}

const NoteCard = React.forwardRef<HTMLDivElement, NoteCardProps>(
  ({ className, active, children, onClick, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);

      if (!onClick) {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick(event as unknown as React.MouseEvent<HTMLDivElement>);
      }
    };

    return (
      <div
        ref={ref}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        className={cn(
          "flex h-full min-h-[190px] flex-col rounded-2xl border bg-muted/40 p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
          active
            ? "border-primary bg-background shadow-sm"
            : "hover:border-muted-foreground/60 hover:bg-muted",
          className,
        )}
        aria-pressed={onClick ? active : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    );
  },
);
NoteCard.displayName = "NoteCard";

const NoteCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-between gap-2", className)} {...props} />
  ),
);
NoteCardHeader.displayName = "NoteCardHeader";

const NoteCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm font-medium text-foreground", className)} {...props} />
  ),
);
NoteCardTitle.displayName = "NoteCardTitle";

const NoteCardStatus = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "rounded-full border border-border/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
);
NoteCardStatus.displayName = "NoteCardStatus";

const NoteCardPreview = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("mt-2 line-clamp-5 whitespace-pre-line text-xs text-muted-foreground", className)}
      {...props}
    />
  ),
);
NoteCardPreview.displayName = "NoteCardPreview";

const NoteCardMeta = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("mt-3 text-[11px] uppercase tracking-wide text-muted-foreground/80", className)}
      {...props}
    />
  ),
);
NoteCardMeta.displayName = "NoteCardMeta";

const NoteCreateCard = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-dashed border-muted-foreground/60 bg-muted/30 text-sm text-muted-foreground transition hover:border-muted-foreground",
        className,
      )}
      {...props}
    >
      <Plus className="mb-1 h-5 w-5" aria-hidden />
      {children ?? "New note"}
    </button>
  ),
);
NoteCreateCard.displayName = "NoteCreateCard";

export {
  NoteGrid,
  NoteCard,
  NoteCardHeader,
  NoteCardTitle,
  NoteCardStatus,
  NoteCardPreview,
  NoteCardMeta,
  NoteCreateCard,
};
