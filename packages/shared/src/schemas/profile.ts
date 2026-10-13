import { z } from "zod";
import { DISTANCE_BUCKETS_KM, MIN_AGE, PROFILE_PROMPTS } from "../constants";

export const genderSchema = z.enum(["woman", "man", "nonbinary"]);
export type Gender = z.infer<typeof genderSchema>;

/** jojo is open to every intent; users declare theirs so matches can align. */
export const intentSchema = z.enum([
  "long_term",
  "short_term",
  "casual",
  "friends",
  "figuring_out",
]);
export type Intent = z.infer<typeof intentSchema>;

export const promptAnswerSchema = z.object({
  promptKey: z.string().min(1),
  answer: z.string().trim().min(1).max(200),
});

const birthdateSchema = z.iso.date().refine((value) => {
  const birth = new Date(value);
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - MIN_AGE);
  return birth <= cutoff;
}, `만 ${MIN_AGE}세 이상만 가입할 수 있어요.`);

export const profileInputSchema = z.object({
  displayName: z.string().trim().min(1).max(20),
  birthdate: birthdateSchema,
  gender: genderSchema,
  intent: intentSchema,
  bio: z.string().trim().max(500).optional(),
  job: z.string().trim().max(50).optional(),
  school: z.string().trim().max(50).optional(),
  heightCm: z.number().int().min(120).max(230).optional(),
  prompts: z.array(promptAnswerSchema).min(PROFILE_PROMPTS.min).max(PROFILE_PROMPTS.max),
});
export type ProfileInput = z.infer<typeof profileInputSchema>;

export const preferencesSchema = z
  .object({
    ageMin: z.number().int().min(MIN_AGE).max(99),
    ageMax: z.number().int().min(MIN_AGE).max(99),
    distanceKm: z.union(DISTANCE_BUCKETS_KM.map((km) => z.literal(km))),
    genders: z.array(genderSchema).min(1),
    intents: z.array(intentSchema).min(1),
    /** Bumble-style "I message first", opt-in per user rather than enforced. */
    iMessageFirst: z.boolean().default(false),
  })
  .refine((p) => p.ageMin <= p.ageMax, { path: ["ageMax"] });
export type Preferences = z.infer<typeof preferencesSchema>;
