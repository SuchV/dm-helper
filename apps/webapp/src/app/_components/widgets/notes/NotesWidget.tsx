"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { Separator } from "@repo/ui/separator";
import { toast } from "@repo/ui/toast";

import { api } from "~/trpc/react";

import { useNotesWidgetState } from "../WidgetStateProvider";
import type { NotesWidgetNote, NotesWidgetState } from "../widget-types";

interface NotesWidgetProps {
  widgetId: string;
}

const toIso = (value: string | Date) => new Date(value).toISOString();

const normalizeNote = (
  note: Omit<NotesWidgetNote, "createdAt" | "updatedAt"> & {
    createdAt: string | Date;
    updatedAt: string | Date;
  },
): NotesWidgetNote => ({
  ...note,
  createdAt: toIso(note.createdAt),
  updatedAt: toIso(note.updatedAt),
});

const NotesWidget = ({ widgetId }: NotesWidgetProps) => {
  const [notesState, updateNotesState] = useNotesWidgetState(widgetId);
  const safeState: NotesWidgetState = notesState ?? { notes: [] };
  const notes = safeState.notes;
  const [activeNoteId, setActiveNoteId] = React.useState<string | null>(notes[0]?.id ?? null);

  React.useEffect(() => {
    if (notes.length === 0) {
      setActiveNoteId(null);
      return;
    }

    if (!activeNoteId || !notes.some((note) => note.id === activeNoteId)) {
      setActiveNoteId(notes[0]?.id ?? null);
    }
  }, [notes, activeNoteId]);

  const activeNote = React.useMemo(() => {
    if (!activeNoteId) return null;
    return notes.find((note) => note.id === activeNoteId) ?? null;
  }, [notes, activeNoteId]);

  const pendingPayloadRef = React.useRef<Record<string, { title?: string; content?: string }>>({});
  const pendingTimersRef = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  React.useEffect(() => {
    return () => {
      Object.values(pendingTimersRef.current).forEach((timer) => {
        if (timer) {
          clearTimeout(timer);
        }
      });
    };
  }, []);

  const updateMutation = api.note.update.useMutation({
    onError: (error) => {
      console.error(error);
      toast.error(error.message ?? "Failed to update note");
    },
    onSuccess: (note) => {
      const normalized = normalizeNote(note);
      updateNotesState((prev) => ({
        notes: prev.notes.map((entry) => (entry.id === normalized.id ? normalized : entry)),
      }));
    },
  });

  const queueUpdate = React.useCallback(
    (noteId: string, patch: { title?: string; content?: string }) => {
      pendingPayloadRef.current[noteId] = {
        ...pendingPayloadRef.current[noteId],
        ...patch,
      };

      if (pendingTimersRef.current[noteId]) {
        clearTimeout(pendingTimersRef.current[noteId]);
      }

      pendingTimersRef.current[noteId] = setTimeout(() => {
        const payload = pendingPayloadRef.current[noteId];
        delete pendingPayloadRef.current[noteId];
        delete pendingTimersRef.current[noteId];

        if (!payload) {
          return;
        }

        updateMutation.mutate({
          noteId,
          ...payload,
        });
      }, 600);
    },
    [updateMutation],
  );

  const createNoteMutation = api.note.create.useMutation({
    onError: (error) => {
      console.error(error);
      toast.error(error.message ?? "Unable to add note");
    },
    onSuccess: (note) => {
      const normalized = normalizeNote(note);
      updateNotesState((prev) => ({
        notes: [...prev.notes, normalized],
      }));
      setActiveNoteId(normalized.id);
    },
  });

  const deleteNoteMutation = api.note.remove.useMutation({
    onError: (error) => {
      console.error(error);
      toast.error(error.message ?? "Unable to delete note");
    },
    onSuccess: (_, variables) => {
      let fallbackId: string | null = null;
      updateNotesState((prev) => {
        const filtered = prev.notes.filter((note) => note.id !== variables.noteId);
        fallbackId = filtered[0]?.id ?? null;
        return {
          notes: filtered.map((note, index) => ({
            ...note,
            position: index,
          })),
        };
      });
      setActiveNoteId((current) => {
        if (current === variables.noteId) {
          return fallbackId;
        }
        return current;
      });
    },
  });

  const handleCreateNote = () => {
    if (createNoteMutation.isPending) return;
    createNoteMutation.mutate({ widgetId });
  };

  const handleTitleChange = (noteId: string, nextTitle: string) => {
    updateNotesState((prev) => ({
      notes: prev.notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              title: nextTitle,
            }
          : note,
      ),
    }));
    queueUpdate(noteId, { title: nextTitle });
  };

  const handleBodyChange = (noteId: string, nextBody: string) => {
    updateNotesState((prev) => ({
      notes: prev.notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              content: nextBody,
            }
          : note,
      ),
    }));
    queueUpdate(noteId, { content: nextBody });
  };

  const handleDelete = (noteId: string) => {
    if (deleteNoteMutation.isPending) return;
    deleteNoteMutation.mutate({ noteId });
  };

  const emptyState = notes.length === 0;

  const editorStats = React.useMemo(() => {
    if (!activeNote) {
      return { words: 0, characters: 0, updatedLabel: "" };
    }

    const trimmed = activeNote.content.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const characters = activeNote.content.length;
    const updatedLabel = new Date(activeNote.updatedAt).toLocaleString();

    return { words, characters, updatedLabel };
  }, [activeNote]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Click a card to jump into edit mode. Notes stay lightweight until you open them.</p>
      </div>

      <div className="grid auto-rows-[minmax(140px,_auto)] grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
        {notes.map((note) => {
          const isActive = note.id === activeNoteId;
          const previewTitle = note.title.trim() || "Untitled note";
          const previewBody = note.content.trim() || "No content yet";

          return (
            <button
              key={note.id}
              type="button"
              onClick={() => setActiveNoteId(note.id)}
              aria-pressed={isActive}
              className={`flex h-full min-h-[150px] flex-col rounded-xl border bg-muted/40 p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 ${
                isActive
                  ? "border-primary bg-background shadow-sm"
                  : "hover:border-muted-foreground/60 hover:bg-muted"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{previewTitle}</p>
                {isActive ? <Badge variant="outline">Editing</Badge> : null}
              </div>
              <p className="mt-2 line-clamp-5 whitespace-pre-line text-xs text-muted-foreground">{previewBody}</p>
              <p className="mt-3 text-[11px] uppercase tracking-wide text-muted-foreground/80">
                {new Date(note.updatedAt).toLocaleDateString()}
              </p>
            </button>
          );
        })}

        <button
          type="button"
          onClick={handleCreateNote}
          disabled={createNoteMutation.isPending}
          className="flex min-h-[150px] flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/60 bg-muted/30 text-sm text-muted-foreground transition hover:border-muted-foreground"
        >
          <Plus className="mb-1 h-5 w-5" />
          New note
        </button>
      </div>

      <Separator />

      {activeNote ? (
        <div className="space-y-4 rounded-2xl border bg-background/80 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Currently editing</p>
              <p className="text-lg font-medium text-foreground">
                {activeNote.title.trim() || "Untitled note"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Auto-save on</Badge>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => handleDelete(activeNote.id)}
                disabled={deleteNoteMutation.isPending}
              >
                <Trash2 className="mr-1 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Updated {editorStats.updatedLabel}</span>
            <span>•</span>
            <span>{editorStats.words} words</span>
            <span>•</span>
            <span>{editorStats.characters} characters</span>
          </div>
          <Input
            className="text-base font-medium"
            value={activeNote.title}
            onChange={(event) => handleTitleChange(activeNote.id, event.target.value)}
            placeholder="Note title"
          />
          <Textarea
            value={activeNote.content}
            onChange={(event) => handleBodyChange(activeNote.id, event.target.value)}
            placeholder="Write your note..."
            className="min-h-[220px]"
          />
          <p className="text-xs text-muted-foreground">All edits sync automatically in the background.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {emptyState ? "Create your first note to get started." : "Select a note card to begin editing."}
        </div>
      )}
    </div>
  );
};

export default NotesWidget;
