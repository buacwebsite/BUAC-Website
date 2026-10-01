"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import axios from "axios";
import {
  HiOutlinePencilAlt,
  HiPlus,
  HiSave,
  HiTrash,
  HiX,
} from "react-icons/hi";

import { useAuth } from "@/app/context/AuthProvider";
import {
  formatPanelNumber,
  type PreviousPanel,
} from "@/lib/panelHistory";

interface PanelHistoryResponse {
  panels: PreviousPanel[];
}

interface PanelDraft {
  id: string;
  number: string;
  membersText: string;
}

const API_URL = "/api/content/panel-history";

const inputClass =
  "w-full rounded-xl border border-input-border bg-input-bg " +
  "px-4 py-3 text-sm text-text-secondary outline-none " +
  "transition focus:border-accent disabled:opacity-50";

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error;

    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}

export default function PreviousPanels() {
  const { auth } = useAuth();

  const [panels, setPanels] = useState<PreviousPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [drafts, setDrafts] = useState<PanelDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [message, setMessage] = useState("");

  const editing = auth && isEditing;

  /* ---------------- Load previous panels ---------------- */

  useEffect(() => {
    const controller = new AbortController();

    const loadPanels = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response =
          await axios.get<PanelHistoryResponse>(API_URL, {
            signal: controller.signal,
          });

        if (controller.signal.aborted) return;

        if (!Array.isArray(response.data.panels)) {
          throw new Error("Invalid panel history response.");
        }

        setPanels(response.data.panels);
      } catch (error) {
        if (
          controller.signal.aborted ||
          axios.isCancel(error)
        ) {
          return;
        }

        console.error("Failed to load previous panels:", error);

        setLoadError(
          getErrorMessage(
            error,
            "Unable to load previous panels. Please try again.",
          ),
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadPanels();

    return () => controller.abort();
  }, [reloadKey]);

  /* ---------------- Editor controls ---------------- */

  const startEditing = () => {
    setDrafts(
      panels.map((panel) => ({
        id: panel.id,
        number: String(panel.number),
        membersText: panel.members.join("\n"),
      })),
    );

    setSaveError("");
    setMessage("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (saving) return;

    setDrafts([]);
    setSaveError("");
    setIsEditing(false);
  };

  const updateDraft = (
    id: string,
    field: "number" | "membersText",
    value: string,
  ) => {
    setDrafts((previous) =>
      previous.map((panel) =>
        panel.id === id
          ? { ...panel, [field]: value }
          : panel,
      ),
    );
  };

  const addPanel = () => {
    if (saving) return;

    if (drafts.length >= 100) {
      setSaveError("You can add up to 100 panels.");
      return;
    }

    const nextNumber =
      Math.max(
        0,
        ...drafts.map((panel) => Number(panel.number) || 0),
      ) + 1;

    if (nextNumber > 999) {
      setSaveError("Panel numbers cannot exceed 999.");
      return;
    }

    const newPanel: PanelDraft = {
      id: `previous-panel-${crypto.randomUUID()}`,
      number: String(nextNumber),
      membersText: "",
    };

    setDrafts((previous) => [...previous, newPanel]);
    setSaveError("");
  };

  const removePanel = (id: string) => {
    if (saving) return;

    const confirmed = window.confirm(
      "Remove this panel? The change will only become permanent after you save.",
    );

    if (!confirmed) return;

    setDrafts((previous) =>
      previous.filter((panel) => panel.id !== id),
    );
  };

  /* ---------------- Save changes ---------------- */

  const handleSave = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!auth || saving) return;

    setSaveError("");
    setMessage("");

    const updatedPanels: PreviousPanel[] = drafts.map(
      (panel) => ({
        id: panel.id,
        number: Number(panel.number),
        members: panel.membersText
          .split(/\r?\n/)
          .map((name) => name.trim())
          .filter(Boolean),
      }),
    );

    for (const panel of updatedPanels) {
      if (
        !Number.isInteger(panel.number) ||
        panel.number < 1 ||
        panel.number > 999
      ) {
        setSaveError(
          "Every panel number must be a whole number between 1 and 999.",
        );
        return;
      }

      if (panel.members.length === 0) {
        setSaveError(
          `${formatPanelNumber(panel.number)} Panel needs at least one member.`,
        );
        return;
      }

      if (
        panel.members.length > 50 ||
        panel.members.some((name) => name.length > 150)
      ) {
        setSaveError(
          `${formatPanelNumber(panel.number)} Panel: use up to 50 names, with no more than 150 characters per name.`,
        );
        return;
      }
    }

    const uniqueNumbers = new Set(
      updatedPanels.map((panel) => panel.number),
    );

    if (uniqueNumbers.size !== updatedPanels.length) {
      setSaveError(
        "Panel numbers must be unique. Two panels cannot have the same number.",
      );
      return;
    }

    setSaving(true);

    try {
      const response =
        await axios.put<PanelHistoryResponse>(
          API_URL,
          { panels: updatedPanels },
          { withCredentials: true },
        );

      if (!Array.isArray(response.data.panels)) {
        throw new Error("Invalid save response.");
      }

      setPanels(response.data.panels);
      setDrafts([]);
      setIsEditing(false);
      setMessage("Previous panels saved successfully.");
    } catch (error) {
      console.error("Failed to save previous panels:", error);

      setSaveError(
        getErrorMessage(
          error,
          "Unable to save previous panels. Please try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- Display ---------------- */

  return (
    <section
      id="previous-panels"
      aria-labelledby="previous-panels-heading"
      className="mt-24 scroll-mt-28 border-t border-border pt-12 font-poppins"
    >
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-accent">
            BUAC Legacy
          </p>

          <h2
            id="previous-panels-heading"
            className="font-bebasNeue text-4xl leading-none tracking-wider text-text-secondary sm:text-5xl md:text-6xl"
          >
            Previous Panels
          </h2>
        </div>

        {auth && !loading && !loadError && !editing && (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 self-start rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <HiOutlinePencilAlt className="h-5 w-5" />
            Edit Previous Panels
          </button>
        )}
      </div>

      {message && (
        <p
          role="status"
          className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-500"
        >
          {message}
        </p>
      )}

      {loading ? (
        <div
          role="status"
          className="rounded-2xl border border-border bg-surface p-8 text-center"
        >
          <p className="animate-pulse text-sm text-text-muted">
            Loading previous panels...
          </p>
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center">
          <p role="alert" className="text-sm text-red-500">
            {loadError}
          </p>

          <button
            type="button"
            onClick={() =>
              setReloadKey((previous) => previous + 1)
            }
            className="mt-4 cursor-pointer rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
          >
            Try Again
          </button>
        </div>
      ) : editing ? (
        /* ================================================
           ADMIN EDITOR
        ================================================ */

        <form
          onSubmit={handleSave}
          className="rounded-3xl border border-accent/30 bg-surface/60 p-4 sm:p-6"
        >
          <p className="mb-6 text-sm leading-relaxed text-text-muted">
            Enter one member name per line. Panels are
            automatically sorted by panel number after saving.
          </p>

          {saveError && (
            <p
              role="alert"
              className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500"
            >
              {saveError}
            </p>
          )}

          <fieldset disabled={saving} className="min-w-0">
            <legend className="sr-only">
              Edit previous panel numbers and members
            </legend>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {drafts.map((panel, index) => (
                <div
                  key={panel.id}
                  className="min-w-0 rounded-2xl border border-border bg-background p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-text-secondary">
                      Panel Entry {index + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() => removePanel(panel.id)}
                      className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                      aria-label={`Remove panel entry ${index + 1}`}
                      title="Remove panel"
                    >
                      <HiTrash className="h-5 w-5" />
                    </button>
                  </div>

                  <label
                    htmlFor={`${panel.id}-number`}
                    className="mb-2 block text-xs font-semibold text-text-muted"
                  >
                    Panel Number
                  </label>

                  <input
                    id={`${panel.id}-number`}
                    type="number"
                    min="1"
                    max="999"
                    step="1"
                    required
                    value={panel.number}
                    onChange={(event) =>
                      updateDraft(
                        panel.id,
                        "number",
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  />

                  <label
                    htmlFor={`${panel.id}-members`}
                    className="mb-2 mt-4 block text-xs font-semibold text-text-muted"
                  >
                    Member Names — One Per Line
                  </label>

                  <textarea
                    id={`${panel.id}-members`}
                    required
                    rows={7}
                    maxLength={10000}
                    value={panel.membersText}
                    onChange={(event) =>
                      updateDraft(
                        panel.id,
                        "membersText",
                        event.target.value,
                      )
                    }
                    placeholder={"First member\nSecond member\nThird member"}
                    className={`${inputClass} resize-y leading-relaxed`}
                  />
                </div>
              ))}
            </div>

            {drafts.length === 0 && (
              <p className="rounded-xl border-2 border-dashed border-border p-6 text-center text-sm text-text-muted">
                No panels in this draft. Add a panel below,
                or save to clear the previous panels section.
              </p>
            )}

            <button
              type="button"
              onClick={addPanel}
              className="mt-6 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent/40 px-4 py-3 text-sm font-semibold text-accent transition hover:bg-accent/10 disabled:opacity-50"
            >
              <HiPlus className="h-5 w-5" />
              Add Another Panel
            </button>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-text-muted transition hover:border-accent hover:text-accent disabled:opacity-50"
              >
                <HiX className="h-5 w-5" />
                Cancel
              </button>

              <button
                type="submit"
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <HiSave className="h-5 w-5" />
                {saving ? "Saving..." : "Save Previous Panels"}
              </button>
            </div>
          </fieldset>
        </form>
      ) : panels.length > 0 ? (
        /* ================================================
           PUBLIC PANEL CARDS (4 IN A ROW ON DESKTOP)
        ================================================ */

        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {panels.map((panel) => (
            <li key={panel.id} className="min-w-0">
              <article className="relative h-full overflow-hidden rounded-2xl border border-border bg-surface/80 p-5 shadow-lg transition-colors hover:border-accent/40">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent to-orange-400"
                />

                <div className="mb-4 flex items-start justify-between gap-3 border-b border-border pb-3">
                  <h3 className="font-bebasNeue text-2xl leading-none tracking-wide text-accent sm:text-3xl">
                    {formatPanelNumber(panel.number)} Panel
                  </h3>

                  <span className="shrink-0 rounded-full border border-border bg-surface-secondary px-2 py-0.5 text-[10px] font-semibold text-text-muted">
                    {panel.members.length}{" "}
                    {panel.members.length === 1
                      ? "member"
                      : "members"}
                  </span>
                </div>

                <ul className="space-y-2.5">
                  {panel.members.map((name, index) => (
                    <li
                      key={`${panel.id}-${index}`}
                      className="flex items-start gap-2.5"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                      />

                      <span className="min-w-0 break-words text-xs leading-relaxed text-text-secondary sm:text-sm">
                        {name}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-accent/25 bg-accent/5 p-10 text-center">
          <p className="text-sm text-text-muted">
            {auth
              ? "No previous panels added. Click Edit Previous Panels to add them."
              : "Previous panel information will appear here soon."}
          </p>
        </div>
      )}
    </section>
  );
}