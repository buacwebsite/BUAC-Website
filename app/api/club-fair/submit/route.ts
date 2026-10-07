import {
  createHash,
  randomUUID,
} from "node:crypto";
import { NextResponse } from "next/server";
import axios from "axios";

import { kv } from "@/lib/kv";
import {
  buildClubFairThankYouEmail,
  sendMail,
} from "@/lib/email";
import {
  CLUB_FAIR_CLOSED_MESSAGE,
  CLUB_FAIR_WINDOW_KEY,
  getClubFairWindowStatus,
  normalizeClubFairWindow,
  type ClubFairWindow,
} from "@/lib/clubFairWindow";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

type SemesterName =
  | "Spring"
  | "Summer"
  | "Fall";

interface SemesterSettings {
  semester: SemesterName;
  year: string;
  label: string;
  updatedAt: string;
}

interface ClubFairSubmission {
  Name?: string;
  StudentID?: string;
  Address?: string;
  Gender?: string;
  Religion?: string;
  Contact?: string;
  Facebook?: string;
  Department?: string;
  Semester?: string;
  BloodGroup?: string;
  BloodDonation?: string;
  Email?: string;
}

interface ClubFairRecord {
  id: string;
  formType: "club-fair";

  semester: SemesterName;
  year: string;
  semesterLabel: string;
  submittedAt: string;

  name: string;
  email: string;
  studentId: string;
  address: string;
  gender: string;
  religion: string;
  contact: string;
  facebook: string;
  department: string;
  studentSemester: string;
  bloodGroup: string;
  bloodDonation: string;

  /*
   * These properties are optional so records created by
   * the old API remain compatible.
   */
  emailSent?: boolean;
  emailSentAt?: string;
  emailMessageId?: string;
  emailLastAttemptAt?: string;
  emailLastError?: string;
}

interface DuplicateResult {
  exactRecord: ClubFairRecord | null;
  emailRecord: ClubFairRecord | null;
  studentRecord: ClubFairRecord | null;
}

interface EmailDeliveryResult {
  success: boolean;
  processing?: boolean;
  record: ClubFairRecord;
  error?: string;
}

const GOOGLE_SCRIPT_URL =
  process.env.GOOGLE_SCRIPT_URL || "";

/* ============================================================
   NORMALIZATION
============================================================ */

function clean(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeEmail(value: unknown) {
  return clean(value).toLowerCase();
}

function normalizeStudentId(value: unknown) {
  return clean(value)
    .replace(/\s+/g, "")
    .toUpperCase();
}

function normalizeFacebookUrl(value: string) {
  const input = clean(value);

  if (!input) return "";

  const valueWithProtocol =
    /^https?:\/\//i.test(input)
      ? input
      : `https://${input}`;

  try {
    const parsedUrl = new URL(
      valueWithProtocol,
    );

    const hostname = parsedUrl.hostname
      .toLowerCase()
      .replace(/^www\./, "");

    const validHostname =
      hostname === "facebook.com" ||
      hostname === "m.facebook.com" ||
      hostname === "fb.com" ||
      hostname.endsWith(".facebook.com");

    if (!validHostname) {
      return "";
    }

    return parsedUrl.toString();
  } catch {
    return "";
  }
}

/* ============================================================
   SEMESTER SETTINGS
============================================================ */

function getDefaultSemesterSettings(): SemesterSettings {
  const now = new Date();
  const month = now.getMonth();
  const year = String(now.getFullYear());

  let semester: SemesterName = "Spring";

  if (month >= 4 && month <= 7) {
    semester = "Summer";
  } else if (month >= 8) {
    semester = "Fall";
  }

  return {
    semester,
    year,
    label: `${semester} ${year}`,
    updatedAt: now.toISOString(),
  };
}

async function getActiveSemesterSettings() {
  const saved =
    await kv.get<SemesterSettings>(
      "semester:settings",
    );

  return saved || getDefaultSemesterSettings();
}

/* ============================================================
   REDIS KEYS
============================================================ */

function databaseIndexKey(
  semester: SemesterName,
  year: string,
) {
  return `club-fair:database:index:${year}:${semester}`;
}

function databaseRecordKey(
  semester: SemesterName,
  year: string,
  submissionId: string,
) {
  return `club-fair:database:${year}:${semester}:${submissionId}`;
}

function semesterCountKey(
  semester: SemesterName,
  year: string,
) {
  return `club-fair:count:${semester}:${year}`;
}

function hashIdentifier(value: string) {
  return createHash("sha256")
    .update(value)
    .digest("hex");
}

function submissionLockKey(
  type: "email" | "student",
  semester: SemesterName,
  year: string,
  value: string,
) {
  return (
    `club-fair:submission-lock:` +
    `${year}:${semester}:${type}:` +
    hashIdentifier(value)
  );
}

function emailRetryLockKey(
  submissionId: string,
) {
  return `club-fair:email-retry-lock:${submissionId}`;
}

/* ============================================================
   TEMPORARY LOCKS
============================================================ */

async function acquireLock(
  key: string,
  owner: string,
) {
  const result = await kv.set(
    key,
    owner,
    {
      nx: true,
      ex: 180,
    },
  );

  return Boolean(result);
}

async function releaseLock(
  key: string,
  owner: string,
) {
  try {
    const currentOwner =
      await kv.get<string>(key);

    if (currentOwner === owner) {
      await kv.del(key);
    }
  } catch (error) {
    console.error(
      "Failed to release Club Fair lock:",
      error,
    );
  }
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/* ============================================================
   STORED RECORDS
============================================================ */

async function getSemesterRecords(
  settings: SemesterSettings,
) {
  const index =
    (await kv.get<string[]>(
      databaseIndexKey(
        settings.semester,
        settings.year,
      ),
    )) || [];

  const records = await Promise.all(
    index.map(async (submissionId) => {
      return kv.get<ClubFairRecord>(
        databaseRecordKey(
          settings.semester,
          settings.year,
          submissionId,
        ),
      );
    }),
  );

  return {
    index,

    records: records.filter(
      (
        record,
      ): record is ClubFairRecord =>
        Boolean(record),
    ),
  };
}

function findDuplicate(
  records: ClubFairRecord[],
  email: string,
  studentId: string,
): DuplicateResult {
  /*
   * Check for an exact match first. This is important when
   * old data contains more than one record with similar fields.
   */
  const exactRecord =
    records.find((record) => {
      return (
        normalizeEmail(record.email) ===
          email &&
        normalizeStudentId(
          record.studentId,
        ) === studentId
      );
    }) || null;

  const emailRecord =
    exactRecord ||
    records.find(
      (record) =>
        normalizeEmail(record.email) ===
        email,
    ) ||
    null;

  const studentRecord =
    exactRecord ||
    records.find(
      (record) =>
        normalizeStudentId(
          record.studentId,
        ) === studentId,
    ) ||
    null;

  return {
    exactRecord,
    emailRecord,
    studentRecord,
  };
}

async function findStoredDuplicate(
  settings: SemesterSettings,
  email: string,
  studentId: string,
) {
  const semesterData =
    await getSemesterRecords(settings);

  return {
    ...semesterData,

    duplicate: findDuplicate(
      semesterData.records,
      email,
      studentId,
    ),
  };
}

/*
 * Used when another request currently owns an identity lock.
 * It gives that request a short period to save its record.
 */
async function waitForStoredDuplicate(
  settings: SemesterSettings,
  email: string,
  studentId: string,
) {
  for (
    let attempt = 0;
    attempt < 12;
    attempt += 1
  ) {
    const result =
      await findStoredDuplicate(
        settings,
        email,
        studentId,
      );

    if (
      result.duplicate.exactRecord ||
      result.duplicate.emailRecord ||
      result.duplicate.studentRecord
    ) {
      return result.duplicate;
    }

    await wait(500);
  }

  return {
    exactRecord: null,
    emailRecord: null,
    studentRecord: null,
  } satisfies DuplicateResult;
}

/* ============================================================
   CONFIRMATION EMAIL
============================================================ */

async function saveEmailAttempt(
  record: ClubFairRecord,
  data: {
    success: boolean;
    messageId?: string;
    error?: string;
  },
) {
  const attemptTime =
    new Date().toISOString();

  const updatedRecord: ClubFairRecord = {
    ...record,

    emailSent: data.success,

    emailSentAt: data.success
      ? attemptTime
      : record.emailSentAt || "",

    emailMessageId: data.success
      ? data.messageId || ""
      : record.emailMessageId || "",

    emailLastAttemptAt: attemptTime,

    emailLastError: data.success
      ? ""
      : data.error ||
        "Email delivery failed.",
  };

  await kv.set(
    databaseRecordKey(
      record.semester,
      record.year,
      record.id,
    ),
    updatedRecord,
  );

  return updatedRecord;
}

async function deliverConfirmationEmail(
  initialRecord: ClubFairRecord,
): Promise<EmailDeliveryResult> {
  /*
   * Always read the latest copy before sending.
   */
  const storedRecord =
    await kv.get<ClubFairRecord>(
      databaseRecordKey(
        initialRecord.semester,
        initialRecord.year,
        initialRecord.id,
      ),
    );

  const record =
    storedRecord || initialRecord;

  if (record.emailSent === true) {
    return {
      success: true,
      record,
    };
  }

  const lockKey =
    emailRetryLockKey(record.id);

  const lockOwner =
    `email-${record.id}-${randomUUID()}`;

  const acquired =
    await acquireLock(
      lockKey,
      lockOwner,
    );

  if (!acquired) {
    /*
     * Another request is already sending this email.
     * Wait for it to finish instead of returning HTTP 409.
     */
    for (
      let attempt = 0;
      attempt < 20;
      attempt += 1
    ) {
      await wait(500);

      const latest =
        await kv.get<ClubFairRecord>(
          databaseRecordKey(
            record.semester,
            record.year,
            record.id,
          ),
        );

      if (latest?.emailSent === true) {
        return {
          success: true,
          record: latest,
        };
      }

      const currentLock =
        await kv.get<string>(lockKey);

      if (!currentLock) {
        break;
      }
    }

    return {
      success: false,
      processing: true,
      record,
      error:
        "Confirmation email delivery is still being processed.",
    };
  }

  try {
    /*
     * Read it one more time after taking the lock.
     */
    const latestRecord =
      await kv.get<ClubFairRecord>(
        databaseRecordKey(
          record.semester,
          record.year,
          record.id,
        ),
      );

    const recordToSend =
      latestRecord || record;

    if (
      recordToSend.emailSent === true
    ) {
      return {
        success: true,
        record: recordToSend,
      };
    }

    const template =
      buildClubFairThankYouEmail(
        recordToSend.name,
      );

    const result = await sendMail({
      to: recordToSend.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (!result.success) {
      const failedRecord =
        await saveEmailAttempt(
          recordToSend,
          {
            success: false,
            error: result.error,
          },
        );

      console.error(
        "Club Fair confirmation email failed:",
        result.error,
      );

      return {
        success: false,
        record: failedRecord,
        error:
          result.error ||
          "Confirmation email could not be sent.",
      };
    }

    const confirmedRecord =
      await saveEmailAttempt(
        recordToSend,
        {
          success: true,
          messageId:
            result.messageId || "",
        },
      );

    return {
      success: true,
      record: confirmedRecord,
    };
  } finally {
    await releaseLock(
      lockKey,
      lockOwner,
    );
  }
}

/* ============================================================
   RESPONSES
============================================================ */

function confirmationSuccessResponse(
  record: ClubFairRecord,
  alreadySubmitted: boolean,
) {
  return NextResponse.json(
    {
      result: "success",
      applicationSaved: true,
      alreadySubmitted,
      confirmationEmailSent: true,
      emailSent: true,

      submissionId: record.id,
      semester: record.semester,
      year: record.year,
      email: record.email,

      message: alreadySubmitted
        ? "Application already submitted, and the confirmation email has been sent."
        : "Application submitted, and a confirmation email has been sent.",
    },
    {
      status: 200,
    },
  );
}

function confirmationFailureResponse(
  record: ClubFairRecord,
  message: string,
  processing = false,
) {
  /*
   * This deliberately returns HTTP 200.
   *
   * The client can show the email-retry message without Axios
   * producing a 409 or 502 console error. The success screen is
   * not shown because confirmationEmailSent remains false.
   */
  return NextResponse.json(
    {
      result: processing
        ? "email-processing"
        : "email-failed",

      applicationSaved: true,
      alreadySubmitted: true,
      confirmationEmailSent: false,
      emailSent: false,
      retryAllowed: true,
      processing,

      submissionId: record.id,
      semester: record.semester,
      year: record.year,
      email: record.email,

      error: message,
      message,
    },
    {
      status: 200,
    },
  );
}

async function processExistingRecord(
  record: ClubFairRecord,
) {
  const delivery =
    await deliverConfirmationEmail(record);

  if (delivery.success) {
    return confirmationSuccessResponse(
      delivery.record,
      true,
    );
  }

  if (delivery.processing) {
    return confirmationFailureResponse(
      delivery.record,
      "Your application is saved and the confirmation email is currently being processed. Please wait a moment and click Submit Application again.",
      true,
    );
  }

  return confirmationFailureResponse(
    delivery.record,
    "Your application is saved, but the confirmation email could not be sent. Check the website email configuration, then click Submit Application again to retry.",
  );
}

/* ============================================================
   VALIDATION
============================================================ */

function validateSubmission(
  body: ClubFairSubmission,
) {
  const requiredFields: Array<{
    value: unknown;
    label: string;
  }> = [
    {
      value: body.Name,
      label: "Name",
    },
    {
      value: body.StudentID,
      label: "Student ID",
    },
    {
      value: body.Address,
      label: "Address",
    },
    {
      value: body.Gender,
      label: "Gender",
    },
    {
      value: body.Religion,
      label: "Religion",
    },
    {
      value: body.Contact,
      label: "Contact number",
    },
    {
      value: body.Facebook,
      label: "Facebook profile",
    },
    {
      value: body.Department,
      label: "Department",
    },
    {
      value: body.Semester,
      label: "Semester",
    },
    {
      value: body.BloodGroup,
      label: "Blood group",
    },
    {
      value: body.BloodDonation,
      label: "Blood donation interest",
    },
    {
      value: body.Email,
      label: "Email",
    },
  ];

  for (const field of requiredFields) {
    if (!clean(field.value)) {
      return `${field.label} is required.`;
    }
  }

  const email =
    normalizeEmail(body.Email);

  if (
    !email.endsWith(
      "@g.bracu.ac.bd",
    )
  ) {
    return "Please use a valid BRACU G-Suite email.";
  }

  const department =
    clean(body.Department);

  if (department.length > 100) {
    return "Department name must be 100 characters or fewer.";
  }

  return "";
}

/* ============================================================
   ROUTE
============================================================ */

export async function POST(
  request: Request,
) {
  let emailLockKey = "";
  let studentLockKey = "";
  let identityLockOwner = "";

  let emailLockAcquired = false;
  let studentLockAcquired = false;

  try {
    /* ---------------- Registration window ---------------- */

    const storedWindow =
      await kv.get<ClubFairWindow>(
        CLUB_FAIR_WINDOW_KEY,
      );

    const registrationWindow =
      normalizeClubFairWindow(
        storedWindow,
      );

    const windowStatus =
      getClubFairWindowStatus(
        registrationWindow,
      );

    if (windowStatus === "upcoming") {
      return NextResponse.json(
        {
          error:
            "Club Fair registration has not opened yet.",
          windowStatus,
        },
        {
          status: 403,
        },
      );
    }

    if (windowStatus === "closed") {
      return NextResponse.json(
        {
          error:
            CLUB_FAIR_CLOSED_MESSAGE,
          windowStatus,
        },
        {
          status: 403,
        },
      );
    }

    /* ---------------- Parse JSON ---------------- */

    let body: ClubFairSubmission;

    try {
      body =
        (await request.json()) as ClubFairSubmission;
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid request data.",
        },
        {
          status: 400,
        },
      );
    }

    /* ---------------- Validate ---------------- */

    const validationError =
      validateSubmission(body);

    if (validationError) {
      return NextResponse.json(
        {
          error: validationError,
        },
        {
          status: 400,
        },
      );
    }

    const settings =
      await getActiveSemesterSettings();

    const name = clean(body.Name);

    const email =
      normalizeEmail(body.Email);

    const studentId =
      normalizeStudentId(
        body.StudentID,
      );

    const facebook =
      normalizeFacebookUrl(
        clean(body.Facebook),
      );

    if (!facebook) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid Facebook profile link, such as facebook.com/username.",
        },
        {
          status: 400,
        },
      );
    }

    /* ---------------- Existing application ---------------- */

    let storedData =
      await findStoredDuplicate(
        settings,
        email,
        studentId,
      );

    let duplicate =
      storedData.duplicate;

    /*
     * Exact match:
     * retry its email or return the existing success.
     */
    if (duplicate.exactRecord) {
      return processExistingRecord(
        duplicate.exactRecord,
      );
    }

    /*
     * The same email is enough to identify an existing
     * application safely because the confirmation goes to that
     * same saved email address.
     */
    if (duplicate.emailRecord) {
      return processExistingRecord(
        duplicate.emailRecord,
      );
    }

    /*
     * Student ID exists but the submitted email is different.
     * Do not send or expose the existing applicant's email.
     */
    if (duplicate.studentRecord) {
      return NextResponse.json(
        {
          result:
            "already-submitted",
          applicationSaved: true,
          alreadySubmitted: true,
          confirmationEmailSent: false,
          emailSent: false,
          retryAllowed: false,

          error:
            "An application has already been submitted with this student ID. Please use the same G-Suite email that was used for the original application.",
          message:
            "An application has already been submitted with this student ID. Please use the same G-Suite email that was used for the original application.",
        },
        {
          /*
           * Return 200 so this is handled as an application
           * message instead of an Axios console exception.
           */
          status: 200,
        },
      );
    }

    /* ---------------- Identity locks ---------------- */

    identityLockOwner =
      `submission-${randomUUID()}`;

    emailLockKey =
      submissionLockKey(
        "email",
        settings.semester,
        settings.year,
        email,
      );

    studentLockKey =
      submissionLockKey(
        "student",
        settings.semester,
        settings.year,
        studentId,
      );

    emailLockAcquired =
      await acquireLock(
        emailLockKey,
        identityLockOwner,
      );

    if (!emailLockAcquired) {
      duplicate =
        await waitForStoredDuplicate(
          settings,
          email,
          studentId,
        );

      if (
        duplicate.exactRecord ||
        duplicate.emailRecord
      ) {
        return processExistingRecord(
          duplicate.exactRecord ||
            duplicate.emailRecord!,
        );
      }

      return NextResponse.json(
        {
          result: "processing",
          applicationSaved: false,
          confirmationEmailSent: false,
          emailSent: false,
          processing: true,

          message:
            "Your application is currently being processed. Please wait a few seconds and click Submit Application again.",
        },
        {
          status: 200,
        },
      );
    }

    studentLockAcquired =
      await acquireLock(
        studentLockKey,
        identityLockOwner,
      );

    if (!studentLockAcquired) {
      duplicate =
        await waitForStoredDuplicate(
          settings,
          email,
          studentId,
        );

      if (
        duplicate.exactRecord ||
        duplicate.emailRecord
      ) {
        return processExistingRecord(
          duplicate.exactRecord ||
            duplicate.emailRecord!,
        );
      }

      return NextResponse.json(
        {
          result: "processing",
          applicationSaved: false,
          confirmationEmailSent: false,
          emailSent: false,
          processing: true,

          message:
            "An application with this student ID is currently being processed. Please wait a few seconds and try again.",
        },
        {
          status: 200,
        },
      );
    }

    /*
     * Check again after taking both identity locks.
     */
    storedData =
      await findStoredDuplicate(
        settings,
        email,
        studentId,
      );

    duplicate =
      storedData.duplicate;

    if (
      duplicate.exactRecord ||
      duplicate.emailRecord
    ) {
      return processExistingRecord(
        duplicate.exactRecord ||
          duplicate.emailRecord!,
      );
    }

    if (duplicate.studentRecord) {
      return NextResponse.json(
        {
          result:
            "already-submitted",
          applicationSaved: true,
          alreadySubmitted: true,
          confirmationEmailSent: false,
          emailSent: false,

          message:
            "An application has already been submitted with this student ID.",
        },
        {
          status: 200,
        },
      );
    }

    /* ---------------- Save application ---------------- */

    const sequence = await kv.incr(
      "club-fair:database:sequence",
    );

    const submissionId =
      `club-fair-${settings.year}-` +
      `${settings.semester.toLowerCase()}-` +
      `${sequence}`;

    const timestamp =
      new Date().toISOString();

    const submission: ClubFairRecord = {
      id: submissionId,
      formType: "club-fair",

      semester: settings.semester,
      year: settings.year,
      semesterLabel: settings.label,
      submittedAt: timestamp,

      name,
      email,
      studentId,

      address: clean(body.Address),
      gender: clean(body.Gender),
      religion: clean(body.Religion),
      contact: clean(body.Contact),
      facebook,
      department: clean(
        body.Department,
      ),

      studentSemester: clean(
        body.Semester,
      ),

      bloodGroup: clean(
        body.BloodGroup,
      ),

      bloodDonation: clean(
        body.BloodDonation,
      ),

      emailSent: false,
      emailSentAt: "",
      emailMessageId: "",
      emailLastAttemptAt: "",
      emailLastError: "",
    };

    await kv.set(
      databaseRecordKey(
        settings.semester,
        settings.year,
        submissionId,
      ),
      submission,
    );

    const indexKey =
      databaseIndexKey(
        settings.semester,
        settings.year,
      );

    const previousIndex =
      (await kv.get<string[]>(
        indexKey,
      )) || [];

    if (
      !previousIndex.includes(
        submissionId,
      )
    ) {
      await kv.set(
        indexKey,
        [
          submissionId,
          ...previousIndex,
        ],
      );
    }

    /*
     * Counts are incremented exactly once, only for the newly
     * saved application.
     */
    await kv.incr(
      "club-fair:count",
    );

    await kv.incr(
      semesterCountKey(
        settings.semester,
        settings.year,
      ),
    );

    /* ---------------- Google Sheets ---------------- */

    if (GOOGLE_SCRIPT_URL) {
      try {
        await axios.post(
          GOOGLE_SCRIPT_URL,
          {
            formType:
              "club-fair",

            tabName:
              `Club Fair ${settings.semester} ${settings.year}`,

            semester:
              settings.semester,

            year: settings.year,

            activeSemesterLabel:
              settings.label,

            submissionId,
            timestamp,

            Name:
              submission.name,

            StudentID:
              submission.studentId,

            Address:
              submission.address,

            Gender:
              submission.gender,

            Religion:
              submission.religion,

            Contact:
              submission.contact,

            Facebook:
              submission.facebook,

            Department:
              submission.department,

            Semester:
              submission.studentSemester,

            BloodGroup:
              submission.bloodGroup,

            BloodDonation:
              submission.bloodDonation,

            Email:
              submission.email,
          },
          {
            timeout: 10000,
          },
        );
      } catch (sheetError) {
        /*
         * Google Sheets failure must not delete or duplicate the
         * saved application.
         */
        console.error(
          "Google Sheet submission failed:",
          sheetError,
        );
      }
    }

    /* ---------------- Confirmation email ---------------- */

    const delivery =
      await deliverConfirmationEmail(
        submission,
      );

    if (delivery.success) {
      return confirmationSuccessResponse(
        delivery.record,
        false,
      );
    }

    if (delivery.processing) {
      return confirmationFailureResponse(
        delivery.record,
        "Your application is saved and the confirmation email is being processed. Please wait a moment and click Submit Application again.",
        true,
      );
    }

    return confirmationFailureResponse(
      delivery.record,
      "Your application is saved, but the confirmation email could not be sent. Check the website email configuration, then click Submit Application again to retry.",
    );
  } catch (error) {
    console.error(
      "Club Fair submission error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to process the Club Fair application. Please try again.",
      },
      {
        status: 500,
      },
    );
  } finally {
    if (
      studentLockAcquired &&
      studentLockKey &&
      identityLockOwner
    ) {
      await releaseLock(
        studentLockKey,
        identityLockOwner,
      );
    }

    if (
      emailLockAcquired &&
      emailLockKey &&
      identityLockOwner
    ) {
      await releaseLock(
        emailLockKey,
        identityLockOwner,
      );
    }
  }
}