"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "./input";
import { Label } from "./label";
import { cn } from ".";

const DICE_OPTIONS = [4, 6, 8, 10, 12, 20, 100] as const;

type DieSides = (typeof DICE_OPTIONS)[number];

interface DieInstance {
  id: string;
  sides: DieSides;
}

interface RollResult extends DieInstance {
  value: number;
}

export interface DiceRollLogEntry {
  id: string;
  total: number;
  modifier: number;
  results: { sides: number; value: number }[];
  createdAt: string;
}

export interface DiceRollerProps {
  className?: string;
  initialModifier?: number;
  logs?: DiceRollLogEntry[];
  onRoll?: (payload: {
    results: { sides: number; value: number }[];
    modifier: number;
    total: number;
  }) => void | Promise<void>;
  onClearLogs?: () => void | Promise<void>;
}

const createDieInstance = (sides: DieSides): DieInstance => ({
  id: `${sides}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`,
  sides,
});

const rollValue = (sides: DieSides) => Math.floor(Math.random() * sides) + 1;

export const DiceRoller: React.FC<DiceRollerProps> = ({
  className,
  initialModifier = 0,
  logs,
  onRoll,
  onClearLogs,
}) => {
  const [dicePool, setDicePool] = React.useState<DieInstance[]>([]);
  const [results, setResults] = React.useState<RollResult[]>([]);
  const [modifier, setModifier] = React.useState(initialModifier);
  const [modifierDraft, setModifierDraft] = React.useState(initialModifier.toString());
  const [modifierDialogOpen, setModifierDialogOpen] = React.useState(false);
  const [isRolling, setIsRolling] = React.useState(false);
  const [isClearing, setIsClearing] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);

  const hasResults = results.length > 0;
  const subtotal = results.reduce((sum, die) => sum + die.value, 0);
  const total = hasResults ? subtotal + modifier : undefined;
  const history = logs ?? [];

  React.useEffect(() => {
    if (!modifierDialogOpen) {
      setModifierDraft(modifier.toString());
    }
  }, [modifierDialogOpen, modifier]);

  React.useEffect(() => {
    // Drop any orphaned roll results if the corresponding die was removed from the pool.
    setResults((prev) => prev.filter((result) => dicePool.some((die) => die.id === result.id)));
  }, [dicePool]);

  const handleAddDie = (sides: DieSides) => {
    setDicePool((prev) => [...prev, createDieInstance(sides)]);
  };

  const handleRemoveDie = (id: string) => {
    setDicePool((prev) => prev.filter((die) => die.id !== id));
  };

  const handleRoll = async () => {
    if (!dicePool.length) return;
    const nextResults = dicePool.map((die) => ({
      ...die,
      value: rollValue(die.sides),
    }));
    setResults(nextResults);
    const totalWithModifier = nextResults.reduce((sum, die) => sum + die.value, 0) + modifier;
    if (onRoll) {
      setIsRolling(true);
      try {
        await onRoll({
          results: nextResults.map((die) => ({ sides: die.sides, value: die.value })),
          modifier,
          total: totalWithModifier,
        });
      } finally {
        setIsRolling(false);
      }
    }
  };

  const handleModifierApply = () => {
    const parsed = Number(modifierDraft);
    const next = Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
    setModifier(next);
    setModifierDialogOpen(false);
  };

  const handleClearLogs = async () => {
    if (!onClearLogs) return;
    setIsClearing(true);
    try {
      await onClearLogs();
    } finally {
      setIsClearing(false);
    }
  };

  const formatModifier = (value: number) => (value >= 0 ? `+${value}` : value);
  const formatResultsSummary = (entries: { sides: number; value: number }[]) =>
    entries.map((entry) => `d${entry.sides}→${entry.value}`).join(", ") || "No dice rolled";

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Dice Selection + Modifier */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Add dice to pool</p>
          <Dialog open={modifierDialogOpen} onOpenChange={setModifierDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0">
                Modifier: {modifier >= 0 ? `+${modifier}` : modifier}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adjust modifier</DialogTitle>
                <DialogDescription>
                  Set a positive or negative number to apply to your next total.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="dice-modifier">Modifier</Label>
                <Input
                  id="dice-modifier"
                  type="number"
                  inputMode="numeric"
                  value={modifierDraft}
                  onChange={(event) => setModifierDraft(event.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setModifierDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleModifierApply}>Apply</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DICE_OPTIONS.map((sides) => (
            <Button
              key={sides}
              variant="secondary"
              size="sm"
              className="min-w-[48px]"
              onClick={() => handleAddDie(sides)}
            >
              d{sides}
            </Button>
          ))}
        </div>
      </div>

      {/* Dice Pool */}
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Your pool</p>
        {dicePool.length ? (
          <div className="flex flex-wrap gap-1.5">
            {dicePool.map((die) => (
              <Button
                key={die.id}
                type="button"
                variant="ghost"
                size="sm"
                className="border border-border/60 bg-background font-semibold text-foreground"
                onClick={() => handleRemoveDie(die.id)}
                title="Click to remove"
              >
                d{die.sides}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Tap a die above to add it.</p>
        )}
      </div>

      {/* Roll Result + Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold">{typeof total === "number" ? total : "—"}</span>
            {modifier !== 0 && (
              <span className="text-xs text-muted-foreground">({formatModifier(modifier)})</span>
            )}
          </div>
        </div>
        <Button onClick={handleRoll} disabled={!dicePool.length || isRolling} size="sm">
          {isRolling ? "Rolling..." : "Roll"}
        </Button>
      </div>

      {/* Last Roll Results */}
      {hasResults && (
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Last roll breakdown</p>
          <div className="flex flex-wrap gap-1.5">
            {results.map((result) => (
              <div
                key={result.id}
                className="rounded-md border border-border/60 bg-background px-2 py-0.5 text-xs font-medium"
              >
                d{result.sides} → {result.value}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roll History (collapsible) */}
      {history.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            className="flex w-full items-center justify-between text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground"
            onClick={() => setHistoryOpen((prev) => !prev)}
          >
            <span>Roll history ({history.length})</span>
            {historyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {historyOpen && (
            <div className="space-y-2">
              {onClearLogs && (
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={handleClearLogs} disabled={isClearing}>
                    {isClearing ? "Clearing..." : "Clear all"}
                  </Button>
                </div>
              )}
              <div className="max-h-48 space-y-1.5 overflow-auto">
                {history.map((log, index) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-border/60 bg-background/80 p-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Roll {history.length - index}</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="mt-1 font-semibold">
                      Total: {log.total} ({formatModifier(log.modifier)})
                    </div>
                    <div className="text-muted-foreground">
                      {formatResultsSummary(log.results)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
