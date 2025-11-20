import { TRPCError } from "@trpc/server";

type SessionCtx = {
  session: {
    user?: {
      id?: string;
    };
  } | null;
};

export const getUserId = (ctx: SessionCtx) => {
  const userId = ctx.session?.user?.id;

  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return userId;
};
