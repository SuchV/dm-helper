import type { DestinationStream, Logger, LoggerOptions } from "pino";
import pino from "pino";

import { env } from "@spolka-z-l-o/env/next-env";

function createLogger<
  CustomLevels extends string = never,
  UseOnlyCustomLevels extends boolean = boolean,
>(
  options?: LoggerOptions<CustomLevels, UseOnlyCustomLevels>,
  stream?: DestinationStream,
): Logger<CustomLevels, UseOnlyCustomLevels> {
  const commonOptions: LoggerOptions<CustomLevels, UseOnlyCustomLevels> = {
    transport:
      env.NODE_ENV === "development"
        ? {
            target: "pino-pretty",
          }
        : undefined,
  };

  if (options === undefined) {
    return pino(commonOptions);
  }

  return pino({ ...commonOptions, ...options }, stream);
}

export type { Logger };

export { createLogger };
