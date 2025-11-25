"use client";

import * as React from "react";
import dynamic from "next/dynamic";

import { toast } from "@repo/ui/toast";

import { env } from "@repo/env/next-env";

import { api } from "~/trpc/react";
import { usePdfViewerWidgetState } from "../useWidgetStateHooks";
import { loadPdfFile, persistPdfFile, removePdfFile } from "./storage";

// Dynamic import to keep PDF viewer client-side only
const IframePdfViewer = dynamic(
  () => import("@repo/ui/pdf-viewer-iframe").then((mod) => ({ default: mod.IframePdfViewer })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">Loading PDF viewer...</div>
      </div>
    ),
  }
);

interface PdfDocument {
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

interface PdfViewerWidgetV2Props {
  widgetId: string;
}

const createStorageKey = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `pdf-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const DEFAULT_PDF_WORKER_SRC = "/pdf.worker.min.mjs";

const PdfViewerWidgetV2 = ({ widgetId }: PdfViewerWidgetV2Props) => {
  const [storedState, updateState] = usePdfViewerWidgetState(widgetId);
  const workerSrc = React.useMemo(
    () => env.NEXT_PUBLIC_PDF_WORKER_SRC ?? DEFAULT_PDF_WORKER_SRC,
    [],
  );
  
  const [activeFile, setActiveFile] = React.useState<Uint8Array | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const lastPageChangeRef = React.useRef<{ docId: string; page: number } | null>(null);
  
  const documents: PdfDocument[] = React.useMemo(() => {
    if (!storedState) return [];
    
    return storedState.tabs
      .filter((tab) => tab.isOpen)
      .map((tab) => ({
      id: tab.id,
      title: tab.title,
      storageKey: tab.storageKey,
      currentPage: tab.currentPage,
      totalPages: tab.totalPages,
      bookmarks: tab.bookmarks,
      }));
  }, [storedState]);
  
  const derivedActiveDocId = storedState?.activeTabId ?? null;
  const activeDocId = derivedActiveDocId ?? documents[0]?.id ?? null;
  const activeTab = documents.find((doc) => doc.id === activeDocId) ?? null;
  
  // Mutations
  const createTabMutation = api.pdfViewer.createTab.useMutation({
    onError: (error) => toast.error(error.message),
  });
  
  const setActiveTabMutation = api.pdfViewer.setActiveTab.useMutation({
    onError: (error) => toast.error(error.message),
  });
  
  const updatePageMutation = api.pdfViewer.updatePage.useMutation({
    onError: (error) => toast.error(error.message),
  });
  
  const closeTabMutation = api.pdfViewer.closeTab.useMutation({
    onError: (error) => toast.error(error.message),
  });
  
  const addBookmarkMutation = api.pdfViewer.addBookmark.useMutation({
    onError: (error) => toast.error(error.message),
  });
  
  const removeBookmarkMutation = api.pdfViewer.removeBookmark.useMutation({
    onError: (error) => toast.error(error.message),
  });
  
  // Load active file
  React.useEffect(() => {
    let cancelled = false;
    
    const loadFile = async () => {
      if (!activeTab) {
        setActiveFile(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const file = await loadPdfFile(activeTab.storageKey);
        if (!cancelled) {
          setActiveFile(file);
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to load PDF from storage");
          setActiveFile(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    
    void loadFile();
    
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab?.storageKey]);
  
  const handleUpload = React.useCallback(async (file: File) => {
    setIsLoading(true);
    const storageKey = createStorageKey();
    
    try {
      const bytes = await persistPdfFile(storageKey, file);
      const created = await createTabMutation.mutateAsync({
        widgetId,
        title: file.name.replace(/\.pdf$/i, "") || "Untitled",
        storageKey,
      });
      
      updateState((prev) => ({
        tabs: [
          created,
          ...prev.tabs.map((t) => ({ ...t, isActive: false })),
        ],
        activeTabId: created.id,
      }));
      
      setActiveFile(bytes);
    } catch {
      removePdfFile(storageKey);
      toast.error("Failed to upload PDF");
    } finally {
      setIsLoading(false);
    }
  }, [createTabMutation, updateState, widgetId]);
  
  const handleSelectDocument = React.useCallback(async (id: string) => {
    try {
      await setActiveTabMutation.mutateAsync({ widgetId, tabId: id });
      
      updateState((prev) => ({
        tabs: prev.tabs.map((t) => ({
          ...t,
          isActive: t.id === id,
        })),
        activeTabId: id,
      }));
    } catch {
      // Error handled by mutation
    }
  }, [setActiveTabMutation, updateState, widgetId]);
  
  const handleRemoveDocument = React.useCallback(async (id: string) => {
    const tab = storedState?.tabs.find((t) => t.id === id);
    if (!tab) return;
    
    try {
      await closeTabMutation.mutateAsync({ tabId: id });
      removePdfFile(tab.storageKey);
      
      updateState((prev) => {
        const remainingTabs = prev.tabs.filter((t) => t.id !== id);
        const newActiveId = prev.activeTabId === id
          ? remainingTabs[0]?.id ?? null
          : prev.activeTabId;
        
        return {
          tabs: remainingTabs.map((t) => ({
            ...t,
            isActive: t.id === newActiveId,
          })),
          activeTabId: newActiveId,
        };
      });
    } catch {
      toast.error("Failed to remove PDF");
    }
  }, [closeTabMutation, storedState?.tabs, updateState]);
  
  const handlePageChange = React.useCallback(async (docId: string, page: number, total?: number | null) => {
    // Prevent redundant updates
    const lastChange = lastPageChangeRef.current;
    if (lastChange?.docId === docId && lastChange.page === page) {
      return;
    }
    lastPageChangeRef.current = { docId, page };

    const nextTotal =
      typeof total === "number"
        ? total
        : total === null
          ? null
          : storedState?.tabs.find((t) => t.id === docId)?.totalPages;

    try {
      await updatePageMutation.mutateAsync({
        tabId: docId,
        currentPage: page,
        totalPages: nextTotal ?? undefined,
      });
      
      updateState((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === docId ? { ...t, currentPage: page, totalPages: nextTotal ?? t.totalPages } : t
        ),
      }));
    } catch {
      // Error handled by mutation
    }
  }, [storedState?.tabs, updatePageMutation, updateState]);
  
  // Note: handleDocumentLoad removed since iframe viewer doesn't provide totalPages automatically
  // Users can manually track pages or we can extract it from PDF metadata if needed later
  
  const handleAddBookmark = React.useCallback(async (
    docId: string,
    page: number,
    payload?: { label?: string; note?: string; chapterLabel?: string },
  ) => {
    try {
      const bookmark = await addBookmarkMutation.mutateAsync({
        tabId: docId,
        pageNumber: page,
        label: payload?.label,
        note: payload?.note,
        chapterLabel: payload?.chapterLabel,
      });
      
      updateState((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === docId
            ? { ...t, bookmarks: [...t.bookmarks, bookmark].sort((a, b) => a.pageNumber - b.pageNumber) }
            : t
        ),
      }));
      
      toast.success("Bookmark added");
    } catch {
      // Error handled by mutation
    }
  }, [addBookmarkMutation, updateState]);
  
  const handleRemoveBookmark = React.useCallback(async (docId: string, bookmarkId: string) => {
    try {
      await removeBookmarkMutation.mutateAsync({ bookmarkId });
      
      updateState((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === docId
            ? { ...t, bookmarks: t.bookmarks.filter((b) => b.id !== bookmarkId) }
            : t
        ),
      }));
    } catch {
      // Error handled by mutation
    }
  }, [removeBookmarkMutation, updateState]);
  
  const handleGoToBookmark = React.useCallback(async (docId: string, page: number) => {
    await handlePageChange(docId, page);
  }, [handlePageChange]);
  
  return (
    <IframePdfViewer
      documents={documents}
      activeDocumentId={activeDocId}
      activeFile={activeFile}
      isLoading={isLoading}
      workerSrc={workerSrc}
      onUpload={handleUpload}
      onSelectDocument={handleSelectDocument}
      onRemoveDocument={handleRemoveDocument}
      onPageChange={handlePageChange}
      onAddBookmark={handleAddBookmark}
      onRemoveBookmark={handleRemoveBookmark}
      onGoToBookmark={handleGoToBookmark}
    />
  );
};

export default PdfViewerWidgetV2;
