import { z } from "zod";

export const reportReasonSchema = z.enum([
  "fake_profile",
  "scam_or_money",
  "external_contact_push",
  "harassment",
  "sexual_content",
  "underage",
  "hate_speech",
  "offline_safety",
  "other",
]);
export type ReportReason = z.infer<typeof reportReasonSchema>;

export const reportInputSchema = z.object({
  targetUserId: z.uuid(),
  reason: reportReasonSchema,
  messageId: z.uuid().optional(),
  photoId: z.uuid().optional(),
  note: z.string().trim().max(1000).optional(),
});
export type ReportInput = z.infer<typeof reportInputSchema>;

/** Escalation ladder. Every step must carry a concrete, user-visible reason. */
export const strikeLevelSchema = z.enum(["warning", "limited", "suspended", "banned"]);
export type StrikeLevel = z.infer<typeof strikeLevelSchema>;

export const appealInputSchema = z.object({
  actionId: z.uuid(),
  message: z.string().trim().min(10).max(2000),
});
export type AppealInput = z.infer<typeof appealInputSchema>;
