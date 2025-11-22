"use client";

import * as React from "react";
import { api } from "~/trpc/react";

import type {
  GameClockWidgetState,
  NotesWidgetState,
  DiceRollerWidgetState,
  WidgetIdsByType,
  WidgetStateBundle,
} from "./widget-types";

const WidgetStateContext = React.createContext<{
  state: WidgetStateBundle;
  setGameClockState: (widgetId: string, next: GameClockWidgetState) => void;
  setNotesState: (widgetId: string, updater: (prev: NotesWidgetState) => NotesWidgetState) => void;
  setDiceRollerState: (
    widgetId: string,
    updater: (prev: DiceRollerWidgetState) => DiceRollerWidgetState,
  ) => void;
} | null>(null);

const useWidgetStateContext = () => {
  const context = React.useContext(WidgetStateContext);

  if (!context) {
    throw new Error("Widget state context is unavailable");
  }

  return context;
};

interface WidgetStateProviderProps {
  children: React.ReactNode;
  initialData: WidgetStateBundle;
  widgetIdsByType: WidgetIdsByType;
}

const WidgetStateProvider = ({
  children,
  initialData,
  widgetIdsByType,
}: WidgetStateProviderProps) => {
  const hasAnyWidgets = Object.values(widgetIdsByType).some((ids) => ids.length > 0);

  const queryInput = React.useMemo(() => ({ widgetIdsByType }), [widgetIdsByType]);

  const { data } = api.widgetState.bulk.useQuery(queryInput, {
    enabled: hasAnyWidgets,
    initialData,
    staleTime: 1000 * 30,
  });

  const [state, setState] = React.useState<WidgetStateBundle>(data ?? initialData);

  React.useEffect(() => {
    if (data) {
      setState(data);
    }
  }, [data]);

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

  const value = React.useMemo(
    () => ({
      state,
      setGameClockState,
      setNotesState,
      setDiceRollerState,
    }),
    [state, setGameClockState, setNotesState, setDiceRollerState],
  );

  return <WidgetStateContext.Provider value={value}>{children}</WidgetStateContext.Provider>;
};

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

export default WidgetStateProvider;
