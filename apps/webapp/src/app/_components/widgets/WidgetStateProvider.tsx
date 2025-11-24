"use client";

import * as React from "react";
import { api } from "~/trpc/react";

import type {
  DiceRollerWidgetState,
  GameClockWidgetState,
  NotesWidgetState,
  PdfViewerWidgetState,
  WidgetIdsByType,
  WidgetStateBundle,
} from "./widget-types";
import { WidgetStateContext } from "./widget-state-context";

interface WidgetStateProviderProps {
  children: React.ReactNode;
  initialData: WidgetStateBundle;
  widgetIdsByType: WidgetIdsByType;
}

const WidgetStateProvider = ({ children, initialData, widgetIdsByType }: WidgetStateProviderProps) => {
  const hasAnyWidgets = React.useMemo(
    () => Object.values(widgetIdsByType).some((ids) => Array.isArray(ids) && ids.length > 0),
    [widgetIdsByType],
  );

  const queryInput = React.useMemo(() => ({ widgetIdsByType }), [widgetIdsByType]);

  const queryResult = api.widgetState.bulk.useQuery(queryInput, {
    enabled: hasAnyWidgets,
    initialData: hasAnyWidgets ? initialData : undefined,
    staleTime: 1000 * 30,
  });

  const queryData = hasAnyWidgets ? queryResult.data : undefined;
  const [state, setState] = React.useState<WidgetStateBundle>(initialData);

  React.useEffect(() => {
    if (!queryData) return;
    setState(queryData);
  }, [queryData]);

  const setGameClockState = React.useCallback((widgetId: string, next: GameClockWidgetState) => {
    setState((prev) => ({
      ...prev,
      "game-clock": {
        ...prev["game-clock"],
        [widgetId]: next,
      },
    }));
  }, []);

  const setNotesState = React.useCallback(
    (widgetId: string, updater: (prev: NotesWidgetState) => NotesWidgetState) => {
      setState((prev) => ({
        ...prev,
        notes: {
          ...prev.notes,
          [widgetId]: updater(prev.notes[widgetId] ?? { notes: [] }),
        },
      }));
    },
    [],
  );

  const setDiceRollerState = React.useCallback(
    (widgetId: string, updater: (prev: DiceRollerWidgetState) => DiceRollerWidgetState) => {
      setState((prev) => ({
        ...prev,
        "dice-roller": {
          ...prev["dice-roller"],
          [widgetId]: updater(prev["dice-roller"][widgetId] ?? { logs: [] }),
        },
      }));
    },
    [],
  );

  const setPdfViewerState = React.useCallback(
    (widgetId: string, updater: (prev: PdfViewerWidgetState) => PdfViewerWidgetState) => {
      setState((prev) => ({
        ...prev,
        "pdf-viewer": {
          ...prev["pdf-viewer"],
          [widgetId]: updater(prev["pdf-viewer"][widgetId] ?? { tabs: [], activeTabId: null }),
        },
      }));
    },
    [],
  );

  const value = React.useMemo(
    () => ({
      state,
      setGameClockState,
      setNotesState,
      setDiceRollerState,
      setPdfViewerState,
    }),
    [state, setGameClockState, setNotesState, setDiceRollerState, setPdfViewerState],
  );

  return <WidgetStateContext.Provider value={value}>{children}</WidgetStateContext.Provider>;
};

export default WidgetStateProvider;
