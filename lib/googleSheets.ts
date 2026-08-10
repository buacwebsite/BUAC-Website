import axios from "axios";
import { getCurrentSemester } from "./semester";

const SHEET_ENDPOINT = process.env.GOOGLE_SHEET_WEBAPP_URL || "";
const SHEET_SECRET = process.env.GOOGLE_SHEET_SECRET || "";

export type SheetFormType =
  | "member-registration"
  | "alumni-registration"
  | "club-fair";

export interface SheetPayload {
  formType: SheetFormType;
  [key: string]: unknown;
}

/**
 * Push a row to the Google Sheet web app.
 * The Apps Script decides the tab based on formType + semester + year.
 * Failures never break the main request.
 */
export async function pushToGoogleSheet(
  payload: SheetPayload,
): Promise<{ ok: boolean; error?: string }> {
  if (!SHEET_ENDPOINT) {
    console.warn(
      "GOOGLE_SHEET_WEBAPP_URL is not set. Skipping sheet sync.",
    );
    return { ok: false, error: "missing endpoint" };
  }

  const semesterInfo = getCurrentSemester();

  const body = {
    ...payload,
    secret: SHEET_SECRET,
    semester: semesterInfo.semester,
    year: semesterInfo.year,
    semesterLabel: semesterInfo.label,
    submittedAt: new Date().toISOString(),
  };

  try {
    await axios.post(SHEET_ENDPOINT, body, {
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return { ok: true };
  } catch (error) {
    console.error("Google Sheet push failed:", error);

    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "unknown error",
    };
  }
}

/**
 * Read the total club fair registration count from the sheet.
 * Returns null if unavailable so callers can fall back to KV.
 */
export async function readClubFairCount(): Promise<number | null> {
  if (!SHEET_ENDPOINT) {
    return null;
  }

  try {
    const response = await axios.get(SHEET_ENDPOINT, {
      timeout: 10000,
      params: {
        action: "club-fair-count",
        secret: SHEET_SECRET,
      },
    });

    const total = Number(response.data?.total);

    return Number.isFinite(total) ? total : null;
  } catch (error) {
    console.error("Google Sheet count read failed:", error);
    return null;
  }
}