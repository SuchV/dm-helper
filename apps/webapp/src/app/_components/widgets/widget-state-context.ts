import * as React from "react";

import type {
  DiceRollerWidgetState,
  GameClockWidgetState,
  NotesWidgetState,
  PdfViewerWidgetState,
  WidgetStateBundle,
} from "./widget-types";

export interface WidgetStateContextValue {
  state: WidgetStateBundle;
  setGameClockState: (widgetId: string, next: GameClockWidgetState) => void;
  setNotesState: (
    widgetId: string,
    updater: (prev: NotesWidgetState) => NotesWidgetState,
  ) => void;
  setDiceRollerState: (
    widgetId: string,
    updater: (prev: DiceRollerWidgetState) => DiceRollerWidgetState,
  ) => void;
  setPdfViewerState: (
    widgetId: string,
    updater: (prev: PdfViewerWidgetState) => PdfViewerWidgetState,
  ) => void;
}

export const WidgetStateContext = React.createContext<WidgetStateContextValue | null>(null);

export const useWidgetStateContext = () => {
  const context = React.useContext(WidgetStateContext);

  if (!context) {
    throw new Error("Widget state context is unavailable");
  }

  return context;
};
