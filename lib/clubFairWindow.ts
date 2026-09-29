export type ClubFairWindowStatus = "open" | "upcoming" | "closed";

export interface ClubFairWindow {
  enabled: boolean;
  startAt: string; // ISO date string or ""
  endAt: string; // ISO date string or ""
  updatedAt: string;
}

export const CLUB_FAIR_WINDOW_KEY = "club-fair:window";

export const defaultClubFairWindow: ClubFairWindow = {
  enabled: false,
  startAt: "",
  endAt: "",
  updatedAt: "",
};

export const CLUB_FAIR_CLOSED_MESSAGE =
  "This form will be available again for the next semester's Club Fair. Until then, please wait and take care. All the best!";

function toIsoOrEmpty(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";

  const time = Date.parse(value);

  return Number.isNaN(time) ? "" : new Date(time).toISOString();
}

export function normalizeClubFairWindow(input: unknown): ClubFairWindow {
  if (!input || typeof input !== "object") {
    return { ...defaultClubFairWindow };
  }

  const data = input as Partial<ClubFairWindow>;

  return {
    enabled: data.enabled === true,
    startAt: toIsoOrEmpty(data.startAt),
    endAt: toIsoOrEmpty(data.endAt),
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : "",
  };
}

/**
 * - Schedule disabled  -> always "open"
 * - Before start time  -> "upcoming"
 * - After end time     -> "closed"
 * - Otherwise          -> "open"
 */
export function getClubFairWindowStatus(
  window: ClubFairWindow,
  now: number = Date.now(),
): ClubFairWindowStatus {
  if (!window.enabled) return "open";

  const start = window.startAt ? Date.parse(window.startAt) : NaN;
  const end = window.endAt ? Date.parse(window.endAt) : NaN;

  if (!Number.isNaN(start) && now < start) return "upcoming";
  if (!Number.isNaN(end) && now > end) return "closed";

  return "open";
}