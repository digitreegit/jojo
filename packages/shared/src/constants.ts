export const LOCALES = ["ko", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ko";

export const MIN_AGE = 19;

export const PROFILE_PHOTOS = { min: 3, max: 6 } as const;
export const PROFILE_PROMPTS = { min: 1, max: 3 } as const;

/** Candidates per day. Paid plans may add a fixed bonus but never change ranking. */
export const DAILY_QUEUE_SIZE = 15;

/** Users inactive longer than this are hidden from everyone's queue. */
export const INACTIVE_HIDE_DAYS = 14;

/** After this much silence in a match, both sides are nudged to reply or close politely. */
export const MATCH_NUDGE_HOURS = 72;

/** Human review deadline for appeals. */
export const APPEAL_SLA_HOURS = 72;

/** Stored locations are snapped to a grid of this size to prevent trilateration. */
export const LOCATION_GRID_KM = 1;

/** Distances are only ever shown as one of these buckets. */
export const DISTANCE_BUCKETS_KM = [1, 3, 5, 10, 25, 50, 100] as const;

export const RENEWAL_NOTICE_DAYS = 3;
