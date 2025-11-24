import * as React from "react";

import type {
  DiceRollerWidgetState,
  GameClockWidgetState,
  NotesWidgetState,
  PdfViewerWidgetState,
} from "./widget-types";
import { useWidgetStateContext } from "./widget-state-context";

export const useGameClockWidgetState = (widgetId: string) => {
  const { state, setGameClockState } = useWidgetStateContext();
  const storedState = state["game-clock"][widgetId];

  const updateState = React.useCallback(
    (next: GameClockWidgetState) => {
      setGameClockState(widgetId, next);
    },
    [setGameClockState, widgetId],
  );

  return [storedState, updateState] as const;
};

export const useNotesWidgetState = (widgetId: string) => {
  const { state, setNotesState } = useWidgetStateContext();
  const storedState = state.notes[widgetId];

  const updateState = React.useCallback(
    (updater: (prev: NotesWidgetState) => NotesWidgetState) => {
      setNotesState(widgetId, updater);
    },
    [setNotesState, widgetId],
  );

  return [storedState, updateState] as const;
};

export const useDiceRollerWidgetState = (widgetId: string) => {
  const { state, setDiceRollerState } = useWidgetStateContext();
  const storedState = state["dice-roller"][widgetId];

  const updateState = React.useCallback(
    (updater: (prev: DiceRollerWidgetState) => DiceRollerWidgetState) => {
      setDiceRollerState(widgetId, updater);
    },
    [setDiceRollerState, widgetId],
  );

  return [storedState, updateState] as const;
};

export type PdfViewerWidgetStateHookResult = readonly [
  PdfViewerWidgetState | undefined,
  (updater: (prev: PdfViewerWidgetState) => PdfViewerWidgetState) => void,
];

export const usePdfViewerWidgetState = (
  widgetId: string,
): PdfViewerWidgetStateHookResult => {
  const { state, setPdfViewerState } = useWidgetStateContext();
  const storedState = state["pdf-viewer"][widgetId];

  const updateState = React.useCallback(
    (updater: (prev: PdfViewerWidgetState) => PdfViewerWidgetState) => {
      setPdfViewerState(widgetId, updater);
    },
    [setPdfViewerState, widgetId],
  );

  return [storedState, updateState] as const;
};
