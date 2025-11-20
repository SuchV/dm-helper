"use client";

import * as React from "react";
import { api } from "~/trpc/react";

import type {
  GameClockWidgetState,
  WidgetIdsByType,
  WidgetStateBundle,
} from "./widget-types";

const WidgetStateContext = React.createContext<{
  state: WidgetStateBundle;
  setGameClockState: (widgetId: string, next: GameClockWidgetState) => void;
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
  const hasAnyWidgets = widgetIdsByType["game-clock"].length > 0;

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

  const value = React.useMemo(
    () => ({
      state,
      setGameClockState,
    }),
    [state, setGameClockState],
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

export default WidgetStateProvider;
