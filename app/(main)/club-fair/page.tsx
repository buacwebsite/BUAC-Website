"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaCampground,
  FaCompass,
  FaFire,
  FaHiking,
  FaMountain,
  FaPaperPlane,
  FaSave,
  FaTint,
  FaUndo,
  FaUsers,
} from "react-icons/fa";
import { useAuth } from "@/app/context/AuthProvider";
import CustomSelect from "@/app/components/ui/CustomSelect";

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

const essentialQualities = [
  "Current BRAC University student with valid student ID",
  "Passion for outdoor activities and adventure",
  "Commitment to attend regular club activities",
  "Team player with positive attitude",
];

const bonusPoints = [
  "Previous trekking or camping experience",
  "Photography or videography skills",
  "Social media management experience",
  "Event organization or leadership roles",
];

const genderOptions = [
  "Male",
  "Female",
  "Other",
];

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

const bloodDonationOptions = [
  "Yes",
  "Maybe",
  "No",
];

const activeSemesterOptions = [
  "Spring",
  "Summer",
  "Fall",
];

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
  semester: "Spring" | "Summer" | "Fall";
  year: string;
  label: string;
}

/*
 * This helper is kept inside the existing page file.
 * No new file is required.
 *
 * Accepted examples:
 * facebook.com
 * facebook.com/username
 * www.facebook.com/username
 * https://facebook.com/username
 * http://facebook.com/username
 * m.facebook.com/username
 */
function normalizeFacebookUrl(value: string) {
  const input = String(value || "").trim();

  if (!input) {
    return "";
  }

  const valueWithProtocol =
    /^https?:\/\//i.test(input)
      ? input
      : `https://${input}`;

  try {
    const parsedUrl = new URL(valueWithProtocol);

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

const inputClass =
  "h-12 w-full rounded-xl border border-input-border bg-input-bg px-4 text-[15px] text-text-secondary outline-none transition focus:border-accent placeholder:text-text-muted sm:h-13 sm:text-sm";

function RequiredMark() {
  return <span className="text-accent">*</span>;
}

export default function ClubFairPage() {
  const { auth } = useAuth();

  const [form, setForm] = useState(initialForm);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  const [liveCount, setLiveCount] =
    useState<number | null>(null);

  const [activeSemester, setActiveSemester] =
    useState<"Spring" | "Summer" | "Fall">(
      "Spring",
    );

  const [activeYear, setActiveYear] =
    useState(
      String(new Date().getFullYear()),
    );

  const [activeLabel, setActiveLabel] =
    useState("");

  const [countInput, setCountInput] =
    useState("0");

  const [totalCountInput, setTotalCountInput] =
    useState("0");

  const [settingsSaving, setSettingsSaving] =
    useState(false);

  const [countSaving, setCountSaving] =
    useState(false);

  const [countResetting, setCountResetting] =
    useState(false);

  const [resetAllTime, setResetAllTime] =
    useState(false);

  const [adminMessage, setAdminMessage] =
    useState("");

  const [adminError, setAdminError] =
    useState("");

  const yearOptions = Array.from(
    { length: 8 },
    (_, index) =>
      String(new Date().getFullYear() - 2 + index),
  );

  const updateForm = (
    field: keyof typeof initialForm,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const fetchCount = useCallback(async () => {
    try {
      const response =
        await axios.get<CountResponse>(
          "/api/club-fair/count",
          {
            withCredentials: true,
          },
        );

      const result = response.data;

      setLiveCount(result.count || 0);
      setActiveSemester(result.semester);
      setActiveYear(result.year);
      setActiveLabel(result.label);
      setCountInput(String(result.count || 0));
      setTotalCountInput(
        String(result.totalCount || 0),
      );
    } catch (error) {
      console.error(
        "Failed to fetch Club Fair count:",
        error,
      );
    }
  }, []);

  useEffect(() => {
    fetchCount();

    const interval = window.setInterval(
      fetchCount,
      15000,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [fetchCount]);

  const saveActiveSemester = async () => {
    setSettingsSaving(true);
    setAdminError("");
    setAdminMessage("");

    try {
      const response =
        await axios.put(
          "/api/content/semester-settings",
          {
            semester: activeSemester,
            year: activeYear,
          },
          {
            withCredentials: true,
          },
        );

      setActiveLabel(
        response.data.settings.label,
      );

      setAdminMessage(
        `Active tab changed to ${response.data.settings.label}.`,
      );

      await fetchCount();
    } catch (error) {
      console.error(
        "Failed to save semester settings:",
        error,
      );

      setAdminError(
        "Failed to update semester and year.",
      );
    } finally {
      setSettingsSaving(false);
    }
  };

  const saveCount = async () => {
    setCountSaving(true);
    setAdminError("");
    setAdminMessage("");

    try {
      const semesterCount = Number(countInput);
      const allTimeCount = Number(
        totalCountInput,
      );

      if (
        !Number.isInteger(semesterCount) ||
        semesterCount < 0
      ) {
        setAdminError(
          "Semester count must be a non-negative whole number.",
        );
        return;
      }

      if (
        !Number.isInteger(allTimeCount) ||
        allTimeCount < 0
      ) {
        setAdminError(
          "All-time count must be a non-negative whole number.",
        );
        return;
      }

      const response =
        await axios.put(
          "/api/club-fair/count",
          {
            action: "set",
            count: semesterCount,
            totalCount: allTimeCount,
            semester: activeSemester,
            year: activeYear,
          },
          {
            withCredentials: true,
          },
        );

      setLiveCount(response.data.count);

      setAdminMessage(
        `Count saved for ${response.data.label}.`,
      );
    } catch (error) {
      console.error(
        "Failed to save Club Fair count:",
        error,
      );

      setAdminError(
        "Failed to save Club Fair count.",
      );
    } finally {
      setCountSaving(false);
    }
  };

  const resetCount = async () => {
    const confirmed = window.confirm(
      resetAllTime
        ? "Reset the selected semester count and the all-time count to zero?"
        : "Reset the selected semester count to zero?",
    );

    if (!confirmed) {
      return;
    }

    setCountResetting(true);
    setAdminError("");
    setAdminMessage("");

    try {
      const response =
        await axios.put(
          "/api/club-fair/count",
          {
            action: "reset",
            semester: activeSemester,
            year: activeYear,
            resetTotal: resetAllTime,
          },
          {
            withCredentials: true,
          },
        );

      setLiveCount(response.data.count);
      setCountInput(String(response.data.count));
      setTotalCountInput(
        String(response.data.totalCount),
      );

      setAdminMessage(
        resetAllTime
          ? "Current and all-time counts were reset to zero."
          : `The ${response.data.label} count was reset to zero.`,
      );
    } catch (error) {
      console.error(
        "Failed to reset Club Fair count:",
        error,
      );

      setAdminError(
        "Failed to reset Club Fair count.",
      );
    } finally {
      setCountResetting(false);
    }
  };

  const validateForm = () => {
    const requiredFields: [
      keyof typeof initialForm,
      string,
    ][] = [
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

    /*
     * Validate Facebook manually.
     * The field is text, not url, so the browser
     * will not show "Please enter a URL" before
     * our own validation runs.
     */
    if (!normalizeFacebookUrl(form.facebook)) {
      return "Enter a valid Facebook link, such as facebook.com/username or https://facebook.com/username.";
    }

    if (
      !form.email
        .trim()
        .toLowerCase()
        .endsWith("@g.bracu.ac.bd")
    ) {
      return "Please use a valid BRACU G-Suite email (@g.bracu.ac.bd).";
    }

    return "";
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setSubmitStatus({
      type: null,
      message: "",
    });

    const validationError =
      validateForm();

    if (validationError) {
      setSubmitStatus({
        type: "error",
        message: validationError,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedFacebook =
        normalizeFacebookUrl(
          form.facebook,
        );

      const response =
        await axios.post(
          "/api/club-fair/submit",
          {
            Name: form.name,
            StudentID: form.studentId,
            Address: form.address,
            Gender: form.gender,
            Religion: form.religion,
            Contact: form.contact,

            /*
             * Sends normalized URL:
             * facebook.com/name
             * becomes https://facebook.com/name
             */
            Facebook: normalizedFacebook,

            Department: form.department,
            Semester: form.semester,
            BloodGroup: form.bloodGroup,
            BloodDonation: form.bloodDonation,
            Email: form.email
              .trim()
              .toLowerCase(),
          },
          {
            withCredentials: true,
          },
        );

      setSubmitStatus({
        type: "success",
        message:
          response.data?.message ||
          "Registration submitted successfully.",
      });

      setForm(initialForm);

      await fetchCount();
    } catch (error) {
      console.error(
        "Club Fair submit error:",
        error,
      );

      setSubmitStatus({
        type: "error",
        message:
          "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="buac-gradient-bg min-h-screen px-4 py-20 font-poppins sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-14 text-center sm:mb-16">
          <h1 className="font-bebasNeue text-5xl tracking-wider text-text-secondary sm:text-7xl md:text-8xl">
            CLUB FAIR REGISTRATION
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-text-muted sm:text-lg md:text-xl">
            Meet BUAC at the Club Fair and take
            your first step into the world of
            adventure. Register below to stay
            connected.
          </p>
        </header>

        {auth && (
          <section className="mb-10 rounded-3xl border border-accent/30 bg-surface/70 p-5 shadow-xl backdrop-blur-md sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
                Admin Count Control
              </p>

              <h2 className="mt-1 font-bebasNeue text-3xl tracking-wide text-text-secondary">
                Manage Club Fair Count
              </h2>

              <p className="mt-1 text-xs text-text-muted">
                Set the active tab and reset
                the count after deleting records.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Active Semester
                </label>

                <CustomSelect
                  variant="surface"
                  value={activeSemester}
                  onChange={(value) =>
                    setActiveSemester(
                      value as
                        | "Spring"
                        | "Summer"
                        | "Fall",
                    )
                  }
                  options={activeSemesterOptions}
                  disabled={
                    settingsSaving ||
                    countSaving ||
                    countResetting
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Active Year
                </label>

                <CustomSelect
                  variant="surface"
                  value={activeYear}
                  onChange={setActiveYear}
                  options={yearOptions}
                  disabled={
                    settingsSaving ||
                    countSaving ||
                    countResetting
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Semester Count
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={countInput}
                  onChange={(event) =>
                    setCountInput(
                      event.target.value,
                    )
                  }
                  disabled={
                    settingsSaving ||
                    countSaving ||
                    countResetting
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  All-Time Count
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={totalCountInput}
                  onChange={(event) =>
                    setTotalCountInput(
                      event.target.value,
                    )
                  }
                  disabled={
                    settingsSaving ||
                    countSaving ||
                    countResetting
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs text-text-muted">
              <input
                type="checkbox"
                checked={resetAllTime}
                onChange={(event) =>
                  setResetAllTime(
                    event.target.checked,
                  )
                }
                disabled={
                  settingsSaving ||
                  countSaving ||
                  countResetting
                }
                className="h-4 w-4 accent-accent"
              />

              Reset the all-time count too
            </label>

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

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={saveActiveSemester}
                disabled={
                  settingsSaving ||
                  countSaving ||
                  countResetting
                }
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-accent px-5 py-3 text-sm font-bold text-accent transition hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaSave />

                {settingsSaving
                  ? "Saving Tab..."
                  : "Save Active Tab"}
              </button>

              <button
                type="button"
                onClick={resetCount}
                disabled={
                  settingsSaving ||
                  countSaving ||
                  countResetting
                }
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/40 px-5 py-3 text-sm font-bold text-red-500 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaUndo />

                {countResetting
                  ? "Resetting..."
                  : "Reset Count"}
              </button>

              <button
                type="button"
                onClick={saveCount}
                disabled={
                  settingsSaving ||
                  countSaving ||
                  countResetting
                }
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaSave />

                {countSaving
                  ? "Saving Count..."
                  : "Save Count"}
              </button>
            </div>
          </section>
        )}

        <motion.section
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
            {activeLabel ||
              `${activeSemester} ${activeYear}`}
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
            {liveCount !== null
              ? liveCount.toLocaleString()
              : "—"}
          </motion.div>
        </motion.section>

        <section className="mb-20">
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

        <section className="mb-16 rounded-2xl border border-accent/20 bg-accent/5 p-8 shadow-xl md:p-12">
          <h2 className="mb-6 font-bebasNeue text-3xl tracking-wider text-text-secondary md:text-4xl">
            What We&apos;re Looking For
          </h2>

          <div className="grid gap-6 text-text-muted md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-bebasNeue text-xl tracking-wide text-text-secondary">
                Essential Qualities
              </h3>

              <ul className="space-y-4">
                {essentialQualities.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2"
                  >
                    <span className="mt-1 text-accent">
                      ■
                    </span>

                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 font-bebasNeue text-xl tracking-wide text-text-secondary">
                Bonus Points
              </h3>

              <ul className="space-y-4">
                {bonusPoints.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2"
                  >
                    <span className="mt-1 text-accent">
                      ■
                    </span>

                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <p className="text-base leading-relaxed text-text-muted sm:text-lg">
                Discover your inner explorer and
                join BUAC on a journey of
                self-discovery! Immerse yourself
                in thrilling outdoor adventures,
                surrounded by breathtaking
                landscapes and eco-friendly
                initiatives.
              </p>

              <p className="mt-4 text-base text-text-muted sm:text-lg">
                Fill out the form below and dive
                into the excitement.
              </p>
            </div>

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
                    submitStatus.type ===
                    "success"
                      ? "border border-green-500/30 bg-green-500/10 text-green-500"
                      : "border border-red-500/30 bg-red-500/10 text-red-500"
                  }`}
                >
                  {submitStatus.message}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-muted">
                    Name <RequiredMark />
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateForm(
                        "name",
                        event.target.value,
                      )
                    }
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
                    onChange={(event) =>
                      updateForm(
                        "studentId",
                        event.target.value,
                      )
                    }
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
                    onChange={(event) =>
                      updateForm(
                        "address",
                        event.target.value,
                      )
                    }
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
                    onChange={(value) =>
                      updateForm(
                        "gender",
                        value,
                      )
                    }
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
                    onChange={(value) =>
                      updateForm(
                        "religion",
                        value,
                      )
                    }
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
                    onChange={(event) =>
                      updateForm(
                        "contact",
                        event.target.value,
                      )
                    }
                    placeholder="01XXXXXXXXX"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-text-muted">
                    Facebook Profile Link <RequiredMark />
                  </label>

                  {/* Important: type="text", not type="url" */}
                  <input
                    type="text"
                    inputMode="url"
                    value={form.facebook}
                    onChange={(event) =>
                      updateForm(
                        "facebook",
                        event.target.value,
                      )
                    }
                    placeholder="facebook.com/your.profile"
                    className={inputClass}
                  />

                  <p className="mt-1 text-xs text-text-muted">
                    You can enter facebook.com directly or include https://.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-text-muted">
                    University Department <RequiredMark />
                  </label>

                  <CustomSelect
                    value={form.department}
                    onChange={(value) =>
                      updateForm(
                        "department",
                        value,
                      )
                    }
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
                    onChange={(value) =>
                      updateForm(
                        "semester",
                        value,
                      )
                    }
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
                    onChange={(value) =>
                      updateForm(
                        "bloodGroup",
                        value,
                      )
                    }
                    options={bloodGroupOptions}
                    placeholder="Select Blood Group"
                    variant="surface"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-muted">
                    <FaTint className="text-red-500" />
                    Are you interested to donate blood?{" "}
                    <RequiredMark />
                  </label>

                  <div className="flex min-h-12 items-center gap-2 rounded-xl border border-input-border bg-input-bg p-2 sm:min-h-13">
                    {bloodDonationOptions.map(
                      (option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            updateForm(
                              "bloodDonation",
                              option,
                            )
                          }
                          className={`flex-1 cursor-pointer rounded-lg px-2 py-2 text-xs font-semibold transition ${
                            form.bloodDonation ===
                            option
                              ? option ===
                                "Yes"
                                ? "bg-green-500 text-white"
                                : option ===
                                    "Maybe"
                                  ? "bg-yellow-500 text-white"
                                  : "bg-red-500 text-white"
                              : "text-text-muted hover:bg-accent/10 hover:text-accent"
                          }`}
                        >
                          {option}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-text-muted">
                    G-Suite Email <RequiredMark />
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateForm(
                        "email",
                        event.target.value,
                      )
                    }
                    placeholder="yourname@g.bracu.ac.bd"
                    className={inputClass}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={{ scale: 0.97 }}
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
          </div>
        </section>

        <section className="rounded-2xl border border-accent/20 bg-accent/5 p-8 text-center shadow-xl sm:p-12">
          <h2 className="font-bebasNeue text-3xl tracking-wider text-text-secondary md:text-4xl">
            Questions About Club Fair?
          </h2>

          <p className="mx-auto mb-8 mt-4 max-w-2xl text-base text-text-muted sm:text-lg">
            Feel free to reach out to us if you
            have any questions about BUAC Club Fair
            registration.
          </p>

          <Link
            href="/contact"
            className="inline-block rounded-xl bg-accent px-8 py-4 font-bebasNeue text-xl tracking-wider text-white shadow-lg transition hover:scale-105 hover:bg-accent/90"
          >
            Contact Us
          </Link>
        </section>
      </div>
    </main>
  );
}