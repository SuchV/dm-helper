"use client";

import * as React from "react";
import { GameClock, type GameClockState } from "@repo/ui/game-clock";
import { toast } from "@repo/ui/toast";

import { api } from "~/trpc/react";
import { useGameClockWidgetState } from "~/app/_components/widgets/useWidgetStateHooks";

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
  const [storedState, setStoredState] = useGameClockWidgetState(widgetId);
  const [state, setState] = React.useState<GameClockState>(storedState ?? DEFAULT_STATE);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const saveMutation = api.gameClock.saveState.useMutation({
    onSuccess: (saved) => {
      setStoredState(saved);
      setState(saved);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to save game clock state");
    },
  });

  React.useEffect(() => {
    setState(storedState ?? DEFAULT_STATE);
  }, [storedState?.gameTime, storedState?.gameDate, storedState?.weekDay, storedState]);

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
      loading={false}
      saving={saveMutation.isPending}
      onQuickAdjust={handlePersist}
      onSave={handlePersist}
    />
  );
};

export default GameClockPanel;