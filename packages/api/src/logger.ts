import type { Attributes } from "@opentelemetry/api";
import { SpanKind, trace } from "@opentelemetry/api";
import { initTRPC } from "@trpc/server";

import type { AuthUser } from "@spolka-z-l-o/auth";
import { createLogger } from "@spolka-z-l-o/logger";

const headersToLowercase = (headers: Headers) => {
  const headersRecord: Record<string, string> = {};

  for (const [key, value] of headers.entries()) {
    headersRecord[key.toLowerCase()] = value;
  }

  return headersRecord;
};

const flattenObject = (obj: object): Attributes => {
  /* eslint-disable */
  const result: Attributes = {};

  const recurse = (current: object, path = "") => {
    if (typeof current !== "object" || current === null) {
      result[path] = current;
      return;
    }

    for (const key of Object.keys(current)) {
      const newPath = path ? `${path}.${key}` : key;

      if (
        typeof (current as any)[key] === "object" &&
        (current as any)[key] !== null
      ) {
        recurse((current as any)[key], newPath);
      } else {
        (result as any)[newPath] = (current as any)[key];
      }
    }

    /* eslint-enable */
  };

  recurse(obj);
  return result;
};

export const createLoggerPlugin = () => {
  const t = initTRPC
    .context<{
      headers?: Headers;
      source: string;
      user?: AuthUser | null;
      logLevel: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
    }>()
    .create();

  const tRPCLogger = createLogger({
    redact: [
      "headers.authorization",
      'headers["proxy-authorization"]',
      'headers["x-auth-token"]',
      "headers.cookie",
      'headers["set-cookie"]',
      'headers["x-api-key"]',
      'headers["x-authorization"]',
    ],
    name: "tRPC",
  });

  return {
    logger: t.procedure.use(async (opts) => {
      const startTime = performance.now();
      const requestId = crypto.randomUUID();

      const logger = tRPCLogger.child({
        path: opts.path,
        type: opts.type,
        meta: opts.meta,
        user: opts.ctx.user?.id ?? "anon",
        requestId,
      });

      logger.level = opts.ctx.logLevel;

      const tracer = trace.getTracer("tRPC");

      const span = tracer.startSpan(`trpc-request-${opts.path}`, {
        startTime,
        kind: SpanKind.INTERNAL,
        attributes: flattenObject({
          user: opts.ctx.user?.id ?? "anon",
          trpc: {
            meta: opts.meta,
            type: opts.type,
            path: opts.path,
            requestId,
          },
        }),
      });

      try {
        const lowercaseHeaders = opts.ctx.headers
          ? headersToLowercase(opts.ctx.headers)
          : {};

        const loggerWithHeaders = logger.child({ headers: lowercaseHeaders });

        console.log("\n\r");
        console.log("\n\r");
        console.log("\n\r");
        console.log({ loggerWithHeaders });
        console.log("\n\r");
        console.log("\n\r");
        console.log("\n\r");

        //logger.info(">>> tRPC incoming request");

        //logger.debug({ input: opts.input }, ">>> tRPC incoming request input");

        loggerWithHeaders.trace(">>> tRPC incoming request headers");

        const response = await opts.next({
          ctx: {
            logger,
          },
        });

        if (response.ok) {
          //logger.info("<<< tRPC response");
          logger.debug({ data: response.data }, "<<< tRPC response data");
        } else {
          logger.error(response.error, "<<< tRPC response");
        }

        return response;
      } catch (e) {
        logger.error(e);
        throw e;
      } finally {
        span.end(performance.now());
      }
    }),
  };
};
