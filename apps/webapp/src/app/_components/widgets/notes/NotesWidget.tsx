"use client";

import * as React from "react";
import { Pin, PinOff, Trash2 } from "lucide-react";

import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { toast } from "@repo/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import {
  NoteCard,
  NoteCardHeader,
  NoteCardMeta,
  NoteCardPreview,
  NoteCardStatus,
  NoteCardTitle,
  NoteCreateCard,
  NoteGrid,
} from "@repo/ui/note-card";

import { api } from "~/trpc/react";

import { useNotesWidgetState } from "../useWidgetStateHooks";
import type { NotesWidgetNote, NotesWidgetState } from "../widget-types";

interface NotesWidgetProps {
  widgetId: string;
}

const toIso = (value: string | Date) => new Date(value).toISOString();

const normalizeNote = (
  note: Omit<NotesWidgetNote, "createdAt" | "updatedAt" | "pinnedAt"> & {
    createdAt: string | Date;
    updatedAt: string | Date;
    pinnedAt: string | Date | null;
  },
): NotesWidgetNote => ({
  ...note,
  pinnedAt: note.pinnedAt ? toIso(note.pinnedAt) : null,
  createdAt: toIso(note.createdAt),
  updatedAt: toIso(note.updatedAt),
});

const sortNotes = (entries: NotesWidgetNote[]): NotesWidgetNote[] => {
  const getPinnedAtValue = (value: string | null) => (value ? new Date(value).getTime() : -Infinity);

  return [...entries].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }

    const pinnedAtDiff = getPinnedAtValue(b.pinnedAt) - getPinnedAtValue(a.pinnedAt);
    if (pinnedAtDiff !== 0) {
      return pinnedAtDiff;
    }

    if (a.position !== b.position) {
      return a.position - b.position;
    }

    return a.createdAt.localeCompare(b.createdAt);
  });
};

const NotesWidget = ({ widgetId }: NotesWidgetProps) => {
  const [notesState, updateNotesState] = useNotesWidgetState(widgetId);
  const safeState: NotesWidgetState = notesState ?? { notes: [] };
  const notes = safeState.notes;
  const [activeNoteId, setActiveNoteId] = React.useState<string | null>(notes[0]?.id ?? null);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);

  React.useEffect(() => {
    if (notes.length === 0) {
      setActiveNoteId(null);
      setIsEditorOpen(false);
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
        notes: sortNotes(prev.notes.map((entry) => (entry.id === normalized.id ? normalized : entry))),
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
        notes: sortNotes([...prev.notes, normalized]),
      }));
      setActiveNoteId(normalized.id);
      setIsEditorOpen(true);
    },
  });

  const pinNoteMutation = api.note.pin.useMutation({
    onSuccess: (note) => {
      const normalized = normalizeNote(note);
      updateNotesState((prev) => ({
        notes: sortNotes(prev.notes.map((entry) => (entry.id === normalized.id ? normalized : entry))),
      }));
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
      if (!fallbackId) {
        setIsEditorOpen(false);
      }
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

  const handleTogglePin = (noteId: string, nextPinned: boolean) => {
    const previousNote = notes.find((note) => note.id === noteId);
    const previousSnapshot = previousNote
      ? { pinned: previousNote.pinned, pinnedAt: previousNote.pinnedAt }
      : null;

    updateNotesState((prev) => {
      const nowIso = new Date().toISOString();
      const updated = prev.notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              pinned: nextPinned,
              pinnedAt: nextPinned ? nowIso : null,
            }
          : note,
      );

      return { notes: sortNotes(updated) };
    });

    pinNoteMutation.mutate(
      { noteId, pinned: nextPinned },
      {
        onError: (error) => {
          console.error(error);
          toast.error(error.message ?? "Unable to update pin state");
          if (!previousSnapshot) {
            return;
          }

          updateNotesState((prev) => ({
            notes: sortNotes(
              prev.notes.map((note) =>
                note.id === noteId
                  ? {
                      ...note,
                      pinned: previousSnapshot.pinned,
                      pinnedAt: previousSnapshot.pinnedAt,
                    }
                  : note,
              ),
            ),
          }));
        },
      },
    );
  };

  const handleCardSelect = (noteId: string) => {
    setActiveNoteId(noteId);
    setIsEditorOpen(true);
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
      <NoteGrid>
        {notes.map((note) => {
          const isActive = isEditorOpen && note.id === activeNoteId;
          const previewTitle = note.title.trim() || "Untitled note";
          const previewBody = note.content.trim() || "No content yet";

          return (
            <NoteCard
              key={note.id}
              active={isActive}
              onClick={() => handleCardSelect(note.id)}
            >
              <NoteCardHeader>
                <NoteCardTitle>{previewTitle}</NoteCardTitle>
                <div className="flex items-center gap-2">
                  {note.pinned ? <NoteCardStatus>Pinned</NoteCardStatus> : null}
                  {isActive ? <NoteCardStatus>Editing</NoteCardStatus> : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={note.pinned ? "text-amber-500" : "text-muted-foreground"}
                    aria-pressed={note.pinned}
                    aria-label={note.pinned ? "Unpin note" : "Pin note"}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleTogglePin(note.id, !note.pinned);
                    }}
                    disabled={pinNoteMutation.isPending}
                  >
                    {note.pinned ? <Pin className="h-4 w-4" aria-hidden /> : <PinOff className="h-4 w-4" aria-hidden />}
                  </Button>
                </div>
              </NoteCardHeader>
              <NoteCardPreview>{previewBody}</NoteCardPreview>
              <NoteCardMeta>
                {new Date(note.updatedAt).toLocaleDateString()}
              </NoteCardMeta>
            </NoteCard>
          );
        })}

        <NoteCreateCard onClick={handleCreateNote} disabled={createNoteMutation.isPending}>
          New note
        </NoteCreateCard>
      </NoteGrid>

      {emptyState ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Create your first note to get started.
        </div>
      ) : null}

      <Dialog
        open={isEditorOpen && Boolean(activeNote)}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditorOpen(false);
          } else if (activeNote) {
            setIsEditorOpen(true);
          }
        }}
      >
        {activeNote ? (
          <DialogContent
            className="max-w-3xl overflow-hidden rounded-3xl border border-border/70 bg-card p-0 shadow-2xl"
            aria-describedby={undefined}
          >
            <div className="border-b border-border/60 bg-gradient-to-r from-muted/50 via-card to-muted/40 px-6 py-4">
              <DialogHeader className="gap-1 text-left">
                <DialogTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Editing note
                </DialogTitle>
                <DialogDescription className="text-2xl font-semibold text-foreground">
                  {activeNote.title.trim() || "Untitled note"}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="bg-muted/60">
                  Auto-save on
                </Badge>
                <span>•</span>
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
                className="min-h-[260px]"
              />
              <div className="flex items-center justify-end gap-3 text-sm text-muted-foreground">
                <span>All changes sync in the background</span>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => handleDelete(activeNote.id)}
                  disabled={deleteNoteMutation.isPending}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Delete note
                </Button>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
};

export default NotesWidget;
