"use client";

import * as React from "react";
import { GameClock, type GameClockState } from "@repo/ui/game-clock";
import { api } from "~/trpc/react";

const DEFAULT_STATE: GameClockState = {
  gameTime: "00:00:00",
  gameDate: "0000-01-01",
  weekDay: "Monday",
};

interface GameClockPanelProps {
  widgetId: string;
}

const GameClockPanel = ({ widgetId }: GameClockPanelProps) => {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const utils = api.useUtils();
  const queryInput = React.useMemo(() => ({ widgetId }), [widgetId]);
  const { data, isLoading } = api.gameClock.getState.useQuery(queryInput, {
    staleTime: 1000 * 30,
  });

  const saveMutation = api.gameClock.saveState.useMutation({
    onSuccess: (saved) => {
      utils.gameClock.getState.setData(queryInput, saved);
    },
  });

  const [state, setState] = React.useState<GameClockState>(DEFAULT_STATE);

  React.useEffect(() => {
    if (data) {
      setState(data);
    }
  }, [data]);

  const handlePersist = (next: GameClockState) => {
    setState(next);
    saveMutation.mutate({ ...next, widgetId });
  };

  if (!hasMounted) {
    // Optional: return a skeleton or nothing to avoid SSR/CSR mismatch
    return null;
  }

  return (
    <GameClock
      initialState={state}
      loading={isLoading}
      saving={saveMutation.isPending}
      onQuickAdjust={handlePersist}
      onSave={handlePersist}
    />
  );
};

export default GameClockPanel;