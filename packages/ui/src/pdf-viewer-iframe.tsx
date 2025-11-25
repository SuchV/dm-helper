"use client";

import * as React from "react";
import { BookmarkPlus, ChevronLeft, ChevronRight, Loader2, Trash2, Upload, X } from "lucide-react";

import { Button } from "./button";
import { cn } from ".";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";

export interface PdfDocument {
  id: string;
  title: string;
  storageKey: string;
  currentPage: number;
  totalPages: number | null;
  bookmarks: {
    id: string;
    label: string;
    pageNumber: number;
    note: string | null;
    chapterLabel: string | null;
  }[];
}

export interface BookmarkPayload {
  label?: string;
  note?: string;
  chapterLabel?: string;
}

interface BookmarkDraft {
  label: string;
  chapterLabel: string;
  note: string;
}


export interface IframePdfViewerProps {
  documents: PdfDocument[];
  activeDocumentId: string | null;
  activeFile: Uint8Array | null;
  isLoading?: boolean;
  /**
   * Optional override for the pdf.js worker script location. When omitted the component
   * will stream the worker bundle from the npm package and host it via a blob URL.
   */
  workerSrc?: string;
  onUpload: (file: File) => void | Promise<void>;
  onSelectDocument: (id: string) => void;
  onRemoveDocument: (id: string) => void;
  onPageChange: (docId: string, page: number, totalPages?: number | null) => void | Promise<void>;
  onAddBookmark: (docId: string, page: number, payload?: BookmarkPayload) => void | Promise<void>;
  onRemoveBookmark: (docId: string, bookmarkId: string) => void;
  onGoToBookmark: (docId: string, page: number) => void;
}

const WORKER_CDN_BASE = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js";

interface PdfViewport {
  width: number;
  height: number;
}

interface PdfPageRenderTask {
  promise: Promise<unknown>;
}

interface PdfPageProxy {
  getViewport: (params: { scale: number }) => PdfViewport;
  render: (params: { canvasContext: CanvasRenderingContext2D; viewport: PdfViewport }) => PdfPageRenderTask;
}

interface PdfDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPageProxy>;
}

interface PdfJsLoadingTask {
  promise: Promise<PdfDocumentProxy>;
  destroy: () => void;
}

interface PdfJsModule {
  version: string;
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (params: { data: Uint8Array }) => PdfJsLoadingTask;
  disableWorker?: boolean;
}

export const IframePdfViewer: React.FC<IframePdfViewerProps> = ({
  documents,
  activeDocumentId,
  activeFile,
  isLoading,
  workerSrc,
  onUpload,
  onSelectDocument,
  onRemoveDocument,
  onPageChange,
  onAddBookmark,
  onRemoveBookmark,
  onGoToBookmark,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = React.useRef<HTMLDivElement>(null);

  const [bookmarksOpen, setBookmarksOpen] = React.useState(false);
  const [pdfjsReady, setPdfjsReady] = React.useState(false);
  const [pdfDoc, setPdfDoc] = React.useState<PdfDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState<number | null>(null);
  const [isRendering, setIsRendering] = React.useState(false);
  const [viewerError, setViewerError] = React.useState<string | null>(null);
  const [bookmarkFormOpen, setBookmarkFormOpen] = React.useState(false);
  const [bookmarkDraft, setBookmarkDraft] = React.useState<BookmarkDraft>(() => ({
    label: "",
    chapterLabel: "",
    note: "",
  }));
  const componentId = React.useId();
  const bookmarkLabelId = `${componentId}-bookmark-label`;
  const bookmarkChapterId = `${componentId}-bookmark-chapter`;
  const bookmarkNoteId = `${componentId}-bookmark-note`;
  const bookmarkFormContainerId = `${componentId}-bookmark-form`;

  const pdfjsModuleRef = React.useRef<PdfJsModule | null>(null);
  const pdfjsLoadPromiseRef = React.useRef<Promise<PdfJsModule> | null>(null);
  const syncFromServerRef = React.useRef(false);
  const pendingPageRef = React.useRef<{ docId: string; page: number } | null>(null);
  const workerConfiguredRef = React.useRef(false);
  const workerBlobUrlRef = React.useRef<string | null>(null);
  const activeRenderTaskRef = React.useRef<PdfPageRenderTask | null>(null);

  React.useEffect(() => {
    return () => {
      if (workerBlobUrlRef.current) {
        URL.revokeObjectURL(workerBlobUrlRef.current);
        workerBlobUrlRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    workerConfiguredRef.current = false;
    if (workerBlobUrlRef.current) {
      URL.revokeObjectURL(workerBlobUrlRef.current);
      workerBlobUrlRef.current = null;
    }
  }, [workerSrc]);

  const activeDoc = documents.find((d) => d.id === activeDocumentId) ?? null;
  const activeDocId = activeDoc?.id ?? null;
  const activeDocCurrentPage = activeDoc?.currentPage ?? 1;
  const activeDocBookmarks = activeDoc?.bookmarks ?? [];
  const hasBookmarks = activeDocBookmarks.length > 0;
  const activeDocForBookmarks = hasBookmarks ? activeDoc : null;

  const ensureWorkerConfigured = React.useCallback(
    async (pdfjs: PdfJsModule) => {
      if (workerConfiguredRef.current) return;
      try {
        let resolvedWorkerSrc = workerSrc;
        if (!resolvedWorkerSrc) {
          const response = await fetch(`${WORKER_CDN_BASE}/${pdfjs.version}/pdf.worker.min.js`, { mode: "cors" });
          if (!response.ok) {
            throw new Error(`Failed to download pdf.js worker (${response.status})`);
          }
          const script = await response.text();
          const blob = new Blob([script], { type: "text/javascript" });
          resolvedWorkerSrc = URL.createObjectURL(blob);
          workerBlobUrlRef.current = resolvedWorkerSrc;
        }
        pdfjs.GlobalWorkerOptions.workerSrc = resolvedWorkerSrc;
        workerConfiguredRef.current = true;
      } catch (error) {
        console.error("Failed to configure pdf.js worker, falling back to main thread", error);
        pdfjs.disableWorker = true;
        workerConfiguredRef.current = true;
      }
    },
    [workerSrc],
  );

  const loadPdfjsModule = React.useCallback(async (): Promise<PdfJsModule> => {
    if (pdfjsModuleRef.current) {
      return pdfjsModuleRef.current;
    }

    pdfjsLoadPromiseRef.current ??= (async () => {
      try {
        console.info("[PDF Viewer] Attempting to load pdf.js from CDN");
        return (await import(
          /* webpackIgnore: true */ "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.394/legacy/build/pdf.min.mjs"
        )) as unknown as PdfJsModule;
      } catch (cdnError) {
        console.error("[PDF Viewer] Failed to load pdf.js from CDN", cdnError);
        console.info("[PDF Viewer] Falling back to bundled pdf.js build");
        return (await import("pdfjs-dist/legacy/build/pdf")) as unknown as PdfJsModule;
      }
    })()
      .catch((error) => {
        pdfjsLoadPromiseRef.current = null;
        throw error;
      });

    const pdfjs = await pdfjsLoadPromiseRef.current;
    pdfjsModuleRef.current = pdfjs;
    return pdfjs;
  }, []);

  React.useEffect(() => {
    if (pdfjsReady) {
      return;
    }

    const abortController = new AbortController();
    const isAborted = () => abortController.signal.aborted;

    const loadPdfjs = async () => {
      try {
        const pdfjs = await loadPdfjsModule();
        if (isAborted()) return;
        await ensureWorkerConfigured(pdfjs);
        if (isAborted()) return;
        setPdfjsReady(true);
      } catch (error) {
        if (isAborted()) return;
        console.error("[PDF Viewer] Unable to initialize pdf.js", error);
        setViewerError("Failed to load PDF library. Check your internet connection.");
      }
    };

    void loadPdfjs();

    return () => {
      abortController.abort();
    };
  }, [pdfjsReady, loadPdfjsModule, ensureWorkerConfigured]);

  // Load pdf document whenever the active file changes
  React.useEffect(() => {
    if (!pdfjsReady || !activeFile) {
      setPdfDoc(null);
      setTotalPages(null);
      return;
    }

    const pdfjs = pdfjsModuleRef.current;
    if (!pdfjs) {
      return;
    }

    let cancelled = false;
    setViewerError(null);
    console.log("[PDF Viewer] Loading document, file size:", activeFile.length, "bytes");
    const loadingTask = pdfjs.getDocument({ data: activeFile });

    loadingTask.promise
      .then((doc) => {
        if (cancelled) return;
        console.log("[PDF Viewer] Document loaded, pages:", doc.numPages);
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load PDF", error);
        setViewerError("Unable to render PDF. Try re-uploading the file.");
        setPdfDoc(null);
      });

    return () => {
      cancelled = true;
      loadingTask.destroy();
      setPdfDoc(null);
    };
  }, [pdfjsReady, activeFile]);

  // Keep page number in sync with server state
  React.useEffect(() => {
    if (!activeDocId) return;
    const pending = pendingPageRef.current;
    if (pending && pending.docId === activeDocId) {
      if (pending.page === activeDocCurrentPage) {
        pendingPageRef.current = null;
      } else if (pending.page === pageNumber) {
        // Waiting for server acknowledgement; avoid overriding the user's selection
        return;
      }
    }

    if (activeDocCurrentPage === pageNumber) return;
    syncFromServerRef.current = true;
    setPageNumber(activeDocCurrentPage);
  }, [activeDocId, activeDocCurrentPage, pageNumber]);

  // Render current page whenever it changes
  React.useEffect(() => {
    if (!pdfDoc) return;
    const safePage = Math.min(Math.max(pageNumber, 1), pdfDoc.numPages);
    if (safePage !== pageNumber) {
      syncFromServerRef.current = true;
      setPageNumber(safePage);
      return;
    }

    let cancelled = false;
    
    // Cancel any ongoing render task
    if (activeRenderTaskRef.current) {
      try {
        void activeRenderTaskRef.current.promise.catch(() => {
          // Ignore cancellation errors
        });
      } catch {
        // Ignore cancellation errors
      }
      activeRenderTaskRef.current = null;
    }
    
    setIsRendering(true);
    console.log("[PDF Viewer] Rendering page", safePage, "of", pdfDoc.numPages);

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(safePage);
        if (cancelled) return;

        const containerWidth = canvasContainerRef.current?.clientWidth ?? page.getViewport({ scale: 1 }).width;
        const scale = Math.max(0.5, Math.min(2.5, containerWidth / page.getViewport({ scale: 1 }).width));
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) {
          console.warn("[PDF Viewer] Canvas or context not available");
          setIsRendering(false);
          return;
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        console.log("[PDF Viewer] Canvas dimensions set:", canvas.width, "x", canvas.height);

        const renderContext = {
          canvasContext: context,
          viewport,
        } as const;

        const renderTask = page.render(renderContext);
        activeRenderTaskRef.current = renderTask;
        await renderTask.promise;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (cancelled) {
          return;
        }
        activeRenderTaskRef.current = null;
        console.log("[PDF Viewer] Page rendered successfully");
        setIsRendering(false);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to render page", error);
          setIsRendering(false);
        }
      }
    };

    void renderPage();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pageNumber]);

  // Notify parent when the user navigates to a different page
  React.useEffect(() => {
    if (!activeDocId || !pdfDoc) return;
    if (syncFromServerRef.current) {
      syncFromServerRef.current = false;
      return;
    }

    const effectiveTotalPages = typeof totalPages === "number" ? totalPages : pdfDoc.numPages;
    void onPageChange(activeDocId, pageNumber, effectiveTotalPages);
  }, [pageNumber, activeDocId, pdfDoc, onPageChange, totalPages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    void onUpload(file);
    event.target.value = "";
  };

  const resetBookmarkDraft = React.useCallback(() => {
    setBookmarkDraft({ label: "", chapterLabel: "", note: "" });
  }, [setBookmarkDraft]);

  const closeBookmarkForm = React.useCallback(() => {
    setBookmarkFormOpen(false);
    resetBookmarkDraft();
  }, [resetBookmarkDraft, setBookmarkFormOpen]);

  const openBookmarkForm = React.useCallback(() => {
    setBookmarkDraft({ label: `Page ${pageNumber}`, chapterLabel: "", note: "" });
    setBookmarkFormOpen(true);
  }, [pageNumber, setBookmarkDraft, setBookmarkFormOpen]);

  const handleBookmarkButtonClick = () => {
    if (!activeDoc) return;
    if (bookmarkFormOpen) {
      closeBookmarkForm();
    } else {
      openBookmarkForm();
    }
  };

  const handleBookmarkSubmit = () => {
    if (!activeDoc) return;
    const label = bookmarkDraft.label.trim();
    const chapterLabel = bookmarkDraft.chapterLabel.trim();
    const note = bookmarkDraft.note.trim();

    void onAddBookmark(activeDoc.id, pageNumber, {
      label: label.length > 0 ? label : undefined,
      chapterLabel: chapterLabel.length > 0 ? chapterLabel : undefined,
      note: note.length > 0 ? note : undefined,
    });

    closeBookmarkForm();
  };

  const clampPageNumber = React.useCallback(
    (next: number) => {
      if (pdfDoc) {
        return Math.min(Math.max(next, 1), pdfDoc.numPages);
      }
      if (typeof totalPages === "number") {
        return Math.min(Math.max(next, 1), totalPages);
      }
      return Math.max(1, next);
    },
    [pdfDoc, totalPages],
  );

  const setPageFromUserAction = React.useCallback(
    (next: number) => {
      syncFromServerRef.current = false; // Mark as user-initiated change
      const clamped = clampPageNumber(next);
      if (activeDocId) {
        pendingPageRef.current = { docId: activeDocId, page: clamped };
      }
      setPageNumber(clamped);
    },
    [activeDocId, clampPageNumber],
  );

  const goToPage = (delta: number) => {
    setPageFromUserAction(pageNumber + delta);
  };

  const jumpToPage = (page: number) => {
    setPageFromUserAction(page);
    if (activeDocId) {
      onGoToBookmark(activeDocId, clampPageNumber(page));
    }
  };

  React.useEffect(() => {
    setBookmarksOpen(false);
    closeBookmarkForm();
    pendingPageRef.current = null;
  }, [activeDoc?.id, closeBookmarkForm]);

  const showEmptyState = !activeDoc || !activeFile;

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-3 pt-3 pb-2 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>
          {activeDoc && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleBookmarkButtonClick}
              aria-expanded={bookmarkFormOpen}
              aria-controls={bookmarkFormOpen ? bookmarkFormContainerId : undefined}
              aria-pressed={bookmarkFormOpen}
            >
              <BookmarkPlus className="h-4 w-4 mr-1" />
              Bookmark
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {documents.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "group flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors",
                  doc.id === activeDocumentId ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
                )}
              >
                <button className="text-left" onClick={() => onSelectDocument(doc.id)}>
                  {doc.title}
                </button>
                <Button size="sm" variant="ghost" className="h-4 w-4 p-0" onClick={() => onRemoveDocument(doc.id)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {bookmarkFormOpen && activeDoc && (
        <div
          id={bookmarkFormContainerId}
          className="mx-3 rounded border border-border bg-muted/30 p-3 text-xs sm:text-sm"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor={bookmarkLabelId} className="text-[10px] font-semibold uppercase text-muted-foreground">
                Label
              </Label>
              <Input
                id={bookmarkLabelId}
                value={bookmarkDraft.label}
                placeholder={`Page ${pageNumber}`}
                onChange={(event) =>
                  setBookmarkDraft((prev) => ({
                    ...prev,
                    label: event.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label
                htmlFor={bookmarkChapterId}
                className="text-[10px] font-semibold uppercase text-muted-foreground"
              >
                Chapter / Section
              </Label>
              <Input
                id={bookmarkChapterId}
                value={bookmarkDraft.chapterLabel}
                placeholder="Optional chapter label"
                onChange={(event) =>
                  setBookmarkDraft((prev) => ({
                    ...prev,
                    chapterLabel: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-1">
            <Label htmlFor={bookmarkNoteId} className="text-[10px] font-semibold uppercase text-muted-foreground">
              Note
            </Label>
            <Textarea
              id={bookmarkNoteId}
              value={bookmarkDraft.note}
              placeholder="Add context that future-you will appreciate"
              rows={3}
              onChange={(event) =>
                setBookmarkDraft((prev) => ({
                  ...prev,
                  note: event.target.value,
                }))
              }
            />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={closeBookmarkForm}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleBookmarkSubmit}>
              Save bookmark
            </Button>
          </div>
        </div>
      )}

      {showEmptyState ? (
        <div className="flex-1 rounded-lg border border-dashed border-border bg-muted/20 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {activeDoc ? "PDF stored locally. Re-upload if missing." : "Upload a PDF to get started"}
          </p>
        </div>
      ) : (
        <div className="flex flex-1 gap-2 overflow-hidden min-h-0">
          <div className="flex-1 overflow-hidden rounded border border-border min-h-0 bg-background">
            <div className="flex items-center justify-between border-b border-border px-3 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={() => goToPage(-1)} disabled={pageNumber <= 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => goToPage(1)}
                  disabled={totalPages ? pageNumber >= totalPages : false}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="font-mono">
                Page {pageNumber}
                {totalPages ? ` / ${totalPages}` : ""}
              </div>
            </div>
            <div ref={canvasContainerRef} className="relative flex h-full w-full items-center justify-center overflow-auto bg-muted/20">
              <canvas ref={canvasRef} className="max-h-full" />
              {isRendering && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {viewerError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-destructive">{viewerError}</p>
                </div>
              )}
            </div>
          </div>

          {activeDocForBookmarks && (
            <div
              className={cn(
                "flex h-full flex-shrink-0 flex-col overflow-hidden rounded border border-border bg-muted/20 transition-[width] duration-200",
                bookmarksOpen ? "w-56" : "w-[44px]"
              )}
            >
              <div
                className={cn(
                  "flex items-center border-b border-border/60 px-2 py-1",
                  bookmarksOpen ? "justify-between" : "justify-center"
                )}
              >
                {bookmarksOpen && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Bookmarks</span>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  aria-expanded={bookmarksOpen}
                  aria-label={bookmarksOpen ? "Collapse bookmarks" : "Expand bookmarks"}
                  onClick={() => setBookmarksOpen((prev) => !prev)}
                >
                  {bookmarksOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
              </div>
              {bookmarksOpen ? (
                <div className="flex-1 space-y-1 overflow-auto px-2 py-2">
                  {activeDocBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="group flex items-start justify-between gap-1 rounded p-1.5 transition-colors hover:bg-muted"
                    >
                      <button
                        className="flex-1 text-left text-xs"
                        onClick={() => jumpToPage(bookmark.pageNumber)}
                      >
                        <div className="truncate font-medium">{bookmark.label}</div>
                        <div className="text-[10px] text-muted-foreground">p. {bookmark.pageNumber}</div>
                        {bookmark.chapterLabel && (
                          <div className="text-[10px] text-muted-foreground">{bookmark.chapterLabel}</div>
                        )}
                        {bookmark.note && (
                          <div className="mt-1 text-[11px] text-muted-foreground whitespace-pre-line">
                            {bookmark.note}
                          </div>
                        )}
                      </button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => onRemoveBookmark(activeDocForBookmarks.id, bookmark.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground [writing-mode:vertical-rl]">
                  Marks
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
