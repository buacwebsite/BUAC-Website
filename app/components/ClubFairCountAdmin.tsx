"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { FaSave, FaUndo } from "react-icons/fa";

interface CountResponse {
  count: number;
  totalCount: number;
  databaseRecords: number;
  semester: "Spring" | "Summer" | "Fall";
  year: string;
  label: string;
}

const semesterOptions = [
  "Spring",
  "Summer",
  "Fall",
] as const;

export default function ClubFairCountAdmin() {
  const [count, setCount] = useState("0");
  const [totalCount, setTotalCount] = useState("0");
  const [semester, setSemester] =
    useState<"Spring" | "Summer" | "Fall">("Spring");
  const [year, setYear] = useState(
    String(new Date().getFullYear()),
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetAllTime, setResetAllTime] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const years = Array.from(
    { length: 8 },
    (_, index) =>
      String(new Date().getFullYear() - 2 + index),
  );

  const loadCount = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await axios.get<CountResponse>(
          "/api/club-fair/count",
          { withCredentials: true },
        );

      setCount(String(response.data.count || 0));
      setTotalCount(
        String(response.data.totalCount || 0),
      );
      setSemester(response.data.semester);
      setYear(response.data.year);
    } catch (requestError) {
      console.error(
        "Failed to load Club Fair count:",
        requestError,
      );

      setError(
        "Unable to load Club Fair count.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCount();
  }, []);

  const saveCount = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const currentCount = Number(count);
      const currentTotal = Number(totalCount);

      if (
        !Number.isInteger(currentCount) ||
        currentCount < 0
      ) {
        setError(
          "Current count must be a non-negative whole number.",
        );
        return;
      }

      if (
        !Number.isInteger(currentTotal) ||
        currentTotal < 0
      ) {
        setError(
          "All-time count must be a non-negative whole number.",
        );
        return;
      }

      const response =
        await axios.put(
          "/api/club-fair/count",
          {
            action: "set",
            count: currentCount,
            totalCount: currentTotal,
            semester,
            year,
          },
          {
            withCredentials: true,
          },
        );

      setCount(String(response.data.count));
      setTotalCount(String(response.data.totalCount));
      setMessage(
        `Count saved for ${response.data.label}.`,
      );
    } catch (requestError) {
      console.error(
        "Failed to save Club Fair count:",
        requestError,
      );

      if (
        requestError instanceof AxiosError
      ) {
        setError(
          requestError.response?.data
            ?.error ||
            "Failed to save Club Fair count.",
        );
      } else {
        setError(
          "Failed to save Club Fair count.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const resetCount = async () => {
    const confirmed = window.confirm(
      resetAllTime
        ? "Reset both the selected semester count and the all-time count to zero?"
        : "Reset the selected semester count to zero?",
    );

    if (!confirmed) {
      return;
    }

    setResetting(true);
    setMessage("");
    setError("");

    try {
      const response =
        await axios.put(
          "/api/club-fair/count",
          {
            action: "reset",
            semester,
            year,
            resetTotal: resetAllTime,
          },
          {
            withCredentials: true,
          },
        );

      setCount(String(response.data.count));
      setTotalCount(String(response.data.totalCount));

      setMessage(
        resetAllTime
          ? "Current and all-time counts were reset to zero."
          : `The ${response.data.label} count was reset to zero.`,
      );
    } catch (requestError) {
      console.error(
        "Failed to reset Club Fair count:",
        requestError,
      );

      if (
        requestError instanceof AxiosError
      ) {
        setError(
          requestError.response?.data
            ?.error ||
            "Failed to reset Club Fair count.",
        );
      } else {
        setError(
          "Failed to reset Club Fair count.",
        );
      }
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-accent/30 bg-surface/70 p-6">
        <p className="animate-pulse text-sm text-text-muted">
          Loading count controls...
        </p>
      </div>
    );
  }

  return (
    <section className="mb-10 rounded-3xl border border-accent/30 bg-surface/70 p-5 shadow-xl backdrop-blur-md sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
          Admin Count Control
        </p>

        <h2 className="mt-1 font-bebasNeue text-3xl tracking-wide text-text-secondary">
          Manage Club Fair Count
        </h2>

        <p className="mt-1 text-xs text-text-muted">
          Set the displayed count or reset it after deleting submissions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
            Semester
          </label>

          <select
            value={semester}
            onChange={(event) =>
              setSemester(
                event.target.value as
                  | "Spring"
                  | "Summer"
                  | "Fall",
              )
            }
            disabled={saving || resetting}
            className="h-12 w-full rounded-xl border border-input-border bg-input-bg px-4 text-sm text-text-secondary outline-none focus:border-accent disabled:opacity-50"
          >
            {semesterOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
            Year
          </label>

          <select
            value={year}
            onChange={(event) =>
              setYear(event.target.value)
            }
            disabled={saving || resetting}
            className="h-12 w-full rounded-xl border border-input-border bg-input-bg px-4 text-sm text-text-secondary outline-none focus:border-accent disabled:opacity-50"
          >
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
            Semester Count
          </label>

          <input
            type="number"
            min="0"
            step="1"
            value={count}
            onChange={(event) =>
              setCount(event.target.value)
            }
            disabled={saving || resetting}
            className="h-12 w-full rounded-xl border border-input-border bg-input-bg px-4 text-sm text-text-secondary outline-none focus:border-accent disabled:opacity-50"
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
            value={totalCount}
            onChange={(event) =>
              setTotalCount(event.target.value)
            }
            disabled={saving || resetting}
            className="h-12 w-full rounded-xl border border-input-border bg-input-bg px-4 text-sm text-text-secondary outline-none focus:border-accent disabled:opacity-50"
          />
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs text-text-muted">
        <input
          type="checkbox"
          checked={resetAllTime}
          onChange={(event) =>
            setResetAllTime(event.target.checked)
          }
          disabled={saving || resetting}
          className="h-4 w-4 accent-accent"
        />
        Reset the all-time count too
      </label>

      {message && (
        <p className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-500">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={resetCount}
          disabled={saving || resetting}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/40 px-5 py-3 text-sm font-bold text-red-500 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaUndo />
          {resetting ? "Resetting..." : "Reset Count"}
        </button>

        <button
          type="button"
          onClick={saveCount}
          disabled={saving || resetting}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaSave />
          {saving ? "Saving..." : "Save Count"}
        </button>
      </div>
    </section>
  );
}