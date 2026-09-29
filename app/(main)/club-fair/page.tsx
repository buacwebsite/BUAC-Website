"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaCampground,
  FaChartBar,
  FaCompass,
  FaFire,
  FaHiking,
  FaHourglassHalf,
  FaLock,
  FaMountain,
  FaPaperPlane,
  FaSave,
  FaTint,
  FaUndo,
  FaUsers,
} from "react-icons/fa";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { useAuth } from "@/app/context/AuthProvider";
import CustomSelect from "@/app/components/ui/CustomSelect";
import ClubFairOrderEditor from "@/app/components/editors/ClubFairOrderEditor";
import {
  CLUB_FAIR_CLOSED_MESSAGE,
  defaultClubFairWindow,
  getClubFairWindowStatus,
  normalizeClubFairWindow,
  type ClubFairWindow,
  type ClubFairWindowStatus,
} from "@/lib/clubFairWindow";

type ClubFairSectionId = "counter" | "application" | "whyJoin" | "cta";
type SemesterName = "Spring" | "Summer" | "Fall";

const defaultSectionOrder: ClubFairSectionId[] = [
  "counter",
  "application",
  "whyJoin",
  "cta",
];

const benefits = [
  {
    title: "Epic Adventures",
    description:
      "Explore breathtaking mountains, valleys, and trails across Bangladesh.",
  },
  {
    title: "Skill Development",
    description:
      "Learn trekking, camping, navigation, and survival skills from experienced adventurers.",
  },
  {
    title: "Leadership",
    description:
      "Develop leadership qualities by organizing and leading expeditions.",
  },
  {
    title: "Unforgettable Memories",
    description:
      "Create lasting bonds and memories around campfires under starry skies.",
  },
  {
    title: "Vibrant Community",
    description:
      "Join a passionate community of adventure seekers and outdoor enthusiasts.",
  },
  {
    title: "Personal Growth",
    description:
      "Push your limits, build resilience, and discover your potential.",
  },
];

const benefitIcons = [
  <FaMountain key="mountain" className="text-4xl text-accent" />,
  <FaHiking key="hiking" className="text-4xl text-accent" />,
  <FaCompass key="compass" className="text-4xl text-accent" />,
  <FaCampground key="camp" className="text-4xl text-accent" />,
  <FaUsers key="users" className="text-4xl text-accent" />,
  <FaFire key="fire" className="text-4xl text-accent" />,
];

const genderOptions = ["Male", "Female", "Other"];

const religionOptions = [
  "Islam",
  "Hinduism",
  "Christianity",
  "Buddhism",
  "Other",
];

const departmentOptions = [
  "MNS",
  "EEE",
  "CSE",
  "CS",
  "ECO",
  "LLB",
  "Pharmacy",
  "Architecture",
  "BBA",
  "ESS",
  "Other",
];

const universitySemesterOptions = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
  "13th",
  "14th",
  "Other",
];

const bloodGroupOptions = [
  "A+ ve",
  "A- ve",
  "B+ ve",
  "B- ve",
  "O+ ve",
  "O- ve",
  "AB+ ve",
  "AB- ve",
];

const bloodDonationOptions = ["Yes", "Maybe", "No"];

const activeSemesterOptions: SemesterName[] = ["Spring", "Summer", "Fall"];

const initialForm = {
  name: "",
  studentId: "",
  address: "",
  gender: "",
  religion: "",
  contact: "",
  facebook: "",
  department: "",
  semester: "",
  bloodGroup: "",
  bloodDonation: "",
  email: "",
};

interface CountResponse {
  count: number;
  totalCount: number;
  databaseRecords: number;
  semester: SemesterName;
  year: string;
  label: string;
}

const inputClass =
  "h-12 w-full rounded-xl border border-input-border bg-input-bg px-4 text-[15px] text-text-secondary outline-none transition focus:border-accent placeholder:text-text-muted sm:h-13 sm:text-sm";

function RequiredMark() {
  return <span className="text-accent">*</span>;
}

function normalizeFacebookUrl(value: string) {
  const input = String(value || "").trim();

  if (!input) return "";

  const withProtocol = /^https?:\/\//i.test(input)
    ? input
    : `https://${input}`;

  try {
    const parsed = new URL(withProtocol);

    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");

    const validHostname =
      hostname === "facebook.com" ||
      hostname === "m.facebook.com" ||
      hostname === "fb.com" ||
      hostname.endsWith(".facebook.com");

    if (!validHostname) return "";

    return parsed.toString();
  } catch {
    return "";
  }
}

function toLocalInputValue(iso: string) {
  if (!iso) return "";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromLocalInputValue(value: string) {
  if (!value) return "";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function formatDateTime(iso: string) {
  if (!iso) return "";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return error.response?.data?.error || fallback;
  }

  return fallback;
}

export default function ClubFairPage() {
  const { auth } = useAuth();

  /* ---------------- Form ---------------- */
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  /* ---------------- Live counter ---------------- */
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [liveTotal, setLiveTotal] = useState<number | null>(null);
  const [activeSemester, setActiveSemester] =
    useState<SemesterName>("Spring");
  const [activeYear, setActiveYear] = useState(
    String(new Date().getFullYear()),
  );
  const [activeLabel, setActiveLabel] = useState("");

  /* ---------------- Admin semester and count ---------------- */
  const [adminSemester, setAdminSemester] =
    useState<SemesterName>("Spring");
  const [adminYear, setAdminYear] = useState(
    String(new Date().getFullYear()),
  );
  const [countInput, setCountInput] = useState("0");
  const [totalCountInput, setTotalCountInput] = useState("0");
  const [resetAllTime, setResetAllTime] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [countSaving, setCountSaving] = useState(false);
  const [countResetting, setCountResetting] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [adminError, setAdminError] = useState("");

  const adminInputsLoaded = useRef(false);

  const adminBusy = settingsSaving || countSaving || countResetting;

  const yearOptions = Array.from({ length: 8 }, (_, index) =>
    String(new Date().getFullYear() - 2 + index),
  );

  /* ---------------- Section order ---------------- */
  const [sectionOrder, setSectionOrder] =
    useState<ClubFairSectionId[]>(defaultSectionOrder);
  const [orderEditorOpen, setOrderEditorOpen] = useState(false);

  /* ---------------- Registration window ---------------- */
  const [windowSettings, setWindowSettings] = useState<ClubFairWindow>(
    defaultClubFairWindow,
  );
  const [windowLoaded, setWindowLoaded] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const [draftEnabled, setDraftEnabled] = useState(false);
  const [draftStart, setDraftStart] = useState("");
  const [draftEnd, setDraftEnd] = useState("");
  const [windowSaving, setWindowSaving] = useState(false);
  const [windowMessage, setWindowMessage] = useState("");
  const [windowError, setWindowError] = useState("");

  const windowStatus: ClubFairWindowStatus = getClubFairWindowStatus(
    windowSettings,
    now,
  );

  const updateForm = (field: keyof typeof initialForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const applyWindow = (window: ClubFairWindow) => {
    setWindowSettings(window);
    setDraftEnabled(window.enabled);
    setDraftStart(toLocalInputValue(window.startAt));
    setDraftEnd(toLocalInputValue(window.endAt));
  };

  const fetchSectionOrder = useCallback(async () => {
    try {
      const response = await axios.get("/api/content/club-fair-order");

      if (Array.isArray(response.data?.order)) {
        setSectionOrder(response.data.order);
      }
    } catch (error) {
      console.error("Failed to fetch Club Fair section order:", error);
    }
  }, []);

  const fetchCount = useCallback(async (syncAdminInputs = false) => {
    try {
      const response = await axios.get<CountResponse>(
        "/api/club-fair/count",
        {
          withCredentials: true,
        },
      );

      const result = response.data;

      setLiveCount(result.count || 0);
      setLiveTotal(result.totalCount || 0);
      setActiveSemester(result.semester);
      setActiveYear(result.year);
      setActiveLabel(result.label);

      if (syncAdminInputs || !adminInputsLoaded.current) {
        setAdminSemester(result.semester);
        setAdminYear(result.year);
        setCountInput(String(result.count || 0));
        setTotalCountInput(String(result.totalCount || 0));
        adminInputsLoaded.current = true;
      }
    } catch (error) {
      console.error("Failed to fetch Club Fair count:", error);
    }
  }, []);

  const fetchWindow = useCallback(async () => {
    try {
      const response = await axios.get("/api/content/club-fair-window");

      applyWindow(normalizeClubFairWindow(response.data?.window));
    } catch (error) {
      console.error("Failed to fetch Club Fair registration window:", error);
    } finally {
      setWindowLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchSectionOrder();
    fetchCount();
    fetchWindow();

    const countInterval = window.setInterval(() => fetchCount(), 15000);

    const clockInterval = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => {
      window.clearInterval(countInterval);
      window.clearInterval(clockInterval);
    };
  }, [fetchSectionOrder, fetchCount, fetchWindow]);

  const clearAdminMessages = () => {
    setAdminMessage("");
    setAdminError("");
  };

  const saveActiveSemester = async () => {
    setSettingsSaving(true);
    clearAdminMessages();

    try {
      const response = await axios.put(
        "/api/content/semester-settings",
        {
          semester: adminSemester,
          year: adminYear,
        },
        {
          withCredentials: true,
        },
      );

      const label =
        response.data?.settings?.label || `${adminSemester} ${adminYear}`;

      setActiveLabel(label);
      setAdminMessage(`Active semester changed to ${label}.`);

      await fetchCount(true);
    } catch (error) {
      console.error("Failed to save semester settings:", error);
      setAdminError(
        getErrorMessage(error, "Failed to update semester and year."),
      );
    } finally {
      setSettingsSaving(false);
    }
  };

  const saveCount = async () => {
    clearAdminMessages();

    const semesterCount = Number(countInput);
    const allTimeCount = Number(totalCountInput);

    if (!Number.isInteger(semesterCount) || semesterCount < 0) {
      setAdminError("Semester count must be a non-negative whole number.");
      return;
    }

    if (!Number.isInteger(allTimeCount) || allTimeCount < 0) {
      setAdminError("All-time count must be a non-negative whole number.");
      return;
    }

    setCountSaving(true);

    try {
      const response = await axios.put(
        "/api/club-fair/count",
        {
          action: "set",
          count: semesterCount,
          totalCount: allTimeCount,
          semester: adminSemester,
          year: adminYear,
        },
        {
          withCredentials: true,
        },
      );

      setCountInput(String(response.data.count));
      setTotalCountInput(String(response.data.totalCount));
      setAdminMessage(`Count saved for ${response.data.label}.`);

      await fetchCount();
    } catch (error) {
      console.error("Failed to save Club Fair count:", error);
      setAdminError(getErrorMessage(error, "Failed to save Club Fair count."));
    } finally {
      setCountSaving(false);
    }
  };

  const resetCount = async () => {
    const confirmed = window.confirm(
      resetAllTime
        ? `Reset the ${adminSemester} ${adminYear} count AND the all-time count to zero?`
        : `Reset the ${adminSemester} ${adminYear} count to zero?`,
    );

    if (!confirmed) return;

    setCountResetting(true);
    clearAdminMessages();

    try {
      const response = await axios.put(
        "/api/club-fair/count",
        {
          action: "reset",
          semester: adminSemester,
          year: adminYear,
          resetTotal: resetAllTime,
        },
        {
          withCredentials: true,
        },
      );

      setCountInput(String(response.data.count));
      setTotalCountInput(String(response.data.totalCount));

      setAdminMessage(
        resetAllTime
          ? "Semester and all-time counts were reset to zero."
          : `The ${response.data.label} count was reset to zero.`,
      );

      setResetAllTime(false);

      await fetchCount();
    } catch (error) {
      console.error("Failed to reset Club Fair count:", error);
      setAdminError(getErrorMessage(error, "Failed to reset Club Fair count."));
    } finally {
      setCountResetting(false);
    }
  };

  const saveWindow = async () => {
    setWindowSaving(true);
    setWindowMessage("");
    setWindowError("");

    const startAt = fromLocalInputValue(draftStart);
    const endAt = fromLocalInputValue(draftEnd);

    if (draftEnabled) {
      if (!startAt || !endAt) {
        setWindowError("Please set both a start date and an end date.");
        setWindowSaving(false);
        return;
      }

      if (Date.parse(endAt) <= Date.parse(startAt)) {
        setWindowError("The end date must be after the start date.");
        setWindowSaving(false);
        return;
      }
    }

    try {
      const response = await axios.put(
        "/api/content/club-fair-window",
        {
          enabled: draftEnabled,
          startAt,
          endAt,
        },
        {
          withCredentials: true,
        },
      );

      applyWindow(normalizeClubFairWindow(response.data?.window));
      setNow(Date.now());

      setWindowMessage(
        draftEnabled
          ? "Registration window saved."
          : "Schedule turned off. The form is now always open.",
      );
    } catch (error) {
      console.error("Failed to save registration window:", error);
      setWindowError(getErrorMessage(error, "Failed to save the window."));
    } finally {
      setWindowSaving(false);
    }
  };

  const validateForm = () => {
    const requiredFields: [keyof typeof initialForm, string][] = [
      ["name", "Name"],
      ["studentId", "Student ID"],
      ["address", "Address"],
      ["gender", "Gender"],
      ["religion", "Religion"],
      ["contact", "Contact Number"],
      ["facebook", "Facebook Profile Link"],
      ["department", "University Department"],
      ["semester", "Semester"],
      ["bloodGroup", "Blood Group"],
      ["bloodDonation", "Blood donation interest"],
      ["email", "G-Suite Email"],
    ];

    for (const [field, label] of requiredFields) {
      if (!form[field].trim()) {
        return `${label} is required.`;
      }
    }

    if (!normalizeFacebookUrl(form.facebook)) {
      return "Enter a valid Facebook link, such as facebook.com/username.";
    }

    if (!form.email.trim().toLowerCase().endsWith("@g.bracu.ac.bd")) {
      return "Please use a valid BRACU G-Suite email.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitStatus({
      type: null,
      message: "",
    });

    if (getClubFairWindowStatus(windowSettings, Date.now()) !== "open") {
      setNow(Date.now());
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setSubmitStatus({
        type: "error",
        message: validationError,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "/api/club-fair/submit",
        {
          Name: form.name,
          StudentID: form.studentId,
          Address: form.address,
          Gender: form.gender,
          Religion: form.religion,
          Contact: form.contact,
          Facebook: normalizeFacebookUrl(form.facebook),
          Department: form.department,
          Semester: form.semester,
          BloodGroup: form.bloodGroup,
          BloodDonation: form.bloodDonation,
          Email: form.email.trim().toLowerCase(),
        },
        {
          withCredentials: true,
        },
      );

      setSubmitStatus({
        type: "success",
        message:
          response.data?.message || "Registration submitted successfully.",
      });

      setForm(initialForm);

      await fetchCount();
    } catch (error) {
      console.error("Club Fair submit error:", error);

      if (error instanceof AxiosError && error.response?.status === 403) {
        await fetchWindow();
        setNow(Date.now());
        return;
      }

      setSubmitStatus({
        type: "error",
        message: getErrorMessage(
          error,
          "Something went wrong. Please try again later.",
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderWindowAdmin = () => {
    const statusBadge =
      windowStatus === "open"
        ? "border-green-500/30 bg-green-500/10 text-green-500"
        : windowStatus === "upcoming"
          ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
          : "border-red-500/30 bg-red-500/10 text-red-500";

    const statusText =
      windowStatus === "open"
        ? windowSettings.enabled
          ? "Open now"
          : "Always open (schedule off)"
        : windowStatus === "upcoming"
          ? "Not open yet"
          : "Closed";

    return (
      <section className="mb-8 rounded-3xl border border-accent/30 bg-surface/70 p-5 shadow-xl backdrop-blur-md sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
              Admin Control
            </p>

            <h2 className="mt-1 flex items-center gap-2 font-bebasNeue text-3xl tracking-wide text-text-secondary">
              <FaCalendarAlt className="text-2xl text-accent" />
              Registration Window
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              Set when students can submit the Club Fair form. Times use your
              device&apos;s local time zone.
            </p>
          </div>

          <span
            className={`inline-flex shrink-0 items-center self-start rounded-full border px-3 py-1 text-xs font-bold ${statusBadge}`}
          >
            {statusText}
          </span>
        </div>

        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={draftEnabled}
            onClick={() => setDraftEnabled((value) => !value)}
            disabled={windowSaving}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50 ${
              draftEnabled ? "bg-accent" : "bg-border"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                draftEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>

          <span className="text-sm font-medium text-text-secondary">
            {draftEnabled
              ? "Schedule on: form is open only between these dates"
              : "Schedule off: form is always open"}
          </span>
        </div>

        <div
          className={`grid gap-4 md:grid-cols-2 ${
            draftEnabled ? "" : "pointer-events-none opacity-40"
          }`}
        >
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Opens (start date & time)
            </label>

            <input
              type="datetime-local"
              value={draftStart}
              onChange={(event) => setDraftStart(event.target.value)}
              disabled={windowSaving || !draftEnabled}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Closes (end date & time)
            </label>

            <input
              type="datetime-local"
              value={draftEnd}
              onChange={(event) => setDraftEnd(event.target.value)}
              disabled={windowSaving || !draftEnabled}
              className={inputClass}
            />
          </div>
        </div>

        {windowSettings.enabled && (
          <p className="mt-4 text-xs text-text-muted">
            Currently saved:{" "}
            <span className="font-semibold text-text-secondary">
              {formatDateTime(windowSettings.startAt)}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-text-secondary">
              {formatDateTime(windowSettings.endAt)}
            </span>
          </p>
        )}

        {windowMessage && (
          <p className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-500">
            {windowMessage}
          </p>
        )}

        {windowError && (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
            {windowError}
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={saveWindow}
            disabled={windowSaving}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaSave />
            {windowSaving ? "Saving..." : "Save Window"}
          </button>
        </div>
      </section>
    );
  };

  const renderCountAdmin = () => (
    <section className="mb-10 rounded-3xl border border-accent/30 bg-surface/70 p-5 shadow-xl backdrop-blur-md sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
            Admin Control
          </p>

          <h2 className="mt-1 flex items-center gap-2 font-bebasNeue text-3xl tracking-wide text-text-secondary">
            <FaChartBar className="text-2xl text-accent" />
            Semester & Count Control
          </h2>

          <p className="mt-1 text-xs text-text-muted">
            Choose the active semester, edit the counts, or reset them.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 self-start">
          <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
            Active: {activeLabel || `${activeSemester} ${activeYear}`}
          </span>

          <span className="rounded-full border border-border bg-surface-secondary px-3 py-1 text-xs font-bold text-text-secondary">
            All-time: {liveTotal !== null ? liveTotal.toLocaleString() : "?"}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background/40 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-text-secondary">
          1. Active Semester & Year
        </p>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Semester
            </label>

            <CustomSelect
              value={adminSemester}
              onChange={(value) => setAdminSemester(value as SemesterName)}
              options={activeSemesterOptions}
              placeholder="Select Semester"
              variant="surface"
              disabled={adminBusy}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Year
            </label>

            <CustomSelect
              value={adminYear}
              onChange={setAdminYear}
              options={yearOptions}
              placeholder="Select Year"
              variant="surface"
              disabled={adminBusy}
            />
          </div>

          <button
            type="button"
            onClick={saveActiveSemester}
            disabled={adminBusy}
            className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-bold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaSave />
            {settingsSaving ? "Saving..." : "Save Active Semester"}
          </button>
        </div>

        <p className="mt-3 text-[11px] text-text-muted">
          New submissions and the public counter use the active semester.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-background/40 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-text-secondary">
          2. Counts for {adminSemester} {adminYear}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Semester Count
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={countInput}
              onChange={(event) => setCountInput(event.target.value)}
              disabled={adminBusy}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
              All-Time Total Count
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={totalCountInput}
              onChange={(event) => setTotalCountInput(event.target.value)}
              disabled={adminBusy}
              className={inputClass}
            />
          </div>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            checked={resetAllTime}
            onChange={(event) => setResetAllTime(event.target.checked)}
            disabled={adminBusy}
            className="h-4 w-4 cursor-pointer accent-[#ff622b]"
          />
          Also reset the all-time total count when resetting
        </label>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={resetCount}
            disabled={adminBusy}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/40 px-5 py-3 text-sm font-bold text-red-500 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaUndo />
            {countResetting
              ? "Resetting..."
              : resetAllTime
                ? "Reset Semester + All-Time"
                : "Reset Semester Count"}
          </button>

          <button
            type="button"
            onClick={saveCount}
            disabled={adminBusy}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaSave />
            {countSaving ? "Saving..." : "Save Count"}
          </button>
        </div>
      </div>

      {adminMessage && (
        <p className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-500">
          {adminMessage}
        </p>
      )}

      {adminError && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
          {adminError}
        </p>
      )}
    </section>
  );

  const renderCounter = () => (
    <motion.section
      key="counter"
      initial={{
        opacity: 0,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.6,
      }}
      className="relative mb-20 overflow-hidden rounded-3xl border-2 border-accent/30 bg-accent/10 p-8 text-center shadow-xl sm:p-12 md:p-16"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="absolute right-6 top-6 flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
        </span>

        <span className="text-xs font-semibold uppercase tracking-widest text-green-500">
          Live
        </span>
      </div>

      <p className="relative text-xs uppercase tracking-[0.3em] text-text-muted sm:text-sm">
        Total Registrations
      </p>

      <p className="relative mt-2 text-sm font-semibold text-accent">
        {activeLabel || `${activeSemester} ${activeYear}`}
      </p>

      <motion.div
        key={liveCount ?? "loading"}
        initial={{
          opacity: 0,
          scale: 0.85,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="relative font-bebasNeue text-8xl leading-none tracking-wider text-accent sm:text-[10rem] md:text-[12rem]"
      >
        {liveCount !== null ? liveCount.toLocaleString() : "?"}
      </motion.div>
    </motion.section>
  );

  const renderFormUnavailable = () => {
    const isUpcoming = windowStatus === "upcoming";

    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="rounded-2xl border-2 border-accent/30 bg-surface/70 p-8 text-center shadow-xl backdrop-blur-md sm:p-12"
      >
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
          {isUpcoming ? (
            <FaHourglassHalf className="text-4xl text-accent" />
          ) : (
            <FaLock className="text-4xl text-accent" />
          )}
        </div>

        <h3 className="font-bebasNeue text-3xl tracking-wider text-text-secondary sm:text-4xl">
          {isUpcoming
            ? "Registration Opens Soon"
            : "Club Fair Registration Is Closed"}
        </h3>

        {isUpcoming ? (
          <>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-muted">
              The Club Fair registration form is not open yet. Please come back
              when registration starts.
            </p>

            {windowSettings.startAt && (
              <p className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
                <FaCalendarAlt />
                Opens {formatDateTime(windowSettings.startAt)}
              </p>
            )}
          </>
        ) : (
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
            {CLUB_FAIR_CLOSED_MESSAGE}
          </p>
        )}
      </motion.div>
    );
  };

  const renderApplicationForm = () => (
    <motion.form
      initial={{
        opacity: 0,
        y: 30,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.5,
      }}
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-border bg-surface/70 p-5 shadow-xl backdrop-blur-md sm:p-8"
    >
      {submitStatus.type && (
        <div
          className={`rounded-xl p-4 ${
            submitStatus.type === "success"
              ? "border border-green-500/30 bg-green-500/10 text-green-500"
              : "border border-red-500/30 bg-red-500/10 text-red-500"
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      <div className="mb-6 text-center">
        <p className="text-base leading-relaxed text-text-muted sm:text-lg">
          Fill out the form below to register for the BUAC Club Fair.
        </p>

        {windowSettings.enabled && windowSettings.endAt && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent">
            <FaCalendarAlt />
            Open until {formatDateTime(windowSettings.endAt)}
          </p>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-text-muted">
            Name <RequiredMark />
          </label>

          <input
            type="text"
            value={form.name}
            onChange={(event) => updateForm("name", event.target.value)}
            placeholder="Your full name"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-muted">
            Student ID <RequiredMark />
          </label>

          <input
            type="text"
            value={form.studentId}
            onChange={(event) => updateForm("studentId", event.target.value)}
            placeholder="24101XXX"
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-text-muted">
            Address <RequiredMark />
          </label>

          <input
            type="text"
            value={form.address}
            onChange={(event) => updateForm("address", event.target.value)}
            placeholder="Your current address"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-muted">
            Gender <RequiredMark />
          </label>

          <CustomSelect
            value={form.gender}
            onChange={(value) => updateForm("gender", value)}
            options={genderOptions}
            placeholder="Select Gender"
            variant="surface"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-muted">
            Religion <RequiredMark />
          </label>

          <CustomSelect
            value={form.religion}
            onChange={(value) => updateForm("religion", value)}
            options={religionOptions}
            placeholder="Select Religion"
            variant="surface"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-muted">
            Contact Number <RequiredMark />
          </label>

          <input
            type="text"
            value={form.contact}
            onChange={(event) => updateForm("contact", event.target.value)}
            placeholder="01XXXXXXXXX"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-muted">
            Facebook Profile Link <RequiredMark />
          </label>

          <input
            type="text"
            inputMode="url"
            value={form.facebook}
            onChange={(event) => updateForm("facebook", event.target.value)}
            placeholder="facebook.com/your.profile"
            className={inputClass}
          />

          <p className="mt-1 text-xs text-text-muted">
            You may enter facebook.com directly or include https://.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-muted">
            University Department <RequiredMark />
          </label>

          <CustomSelect
            value={form.department}
            onChange={(value) => updateForm("department", value)}
            options={departmentOptions}
            placeholder="Select Department"
            variant="surface"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-muted">
            Semester in BRACU <RequiredMark />
          </label>

          <CustomSelect
            value={form.semester}
            onChange={(value) => updateForm("semester", value)}
            options={universitySemesterOptions}
            placeholder="Select Semester"
            variant="surface"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-muted">
            Blood Group <RequiredMark />
          </label>

          <CustomSelect
            value={form.bloodGroup}
            onChange={(value) => updateForm("bloodGroup", value)}
            options={bloodGroupOptions}
            placeholder="Select Blood Group"
            variant="surface"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-muted">
            <FaTint className="text-red-500" />
            Are you interested in donating blood? <RequiredMark />
          </label>

          <div className="flex min-h-12 items-center gap-2 rounded-xl border border-input-border bg-input-bg p-2 sm:min-h-13">
            {bloodDonationOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => updateForm("bloodDonation", option)}
                className={`flex-1 cursor-pointer rounded-lg px-2 py-2 text-xs font-semibold transition ${
                  form.bloodDonation === option
                    ? option === "Yes"
                      ? "bg-green-500 text-white"
                      : option === "Maybe"
                        ? "bg-yellow-500 text-white"
                        : "bg-red-500 text-white"
                    : "text-text-muted hover:bg-accent/10 hover:text-accent"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-text-muted">
            G-Suite Email <RequiredMark />
          </label>

          <input
            type="email"
            value={form.email}
            onChange={(event) => updateForm("email", event.target.value)}
            placeholder="yourname@g.bracu.ac.bd"
            className={inputClass}
          />
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileTap={{
          scale: 0.97,
        }}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent py-4 font-bebasNeue text-xl tracking-wider text-white shadow-lg transition hover:bg-accent/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          "Submitting..."
        ) : (
          <>
            Submit Application
            <FaPaperPlane />
          </>
        )}
      </motion.button>
    </motion.form>
  );

  const renderApplication = () => (
    <section key="application" className="mb-16">
      <div className="mx-auto max-w-3xl">
        {!windowLoaded ? (
          <div className="rounded-2xl border border-border bg-surface/70 p-10 text-center">
            <p className="animate-pulse text-sm text-text-muted">
              Checking registration status...
            </p>
          </div>
        ) : windowStatus === "open" ? (
          renderApplicationForm()
        ) : (
          renderFormUnavailable()
        )}
      </div>
    </section>
  );

  const renderWhyJoin = () => (
    <section key="whyJoin" className="mb-20">
      <h2 className="mb-12 text-center font-bebasNeue text-4xl tracking-wider text-text-secondary sm:text-5xl">
        Why Join BUAC?
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: index * 0.05,
              duration: 0.4,
            }}
            className="rounded-2xl border border-border bg-surface/70 p-6 shadow-xl backdrop-blur-md transition hover:border-accent/30 hover:shadow-accent/10"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-accent/10">
              {benefitIcons[index]}
            </div>

            <h3 className="mb-2 font-bebasNeue text-2xl tracking-wide text-text-secondary">
              {benefit.title}
            </h3>

            <p className="leading-relaxed text-text-muted">
              {benefit.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );

  const renderCta = () => (
    <section
      key="cta"
      className="rounded-2xl border border-accent/20 bg-accent/5 p-8 text-center shadow-xl sm:p-12"
    >
      <h2 className="font-bebasNeue text-3xl tracking-wider text-text-secondary md:text-4xl">
        Questions About Club Fair?
      </h2>

      <p className="mx-auto mb-8 mt-4 max-w-2xl text-base text-text-muted sm:text-lg">
        Feel free to reach out to us if you have any questions about BUAC Club
        Fair registration.
      </p>

      <Link
        href="/contact"
        className="inline-block rounded-xl bg-accent px-8 py-4 font-bebasNeue text-xl tracking-wider text-white shadow-lg transition hover:scale-105 hover:bg-accent/90"
      >
        Contact Us
      </Link>
    </section>
  );

  const sectionRenderers: Record<ClubFairSectionId, () => React.ReactNode> = {
    counter: renderCounter,
    application: renderApplication,
    whyJoin: renderWhyJoin,
    cta: renderCta,
  };

  return (
    <main className="buac-gradient-bg min-h-screen px-4 py-20 font-poppins sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-14 text-center sm:mb-16">
          <h1 className="font-bebasNeue text-5xl tracking-wider text-text-secondary sm:text-7xl md:text-8xl">
            CLUB FAIR REGISTRATION
          </h1>
        </header>

        {auth && (
          <>
            <div className="mb-8 flex justify-end">
              <button
                type="button"
                onClick={() => setOrderEditorOpen(true)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent/90"
              >
                <HiOutlinePencilAlt />
                Reorder Sections
              </button>
            </div>

            {renderWindowAdmin()}
            {renderCountAdmin()}
          </>
        )}

        {sectionOrder.map((sectionId) => (
          <div key={sectionId}>{sectionRenderers[sectionId]?.()}</div>
        ))}
      </div>

      {auth && orderEditorOpen && (
        <ClubFairOrderEditor
          order={sectionOrder}
          onClose={() => setOrderEditorOpen(false)}
          onSaved={(newOrder) => {
            setSectionOrder(newOrder);
            setOrderEditorOpen(false);
          }}
        />
      )}
    </main>
  );
}