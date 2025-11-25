/*
  Warnings:

  - Added the required column `widgetId` to the `GameClockState` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "WidgetInstance" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "collapsed" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WidgetInstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameNote" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "widgetId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled note',
    "content" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "pinnedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GameNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GameNote_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "WidgetInstance" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiceRollLog" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "widgetId" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "modifier" INTEGER NOT NULL,
    "results" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiceRollLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DiceRollLog_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "WidgetInstance" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PdfDocumentTab" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "widgetId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "pinnedAt" DATETIME,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastOpenedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPage" INTEGER NOT NULL DEFAULT 1,
    "totalPages" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PdfDocumentTab_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PdfDocumentTab_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "WidgetInstance" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PdfBookmark" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tabId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "note" TEXT,
    "chapterLabel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PdfBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PdfBookmark_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "PdfDocumentTab" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameClockState" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gameTime" TEXT NOT NULL DEFAULT '00:00:00',
    "gameDate" TEXT NOT NULL DEFAULT '0000-01-01',
    "weekDay" TEXT NOT NULL DEFAULT 'Monday',
    "updatedAt" DATETIME NOT NULL,
    "widgetId" TEXT NOT NULL,
    CONSTRAINT "GameClockState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GameClockState_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "WidgetInstance" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GameClockState" ("_id", "gameDate", "gameTime", "updatedAt", "userId", "weekDay") SELECT "_id", "gameDate", "gameTime", "updatedAt", "userId", "weekDay" FROM "GameClockState";
DROP TABLE "GameClockState";
ALTER TABLE "new_GameClockState" RENAME TO "GameClockState";
CREATE UNIQUE INDEX "GameClockState_widgetId_key" ON "GameClockState"("widgetId");
CREATE UNIQUE INDEX "GameClockState_userId_widgetId_key" ON "GameClockState"("userId", "widgetId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "GameNote_widgetId_idx" ON "GameNote"("widgetId");

-- CreateIndex
CREATE INDEX "GameNote_widgetId_pinned_pinnedAt_idx" ON "GameNote"("widgetId", "pinned", "pinnedAt");

-- CreateIndex
CREATE INDEX "DiceRollLog_widgetId_createdAt_idx" ON "DiceRollLog"("widgetId", "createdAt");

-- CreateIndex
CREATE INDEX "PdfDocumentTab_widgetId_pinned_isOpen_idx" ON "PdfDocumentTab"("widgetId", "pinned", "isOpen");

-- CreateIndex
CREATE INDEX "PdfDocumentTab_widgetId_isActive_idx" ON "PdfDocumentTab"("widgetId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PdfDocumentTab_userId_storageKey_key" ON "PdfDocumentTab"("userId", "storageKey");

-- CreateIndex
CREATE INDEX "PdfBookmark_tabId_idx" ON "PdfBookmark"("tabId");
