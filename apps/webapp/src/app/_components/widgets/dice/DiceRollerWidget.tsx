"use client";

import { DiceRoller } from "@repo/ui/dice-roller";
import { toast } from "@repo/ui/toast";

import { api } from "~/trpc/react";
import { useDiceRollerWidgetState } from "../useWidgetStateHooks";

interface DiceRollerWidgetProps {
  widgetId: string;
}

const DiceRollerWidget = ({ widgetId }: DiceRollerWidgetProps) => {
  const [storedState, updateState] = useDiceRollerWidgetState(widgetId);
  const safeState = storedState ?? { logs: [] };

  const logRollMutation = api.diceRoller.logRoll.useMutation({
    onError: (error) => {
      console.error(error);
      toast.error(error.message ?? "Failed to save roll");
    },
  });

  const clearLogsMutation = api.diceRoller.clearLogs.useMutation({
    onSuccess: () => {
      updateState(() => ({ logs: [] }));
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message ?? "Failed to clear logs");
    },
  });

  const handleRoll = async (payload: {
    results: { sides: number; value: number }[];
    modifier: number;
    total: number;
  }) => {
    try {
      const saved = await logRollMutation.mutateAsync({
        widgetId,
        modifier: payload.modifier,
        total: payload.total,
        results: payload.results,
      });

      updateState((prev) => ({
        logs: [...prev.logs, saved],
      }));
    } catch {
      // Already handled via onError toast
    }
  };

  const handleClearLogs = async () => {
    if (!safeState.logs.length) return;
    try {
      await clearLogsMutation.mutateAsync({ widgetId });
    } catch {
      // Error surfaced via toast handler
    }
  };

  return (
    <DiceRoller
      logs={safeState.logs}
      onRoll={handleRoll}
      onClearLogs={safeState.logs.length ? handleClearLogs : undefined}
    />
  );
};

export default DiceRollerWidget;
