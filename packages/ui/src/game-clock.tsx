"use client";

import * as React from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { cn } from ".";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type Weekday = (typeof WEEKDAYS)[number];

const JS_DAY_TO_WEEKDAY: Weekday[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export interface GameClockState {
  gameTime: string;
  gameDate: string;
  weekDay: string;
}

const DEFAULT_STATE: GameClockState = {
  gameTime: "00:00:00",
  gameDate: "0000-01-01",
  weekDay: "Monday",
};

interface GameClockProps {
  className?: string;
  initialState?: GameClockState;
  loading?: boolean;
  saving?: boolean;
  onQuickAdjust?: (state: GameClockState) => void;
  onSave?: (state: GameClockState) => void;
}

const formatDateDisplay = (value: string) => {
  if (!value) return "00/00/0000";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "00/00/0000";
  return format(parsed, "dd/MM/yyyy");
};

export const GameClock: React.FC<GameClockProps> = ({
  className,
  initialState,
  loading,
  saving,
  onQuickAdjust,
  onSave,
}) => {
  const [now, setNow] = React.useState<Date>(new Date());
  const [clockState, setClockState] = React.useState<GameClockState>(
    initialState ?? DEFAULT_STATE,
  );
  const [realTimeVisible, setRealTimeVisible] = React.useState(false);

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (!initialState) return;
    setClockState(initialState);
  }, [initialState]);

  const parseGameDateTime = React.useCallback(() => {
    const datePart = clockState.gameDate || DEFAULT_STATE.gameDate;
    const timePart = clockState.gameTime || DEFAULT_STATE.gameTime;
    const date = new Date(`${datePart}T${timePart}`);
    if (Number.isNaN(date.getTime())) {
      return new Date();
    }
    return date;
  }, [clockState.gameDate, clockState.gameTime]);

  const applyDateTime = React.useCallback((date: Date): GameClockState => {
    return {
      gameDate: format(date, "yyyy-MM-dd"),
      gameTime: format(date, "HH:mm:ss"),
      weekDay: JS_DAY_TO_WEEKDAY[date.getDay()] ?? "Monday",
    };
  }, []);

  const handleQuickAdjust = (amount: number) => {
    if (loading) return;
    const target = new Date(parseGameDateTime().getTime() + amount);
    const updated = applyDateTime(target);
    setClockState(updated);
    onQuickAdjust?.(updated);
  };

  const realTimeFormatted = format(now, "HH:mm:ss");
  const realDateFormatted = format(now, "dd/MM/yyyy");
  const realWeekdayFormatted = format(now, "EEEE");

  const quickControls = [
    { label: "-1h", amount: -1 * 60 * 60 * 1000 },
    { label: "-10m", amount: -10 * 60 * 1000 },
    { label: "+10m", amount: 10 * 60 * 1000 },
    { label: "+1h", amount: 1 * 60 * 60 * 1000 },
    { label: "+1d", amount: 24 * 60 * 60 * 1000 },
  ];

  const tabPanelClass = "mt-3";

  return (
    <div className={cn("w-full space-y-4", className)}>
      <Tabs defaultValue="view">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">Game Time</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className={tabPanelClass}>
          <div className="space-y-3">
            {/* Game Time Display */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">In-game</div>
              <div className="flex flex-wrap items-baseline gap-3 sm:justify-between">
                <div className="text-3xl font-mono font-bold">
                  {clockState.gameTime || DEFAULT_STATE.gameTime}
                </div>
                <div className="w-full text-left text-sm text-muted-foreground sm:w-auto sm:text-right">
                  <div>{formatDateDisplay(clockState.gameDate)}</div>
                  <div>{clockState.weekDay || "Monday"}</div>
                </div>
              </div>
            </div>

            {/* Quick Adjust */}
            <div className="flex flex-wrap gap-1.5">
              {quickControls.map((control) => (
                <Button
                  key={control.label}
                  size="sm"
                  variant="secondary"
                  className="min-w-[48px]"
                  disabled={(loading ?? false) || (saving ?? false)}
                  onClick={() => handleQuickAdjust(control.amount)}
                >
                  {control.label}
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edit" className={tabPanelClass}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="game-time" className="text-xs">Time</Label>
                <Input
                  id="game-time"
                  type="text"
                  placeholder="00:00:00"
                  value={clockState.gameTime}
                  onChange={(e) =>
                    setClockState((prev) => ({
                      ...prev,
                      gameTime: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="game-date" className="text-xs">Date</Label>
                <Input
                  id="game-date"
                  type="date"
                  value={clockState.gameDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setClockState((prev) => {
                      const parsed = new Date(
                        `${value}T${prev.gameTime || DEFAULT_STATE.gameTime}`,
                      );
                      const nextWeekday = Number.isNaN(parsed.getTime())
                        ? prev.weekDay
                        : JS_DAY_TO_WEEKDAY[parsed.getDay()] ?? prev.weekDay;
                      return {
                        ...prev,
                        gameDate: value,
                        weekDay: nextWeekday,
                      };
                    });
                  }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Day of week</Label>
              <Select
                value={clockState.weekDay}
                onValueChange={(value) =>
                  setClockState((prev) => ({
                    ...prev,
                    weekDay: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => onSave?.(clockState)}
                disabled={(saving ?? false) || (loading ?? false)}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Real Time (collapsible) */}
      <div className="space-y-1">
        <button
          type="button"
          className="flex w-full items-center justify-between text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground"
          onClick={() => setRealTimeVisible((prev) => !prev)}
        >
          <span>Real time</span>
          {realTimeVisible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {realTimeVisible && (
          <div className="flex items-baseline justify-between rounded-lg border border-border/40 bg-muted/20 p-2 text-sm">
            <span className="font-mono font-medium">{realTimeFormatted}</span>
            <span className="text-xs text-muted-foreground">
              {realDateFormatted} · {realWeekdayFormatted}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};