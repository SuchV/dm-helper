import type { HTMLAttributes, ReactNode } from "react";
import type { Options } from "timescape";
import type { DateType } from "timescape/react";
import * as React from "react";
import { createContext, forwardRef, useContext } from "react";
import { cva } from "class-variance-authority";
import { useTimescape } from "timescape/react";

import { cn } from ".";

export type TimePickerProps = HTMLAttributes<HTMLDivElement> & {
  value?: Date;
  onChange: (date?: Date) => void;
  children: ReactNode;
  options?: Omit<Options, "date" | "onChangeDate">;
};
type TimePickerContextValue = ReturnType<typeof useTimescape>;
const TimePickerContext = createContext<TimePickerContextValue | null>(null);

const useTimepickerContext = (): TimePickerContextValue => {
  const context = useContext(TimePickerContext);
  if (!context) {
    throw new Error(
      "Unable to access TimePickerContext. This component should be wrapped by a TimePicker component",
    );
  }
  return context;
};

const TimePicker = forwardRef<React.ElementRef<"div">, TimePickerProps>(
  ({ value, onChange, options, className, ...props }, _ref) => {
    const timePickerContext = useTimescape({
      date: value,
      onChangeDate: onChange,
      ...options,
    });
    return (
      <TimePickerContext.Provider value={timePickerContext}>
        <div
          {...(timePickerContext.getRootProps() as HTMLAttributes<HTMLDivElement>)}
          {...props}
          className={cn(
            "flex h-10 w-fit items-center gap-[1px] rounded-md border border-input bg-background px-3 py-1 text-sm",
            "ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        ></div>
      </TimePickerContext.Provider>
    );
  },
);
TimePicker.displayName = "TimePicker";

type TimePickerSegmentProps = Omit<
  HTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> & {
  segment: DateType;
  inputClassName?: string;
};

const timePickerSegemntVariants = cva(
  "box-content border-transparent bg-transparent font-[inherit] text-[length:inherit] tabular-nums leading-[inherit] caret-transparent outline-none ring-0 ring-offset-0 focus-visible:border-transparent focus-visible:ring-0",
  {
    variants: {
      segment: {
        years: "max-w-9",
        months: "max-w-6",
        days: "max-w-6",
        hours: "max-w-6",
        minutes: "max-w-6",
        seconds: "max-w-6",
        "am/pm": "max-w-6",
      },
    },
  },
);

const TimePickerSegment = forwardRef<
  React.ElementRef<"input">,
  TimePickerSegmentProps
>(({ segment, inputClassName, className: _, ...props }, ref) => {
  const { getInputProps } = useTimepickerContext();
  const { ref: timePickerInputRef, ...inputProps } = getInputProps(segment);
  let placeholder = "";
  switch (segment) {
    case "years":
      placeholder = "YYYY";
      break;
    case "months":
      placeholder = "MM";
      break;
    case "days":
      placeholder = "DD";
      break;
    case "hours":
      placeholder = "HH";
      break;
    case "minutes":
      placeholder = "MM";
      break;
    case "seconds":
      placeholder = "SS";
      break;
    case "am/pm":
      placeholder = "PM";
      break;
    default:
      break;
  }

  return (
    <div
      className={cn(
        "rounded-md px-2 py-1 text-accent-foreground focus-within:bg-accent",
      )}
    >
      <input
        ref={(node) => {
          if (typeof ref === "function") {
            ref(node);
          } else {
            if (ref) ref.current = node;
          }
          timePickerInputRef(node);
        }}
        className={cn(timePickerSegemntVariants({ segment }), inputClassName)}
        placeholder={placeholder}
        {...inputProps}
        {...props}
      />
    </div>
  );
});
TimePickerSegment.displayName = "TimePickerSegment";

type TimePickerSeparatorProps = HTMLAttributes<HTMLSpanElement>;
const TimePickerSeparator = forwardRef<
  React.ElementRef<"span">,
  TimePickerSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <span ref={ref} {...props} className={cn("py-1 text-sm", className)}></span>
  );
});
TimePickerSeparator.displayName = "TimePickerSeparator";

export { TimePicker, TimePickerSegment, TimePickerSeparator };
