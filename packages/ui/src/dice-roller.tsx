"use client";

import * as React from "react";

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
import {
  WidgetBody,
  WidgetDescription,
  WidgetHeader,
  WidgetSurface,
  WidgetTitle,
} from "./widget-chrome";
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
    <WidgetSurface className={cn("w-full max-w-xl", className)}>
      <WidgetHeader>
        <div>
          <WidgetTitle>Dice thrower</WidgetTitle>
          <WidgetDescription>Pick dice, build a pool, add modifiers, and roll.</WidgetDescription>
        </div>
      </WidgetHeader>
      <WidgetBody className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Dice selection</p>
            <Dialog open={modifierDialogOpen} onOpenChange={setModifierDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0">
                  +/- ({modifier >= 0 ? `+${modifier}` : modifier})
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
          <div className="flex flex-wrap gap-2">
            {DICE_OPTIONS.map((sides) => (
              <Button
                key={sides}
                variant="secondary"
                size="sm"
                onClick={() => handleAddDie(sides)}
              >
                d{sides}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Dice pool</p>
          {dicePool.length ? (
            <div className="flex flex-wrap gap-2">
              {dicePool.map((die) => (
                <Button
                  key={die.id}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="border border-border/60 bg-background font-semibold text-foreground"
                  onClick={() => handleRemoveDie(die.id)}
                >
                  d{die.sides}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Click a die above to add it to your pool.</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/30 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Roll total</p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-mono font-bold">{typeof total === "number" ? total : "—"}</span>
              <span className="text-sm text-muted-foreground">
                Modifier {formatModifier(modifier)}
              </span>
            </div>
          </div>
          <Button onClick={handleRoll} disabled={!dicePool.length || isRolling}>
            {isRolling ? "Rolling..." : "Roll"}
          </Button>
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Last roll</p>
          {hasResults ? (
            <div className="flex flex-wrap gap-2">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="rounded-lg border border-border/60 bg-background px-3 py-1 text-sm font-medium"
                >
                  d{result.sides} → {result.value}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Roll the pool to see individual results.</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Roll history</p>
            {onClearLogs && history.length ? (
              <Button variant="ghost" size="sm" onClick={handleClearLogs} disabled={isClearing}>
                {isClearing ? "Clearing..." : "Clear logs"}
              </Button>
            ) : null}
          </div>
          {history.length ? (
            <div className="space-y-2">
              {history.map((log, index) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-border/60 bg-background/80 p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <span>Roll {index + 1}</span>
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 text-sm font-semibold">
                    Total {log.total} (modifier {formatModifier(log.modifier)})
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatResultsSummary(log.results)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Logged rolls will appear here.</p>
          )}
        </div>
      </WidgetBody>
    </WidgetSurface>
  );
};
