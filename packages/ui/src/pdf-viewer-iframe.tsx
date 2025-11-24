"use client";

import * as React from "react";
import { BookmarkPlus, ChevronLeft, ChevronRight, Trash2, Upload, X } from "lucide-react";

import { Button } from "./button";
import { cn } from ".";

export interface PdfDocument {
  id: string;
  title: string;
  storageKey: string;
  currentPage: number;
  totalPages: number | null;
  bookmarks: { id: string; label: string; pageNumber: number }[];
}

export interface IframePdfViewerProps {
  documents: PdfDocument[];
  activeDocumentId: string | null;
  activeFile: Uint8Array | null;
  isLoading?: boolean;
  onUpload: (file: File) => void | Promise<void>;
  onSelectDocument: (id: string) => void;
  onRemoveDocument: (id: string) => void;
  onPageChange: (docId: string, page: number) => void;
  onAddBookmark: (docId: string, page: number) => void;
  onRemoveBookmark: (docId: string, bookmarkId: string) => void;
  onGoToBookmark: (docId: string, page: number) => void;
}

export const IframePdfViewer: React.FC<IframePdfViewerProps> = ({
  documents,
  activeDocumentId,
  activeFile,
  isLoading,
  onUpload,
  onSelectDocument,
  onRemoveDocument,
  onAddBookmark,
  onRemoveBookmark,
  onGoToBookmark,
}) => {
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [bookmarksOpen, setBookmarksOpen] = React.useState(false);
  
  const activeDoc = documents.find((d) => d.id === activeDocumentId);
  const activeDocBookmarks = activeDoc?.bookmarks ?? [];
  const hasBookmarks = activeDocBookmarks.length > 0;
  const activeDocId = activeDoc?.id ?? null;
  
  // Create blob URL for PDF
  React.useEffect(() => {
    if (activeFile) {
      const blob = new Blob([activeFile as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPdfUrl(null);
    }
  }, [activeFile]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void onUpload(file);
      // Reset input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  const handleAddBookmark = () => {
    if (activeDoc) {
      // Default to page 1 since we can't track page from iframe
      onAddBookmark(activeDoc.id, activeDoc.currentPage);
    }
  };

  React.useEffect(() => {
    // Collapse bookmarks drawer whenever the active document changes
    setBookmarksOpen(false);
  }, [activeDoc?.id]);
  
  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3">
      {/* Minimal header */}
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
              onClick={handleAddBookmark}
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
        
        {/* Document tabs */}
        {documents.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "group flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors",
                  doc.id === activeDocumentId
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <button
                  className="text-left"
                  onClick={() => onSelectDocument(doc.id)}
                >
                  {doc.title}
                </button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0"
                  onClick={() => onRemoveDocument(doc.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Full-height PDF viewer */}
      {activeDoc && pdfUrl ? (
        <div className="flex flex-1 gap-2 overflow-hidden min-h-0">
          {/* PDF iframe - full width */}
          <div className="flex-1 overflow-hidden rounded border border-border min-h-0">
            <iframe
              src={pdfUrl}
              className="h-full w-full"
              title={activeDoc.title}
            />
          </div>
          
          {/* Compact bookmarks sidebar */}
          {hasBookmarks && activeDocId && (
            <div
              className={cn(
                "flex h-full flex-shrink-0 flex-col overflow-hidden rounded border border-border bg-muted/20 transition-[width] duration-200",
                bookmarksOpen ? "w-56" : "w-[44px]"
              )}
            >
              <div className={cn(
                "flex items-center border-b border-border/60 px-2 py-1",
                bookmarksOpen ? "justify-between" : "justify-center"
              )}
              >
                {bookmarksOpen && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Bookmarks
                  </span>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  aria-expanded={bookmarksOpen}
                  aria-label={bookmarksOpen ? "Collapse bookmarks" : "Expand bookmarks"}
                  onClick={() => setBookmarksOpen((prev) => !prev)}
                >
                  {bookmarksOpen ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
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
                        onClick={() => onGoToBookmark(activeDocId, bookmark.pageNumber)}
                      >
                        <div className="truncate font-medium">{bookmark.label}</div>
                        <div className="text-[10px] text-muted-foreground">p. {bookmark.pageNumber}</div>
                      </button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => onRemoveBookmark(activeDocId, bookmark.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center text-muted-foreground">
                    <BookmarkPlus className="h-4 w-4" />
                </div>
              )}
            </div>
          )}
        </div>
      ) : activeDoc && !activeFile ? (
        <div className="flex-1 rounded-lg border border-dashed border-border bg-muted/20 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">PDF stored locally. Re-upload if missing.</p>
        </div>
      ) : (
        <div className="flex-1 rounded-lg border border-dashed border-border bg-muted/20 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Upload a PDF to get started</p>
        </div>
      )}
    </div>
  );
};
