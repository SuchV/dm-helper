"use client";

import * as React from "react";
import {
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  ListFilter,
  Loader2,
  Trash2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { Button } from "./button";
import { cn } from ".";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu";
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

const THUMBNAIL_ITEM_HEIGHT = 156;
const THUMBNAIL_BUFFER = 4;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.1;

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
  onGoToBookmark: _onGoToBookmark,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = React.useRef<HTMLDivElement>(null);
  const thumbnailsScrollRef = React.useRef<HTMLDivElement>(null);
  const resizeObserverRef = React.useRef<ResizeObserver | null>(null);
  const thumbnailCacheRef = React.useRef<Map<number, string>>(new Map());
  const thumbnailQueueRef = React.useRef<Set<number>>(new Set());
  const fitScaleRef = React.useRef(1);

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarTab, setSidebarTab] = React.useState<"thumbnails" | "bookmarks">("bookmarks");
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
  const [pageInputValue, setPageInputValue] = React.useState("1");
  const [thumbnailImages, setThumbnailImages] = React.useState<Record<number, string>>({});
  const [thumbnailViewport, setThumbnailViewport] = React.useState({ scrollTop: 0, height: 0 });
  const [zoomMode, setZoomMode] = React.useState<"auto" | "manual">("auto");
  const [manualZoom, setManualZoom] = React.useState(1);
  const [canvasContainerWidth, setCanvasContainerWidth] = React.useState(0);
  const [isPanning, setIsPanning] = React.useState(false);
  const [panStart, setPanStart] = React.useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = React.useState({ x: 0, y: 0 });
  const [isContentScrollable, setIsContentScrollable] = React.useState(false);
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
  const pageCount = pdfDoc?.numPages ?? activeDoc?.totalPages ?? 0;
  const canShowSidebar = Boolean(pdfDoc ?? hasBookmarks);

  const thumbnailWindow = React.useMemo(() => {
    if (!sidebarOpen || sidebarTab !== "thumbnails" || pageCount === 0) {
      return { startIndex: 0, endIndex: -1, offset: 0, pages: [] as number[] };
    }
    const viewHeight = thumbnailViewport.height || THUMBNAIL_ITEM_HEIGHT * 4;
    const scrollTop = thumbnailViewport.scrollTop;
    const startIndex = Math.max(0, Math.floor(scrollTop / THUMBNAIL_ITEM_HEIGHT) - THUMBNAIL_BUFFER);
    const endIndex = Math.min(
      pageCount - 1,
      Math.ceil((scrollTop + viewHeight) / THUMBNAIL_ITEM_HEIGHT) + THUMBNAIL_BUFFER,
    );
    const pages: number[] = [];
    for (let index = startIndex; index <= endIndex; index += 1) {
      pages.push(index + 1);
    }
    return {
      startIndex,
      endIndex,
      offset: startIndex * THUMBNAIL_ITEM_HEIGHT,
      pages,
    };
  }, [pageCount, sidebarOpen, sidebarTab, thumbnailViewport]);

  const visibleThumbnailPages = thumbnailWindow.pages;
  const thumbnailsTotalHeight = pageCount * THUMBNAIL_ITEM_HEIGHT;

  React.useEffect(() => {
    if (!sidebarOpen || sidebarTab !== "thumbnails") {
      return undefined;
    }
    const node = thumbnailsScrollRef.current;
    if (!node) {
      return undefined;
    }

    const updateViewport = () => {
      setThumbnailViewport((prev) => {
        if (prev.scrollTop === node.scrollTop && prev.height === node.clientHeight) {
          return prev;
        }
        return { scrollTop: node.scrollTop, height: node.clientHeight };
      });
    };

    updateViewport();
    node.addEventListener("scroll", updateViewport, { passive: true });
    if (typeof ResizeObserver !== "undefined") {
      resizeObserverRef.current = new ResizeObserver(() => updateViewport());
      resizeObserverRef.current.observe(node);
    }

    return () => {
      node.removeEventListener("scroll", updateViewport);
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
    };
  }, [sidebarOpen, sidebarTab]);

  React.useEffect(() => {
    if (!pdfDoc || sidebarTab !== "thumbnails" || !sidebarOpen) {
      return;
    }
    visibleThumbnailPages.forEach((pageNum) => {
      if (thumbnailCacheRef.current.has(pageNum) || thumbnailQueueRef.current.has(pageNum)) {
        return;
      }
      thumbnailQueueRef.current.add(pageNum);
      void (async () => {
        try {
          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale: 0.25 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) {
            return;
          }
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const renderTask = page.render({ canvasContext: context, viewport });
          await renderTask.promise;
          const dataUrl = canvas.toDataURL("image/png");
          thumbnailCacheRef.current.set(pageNum, dataUrl);
          setThumbnailImages((prev) => ({ ...prev, [pageNum]: dataUrl }));
        } catch (error) {
          console.error("[PDF Viewer] Failed to render thumbnail", error);
        } finally {
          thumbnailQueueRef.current.delete(pageNum);
        }
      })();
    });
  }, [pdfDoc, sidebarOpen, sidebarTab, visibleThumbnailPages]);

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

  React.useEffect(() => {
    setPageInputValue(String(pageNumber));
  }, [pageNumber]);

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

        const baseViewport = page.getViewport({ scale: 1 });
        const containerWidth = canvasContainerRef.current?.clientWidth ?? baseViewport.width;
        const fitScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, containerWidth / baseViewport.width));
        fitScaleRef.current = fitScale;
        const targetScale = zoomMode === "auto" ? fitScale : Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, manualZoom));
        const viewport = page.getViewport({ scale: targetScale });

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
  }, [pdfDoc, pageNumber, zoomMode, manualZoom, canvasContainerWidth]);

  React.useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      return;
    }
    const node = canvasContainerRef.current;
    if (!node) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setCanvasContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(node);
    setCanvasContainerWidth(node.clientWidth);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Check if content is scrollable after rendering
  React.useEffect(() => {
    if (isRendering) return;
    const container = canvasContainerRef.current;
    if (!container) {
      setIsContentScrollable(false);
      return;
    }
    const scrollable = container.scrollWidth > container.clientWidth || 
                       container.scrollHeight > container.clientHeight;
    setIsContentScrollable(scrollable);
  }, [isRendering, manualZoom, zoomMode, pageNumber]);

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
  };

  const commitPageInput = React.useCallback(() => {
    const parsed = Number.parseInt(pageInputValue, 10);
    if (Number.isNaN(parsed)) {
      setPageInputValue(String(pageNumber));
      return;
    }
    const target = clampPageNumber(parsed);
    setPageFromUserAction(target);
  }, [clampPageNumber, pageInputValue, pageNumber, setPageFromUserAction]);

  const handlePageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(event.target.value.replace(/[^0-9]/g, ""));
  };

  const handlePageInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitPageInput();
    }
  };

  const handlePageInputBlur = () => {
    commitPageInput();
  };

  const clampZoom = React.useCallback((value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)), []);

  const applyManualZoom = React.useCallback(
    (value: number) => {
      setZoomMode("manual");
      setManualZoom(clampZoom(value));
    },
    [clampZoom],
  );

  const handleZoomStep = React.useCallback(
    (delta: number) => {
      const base = zoomMode === "auto" ? fitScaleRef.current : manualZoom;
      applyManualZoom(base + delta);
    },
    [applyManualZoom, manualZoom, zoomMode],
  );

  const handleZoomPreset = React.useCallback(
    (value: "auto" | number) => {
      if (value === "auto") {
        setZoomMode("auto");
        return;
      }
      applyManualZoom(value);
    },
    [applyManualZoom],
  );

  // Pan handlers for drag-to-scroll when zoomed
  const handlePanStart = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only enable panning with left mouse button
    if (e.button !== 0) return;
    const container = canvasContainerRef.current;
    if (!container) return;
    
    // Check if content is scrollable (zoomed in)
    const isScrollable = container.scrollWidth > container.clientWidth || 
                         container.scrollHeight > container.clientHeight;
    if (!isScrollable) return;
    
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    setScrollStart({ x: container.scrollLeft, y: container.scrollTop });
    e.preventDefault();
  }, []);

  const handlePanMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    const container = canvasContainerRef.current;
    if (!container) return;
    
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    container.scrollLeft = scrollStart.x - dx;
    container.scrollTop = scrollStart.y - dy;
  }, [isPanning, panStart, scrollStart]);

  const handlePanEnd = React.useCallback(() => {
    setIsPanning(false);
  }, []);

  const zoomLabel = zoomMode === "auto" ? "Auto" : `${Math.round(manualZoom * 100)}%`;
  const zoomOutDisabled = zoomMode === "manual" && manualZoom <= MIN_ZOOM;
  const zoomInDisabled = zoomMode === "manual" && manualZoom >= MAX_ZOOM;

  const handleBookmarkRemoval = React.useCallback(
    (bookmarkId: string) => {
      if (!activeDoc) return;
      onRemoveBookmark(activeDoc.id, bookmarkId);
    },
    [activeDoc, onRemoveBookmark],
  );

  React.useEffect(() => {
    closeBookmarkForm();
    pendingPageRef.current = null;
    setSidebarOpen(false);
    setThumbnailViewport({ scrollTop: 0, height: 0 });
    thumbnailCacheRef.current.clear();
    thumbnailQueueRef.current.clear();
    setThumbnailImages({});
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
            <>
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
              <Button
                size="sm"
                variant={sidebarOpen ? "primary" : "outline"}
                onClick={() => setSidebarOpen((prev) => !prev)}
                disabled={!pdfDoc && !hasBookmarks}
              >
                <LayoutList className="h-4 w-4 mr-1" />
                {sidebarOpen ? "Hide Panel" : "Show Panel"}
              </Button>
            </>
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
          {/* Sidebar on left for natural reading flow */}
          {canShowSidebar && sidebarOpen && (
            <div
              className="flex h-full w-56 flex-shrink-0 flex-col overflow-hidden rounded border border-border bg-muted/20"
            >
              <div className="flex items-center justify-between border-b border-border/60 px-2 py-1">
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant={sidebarTab === "thumbnails" ? "secondary" : "ghost"}
                    className="h-6 px-2 text-[10px]"
                    onClick={() => setSidebarTab("thumbnails")}
                    disabled={!pdfDoc}
                  >
                    Pages
                  </Button>
                  <Button
                    size="sm"
                    variant={sidebarTab === "bookmarks" ? "secondary" : "ghost"}
                    className="h-6 px-2 text-[10px]"
                    onClick={() => setSidebarTab("bookmarks")}
                  >
                    Marks
                  </Button>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  aria-label="Close sidebar"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              {sidebarTab === "thumbnails" ? (
                <div ref={thumbnailsScrollRef} className="flex-1 overflow-auto px-2 py-2">
                  {pageCount === 0 ? (
                    <p className="text-[11px] text-muted-foreground">Upload a PDF to see page thumbnails.</p>
                  ) : (
                    <div className="relative w-full" style={{ height: thumbnailsTotalHeight || THUMBNAIL_ITEM_HEIGHT }}>
                      <div
                        className="absolute left-0 right-0 space-y-2"
                        style={{ transform: `translateY(${thumbnailWindow.offset}px)` }}
                      >
                        {visibleThumbnailPages.map((pageNum) => {
                          const src = thumbnailImages[pageNum];
                          const isActivePage = pageNum === pageNumber;
                          return (
                            <button
                              key={pageNum}
                              className={cn(
                                "w-full rounded border p-1 text-left text-[11px] transition-colors",
                                isActivePage ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                              )}
                              onClick={() => jumpToPage(pageNum)}
                            >
                              {src ? (
                                <img
                                  src={src}
                                  alt={`Page ${pageNum}`}
                                  className="mb-1 h-28 w-full rounded bg-background object-contain"
                                />
                              ) : (
                                <div className="mb-1 flex h-28 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">
                                  Rendering…
                                </div>
                              )}
                              <div className="font-mono text-center">Page {pageNum}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 space-y-1 overflow-auto px-2 py-2">
                  {hasBookmarks ? (
                    activeDocBookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className="group flex items-start justify-between gap-1 rounded p-1.5 transition-colors hover:bg-muted"
                      >
                        <button className="flex-1 text-left text-xs" onClick={() => jumpToPage(bookmark.pageNumber)}>
                          <div className="truncate font-medium">{bookmark.label}</div>
                          <div className="text-[10px] text-muted-foreground">p. {bookmark.pageNumber}</div>
                          {bookmark.chapterLabel && (
                            <div className="text-[10px] text-muted-foreground">{bookmark.chapterLabel}</div>
                          )}
                          {bookmark.note && (
                            <div className="mt-1 line-clamp-2 whitespace-pre-line text-[11px] text-muted-foreground">{bookmark.note}</div>
                          )}
                        </button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => handleBookmarkRemoval(bookmark.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-muted-foreground">Add a bookmark to see it here.</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex-1 overflow-hidden rounded border border-border min-h-0 bg-background">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-3 py-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center gap-2">
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
                <div className="flex items-center gap-1">
                  <Input
                    value={pageInputValue}
                    onChange={handlePageInputChange}
                    onKeyDown={handlePageInputKeyDown}
                    onBlur={handlePageInputBlur}
                    className="h-7 w-16 text-center"
                    inputMode="numeric"
                    aria-label="Current page"
                  />
                  <span className="text-muted-foreground">/ {totalPages ?? "?"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleZoomStep(-ZOOM_STEP)}
                  disabled={zoomOutDisabled}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleZoomStep(ZOOM_STEP)}
                  disabled={zoomInDisabled}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <ListFilter className="h-4 w-4" />
                      {zoomLabel}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 text-xs">
                    <DropdownMenuLabel>Zoom Options</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => handleZoomPreset("auto")}>Automatic</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {[0.5, 0.75, 1].map((value) => (
                      <DropdownMenuItem key={value} onSelect={() => handleZoomPreset(value)}>
                        {Math.round(value * 100)}%
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div 
              ref={canvasContainerRef} 
              className={cn(
                "relative h-full w-full overflow-auto bg-muted/20",
                isContentScrollable 
                  ? (isPanning ? "cursor-grabbing" : "cursor-grab")
                  : "flex items-center justify-center"
              )}
              onMouseDown={handlePanStart}
              onMouseMove={handlePanMove}
              onMouseUp={handlePanEnd}
              onMouseLeave={handlePanEnd}
            >
              <canvas 
                ref={canvasRef} 
                className={cn(
                  "pointer-events-none select-none",
                  !isContentScrollable && "max-h-full"
                )} 
              />
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
        </div>
      )}
    </div>
  );
};
