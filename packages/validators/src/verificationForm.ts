import { z } from "zod";

export const verificationFormSchema = z.object({
  messageContent: z
    .string()
    .min(1, "Message content is required")
    .max(2000, "Message content must be less than 2000 characters"),
  verificationChannel: z.string().min(1, "Verification channel is required"),
  verificationMessage: z
    .string()
    .min(1, "Verification message is required")
    .max(2000, "Verification message must be less than 2000 characters"),
  verificationRole: z.string().min(1, "Verification role is required"),
  roleGroups: z
    .array(z.object({ name: z.string().min(1, "Role group name is required") }))
    .min(1, "At least one role group is required"),
});

export type VerificationForm = z.infer<typeof verificationFormSchema>;
