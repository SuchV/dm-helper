"use client";

import * as React from "react";
import { format } from "date-fns";

import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
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
    { label: "-1m", amount: -1 * 60 * 1000 },
    { label: "+1m", amount: 1 * 60 * 1000 },
    { label: "+10m", amount: 10 * 60 * 1000 },
    { label: "+1h", amount: 1 * 60 * 60 * 1000 },
    { label: "+1d", amount: 24 * 60 * 60 * 1000 },
  ];

  const tabPanelClass = "mt-3 min-h-[200px]";

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle>Clock</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="view">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view">Game time</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
          </TabsList>

          <TabsContent value="view" className={tabPanelClass}>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-xs uppercase text-muted-foreground">
                  Game time
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-4xl font-mono font-bold">
                    {clockState.gameTime || DEFAULT_STATE.gameTime}
                  </div>
                  <div className="text-right text-base text-muted-foreground">
                    <div>{formatDateDisplay(clockState.gameDate)}</div>
                    <div>{clockState.weekDay || "Monday"}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {quickControls.map((control) => (
                  <Button
                    key={control.label}
                    size="sm"
                    variant="secondary"
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="game-time">Time (HH:mm:ss)</Label>
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
                  <Label htmlFor="game-date">Date</Label>
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
                <Label>Day of the week</Label>
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
                  onClick={() => onSave?.(clockState)}
                  disabled={(saving ?? false) || (loading ?? false)}
                >
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="h-px bg-border" />

        <div className="space-y-1">
          <div className="text-xs uppercase text-muted-foreground">
            Real time
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-mono font-semibold">
              {realTimeFormatted}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>{realDateFormatted}</div>
              <div>{realWeekdayFormatted}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};