import { z } from "zod";

export const createBingoFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  entries: z
    .array(z.string().min(1, "Entry cannot be empty"))
    .min(1, "At least one entry is required"),
  guildId: z.string().min(1, "Guild ID is required"),
});
export type CreateBingoForm = z.infer<typeof createBingoFormSchema>;
