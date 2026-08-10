"use client";

import React, { useState } from "react";
import axios from "axios";
import { useScrollLock } from "@/lib/scrollLockHelper";
import Image from "next/image";
import {
  HiOutlinePencilAlt,
  HiPlus,
  HiTrash,
  HiX,
  HiUpload,
} from "react-icons/hi";

interface Quote {
  name: string;
  designation: string;
  quote: string;
  image: string;
}

interface Stat {
  value: string;
  label: string;
}

interface AboutSectionData {
  quotes: Quote[];
  aboutText: string;
  stats: Stat[];
}

interface AboutSectionEditorProps {
  data: AboutSectionData;
  onClose: () => void;
}

const fallbackStats: Stat[] = [
  { value: "500+", label: "Active Members" },
  { value: "100+", label: "Expeditions" },
  { value: "50+", label: "Locations" },
  { value: "15+", label: "Years Strong" },
];

function normalizeQuote(input: Partial<Quote>): Quote {
  return {
    name: input.name || "",
    designation: input.designation || "",
    quote: input.quote || "",
    image: input.image || "",
  };
}

function normalizeStat(input: Partial<Stat>): Stat {
  return {
    value: input.value || "",
    label: input.label || "",
  };
}

export default function AboutSectionEditor({
  data,
  onClose,
}: AboutSectionEditorProps) {
  useScrollLock(true);

  const [quotes, setQuotes] = useState<Quote[]>(
    Array.isArray(data?.quotes)
      ? data.quotes.map((quote) => normalizeQuote(quote))
      : [],
  );

  const [aboutText, setAboutText] = useState<string>(
    data?.aboutText || "",
  );

  const [stats, setStats] = useState<Stat[]>(
    Array.isArray(data?.stats) && data.stats.length
      ? data.stats.map((stat) => normalizeStat(stat))
      : fallbackStats,
  );

  const [saving, setSaving] = useState(false);
  const [uploadingQuoteIndex, setUploadingQuoteIndex] =
    useState<number | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const updateQuote = (
    index: number,
    field: keyof Quote,
    value: string,
  ) => {
    setQuotes((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
  };

  const addQuote = () => {
    setError("");
    setSuccessMessage("");

    setQuotes((prev) => [
      ...prev,
      {
        name: "",
        designation: "",
        quote: "",
        image: "",
      },
    ]);
  };

  const removeQuote = (index: number) => {
    setError("");
    setSuccessMessage("");

    setQuotes((prev) =>
      prev.filter((_, quoteIndex) => quoteIndex !== index),
    );
  };

  const handleImageUpload = async (
    index: number,
    file: File | null,
  ) => {
    if (!file) return;

    setUploadingQuoteIndex(index);
    setError("");
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "/api/content/upload",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (!res.data?.url) {
        throw new Error("Image upload failed");
      }

      updateQuote(index, "image", res.data.url);
      setSuccessMessage("Image uploaded successfully.");
    } catch (err) {
      console.error("Failed to upload image", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploadingQuoteIndex(null);
    }
  };

  const updateStat = (
    index: number,
    field: keyof Stat,
    value: string,
  ) => {
    setStats((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
  };

  const addStat = () => {
    setStats((prev) => [
      ...prev,
      {
        value: "",
        label: "",
      },
    ]);
  };

  const removeStat = (index: number) => {
    setStats((prev) =>
      prev.filter((_, statIndex) => statIndex !== index),
    );
  };

  const validate = () => {
    const cleanedQuotes = quotes.filter(
      (quote) =>
        quote.name.trim() ||
        quote.designation.trim() ||
        quote.quote.trim() ||
        quote.image.trim(),
    );

    for (let index = 0; index < cleanedQuotes.length; index += 1) {
      const quote = cleanedQuotes[index];

      if (!quote.name.trim()) {
        return `Quote ${index + 1}: name is required.`;
      }

      if (!quote.quote.trim()) {
        return `Quote ${index + 1}: quote text is required.`;
      }
    }

    const cleanedStats = stats.filter(
      (stat) => stat.value.trim() || stat.label.trim(),
    );

    for (let index = 0; index < cleanedStats.length; index += 1) {
      const stat = cleanedStats[index];

      if (!stat.value.trim() || !stat.label.trim()) {
        return `Stat ${index + 1}: both value and label are required.`;
      }
    }

    return "";
  };

  const handleSubmit = async () => {
    setError("");
    setSuccessMessage("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    const cleanedQuotes = quotes
      .map((quote) => ({
        name: quote.name.trim(),
        designation: quote.designation.trim(),
        quote: quote.quote.trim(),
        image: quote.image.trim(),
      }))
      .filter(
        (quote) =>
          quote.name || quote.designation || quote.quote || quote.image,
      );

    const cleanedStats = stats
      .map((stat) => ({
        value: stat.value.trim(),
        label: stat.label.trim(),
      }))
      .filter((stat) => stat.value && stat.label);

    try {
      const res = await axios.post(
        "/api/content/about",
        {
          aboutText,
          stats: cleanedStats.length ? cleanedStats : fallbackStats,
          quotes: cleanedQuotes,
        },
        {
          withCredentials: true,
        },
      );

      if (res.status === 200) {
        setSuccessMessage("About section saved successfully.");
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 500);
      } else {
        setError("Failed to save about section.");
      }
    } catch (err) {
      console.error("Failed to save about content", err);
      setError("Failed to save about content. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex max-h-[85vh] min-h-[60vh] w-full flex-col overflow-hidden rounded-2xl bg-background">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-text-secondary">
          <HiOutlinePencilAlt className="text-accent" />
          Edit About Section
        </h2>

        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="cursor-pointer rounded-lg p-2 text-text-muted transition hover:bg-surface-secondary hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close about editor"
        >
          <HiX size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-500">
            {successMessage}
          </div>
        )}

        <div className="space-y-8 pb-4">
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="mb-4 font-bebasNeue text-3xl tracking-wide text-accent">
              About Text
            </h3>

            <textarea
              value={aboutText}
              onChange={(event) =>
                setAboutText(event.target.value)
              }
              rows={6}
              className="w-full resize-none rounded-xl border border-input-border bg-input-bg px-4 py-3 text-text-secondary outline-none placeholder:text-text-muted focus:border-accent"
              placeholder="Enter about text..."
            />
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bebasNeue text-3xl tracking-wide text-accent">
                  Words of Wisdom
                </h3>
                <p className="text-sm text-text-muted">
                  Add quotes, names, designations, and optional photos.
                </p>
              </div>

              <button
                type="button"
                onClick={addQuote}
                disabled={saving}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <HiPlus />
                Add Quote
              </button>
            </div>

            {quotes.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-accent/25 bg-accent/5 p-8 text-center">
                <p className="text-sm text-text-muted">
                  No quotes added yet. Click “Add Quote” to create one.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {quotes.map((quote, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border bg-background/40 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-text-secondary">
                        Quote {index + 1}
                      </h4>

                      <button
                        type="button"
                        onClick={() => removeQuote(index)}
                        disabled={saving}
                        className="cursor-pointer rounded-lg p-2 text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <HiTrash size={18} />
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-text-secondary">
                          Name
                        </label>
                        <input
                          value={quote.name}
                          onChange={(event) =>
                            updateQuote(index, "name", event.target.value)
                          }
                          className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-3 text-text-secondary outline-none placeholder:text-text-muted focus:border-accent"
                          placeholder="Person name"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-text-secondary">
                          Designation
                        </label>
                        <input
                          value={quote.designation}
                          onChange={(event) =>
                            updateQuote(
                              index,
                              "designation",
                              event.target.value,
                            )
                          }
                          className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-3 text-text-secondary outline-none placeholder:text-text-muted focus:border-accent"
                          placeholder="President, Advisor, etc."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-text-secondary">
                          Quote
                        </label>
                        <textarea
                          value={quote.quote}
                          onChange={(event) =>
                            updateQuote(index, "quote", event.target.value)
                          }
                          rows={4}
                          className="w-full resize-none rounded-xl border border-input-border bg-input-bg px-4 py-3 text-text-secondary outline-none placeholder:text-text-muted focus:border-accent"
                          placeholder="Write the quote..."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-text-secondary">
                          Photo
                        </label>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) =>
                            handleImageUpload(
                              index,
                              event.target.files?.[0] || null,
                            )
                          }
                          disabled={
                            saving || uploadingQuoteIndex === index
                          }
                          className="w-full rounded-xl border border-input-border bg-input-bg p-3 text-sm text-text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-accent/90 disabled:opacity-50"
                        />

                        {uploadingQuoteIndex === index && (
                          <p className="mt-2 text-xs text-accent">
                            Uploading photo...
                          </p>
                        )}

                        {quote.image && (
                          <div className="relative mt-4 h-40 w-full overflow-hidden rounded-xl border border-border bg-surface-secondary">
                            <Image
                              src={quote.image}
                              alt={quote.name || "Quote image"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bebasNeue text-3xl tracking-wide text-accent">
                  Statistics
                </h3>
                <p className="text-sm text-text-muted">
                  Add numeric highlights for the home page.
                </p>
              </div>

              <button
                type="button"
                onClick={addStat}
                disabled={saving}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <HiPlus />
                Add Stat
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-background/40 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-text-secondary">
                      Stat {index + 1}
                    </h4>

                    <button
                      type="button"
                      onClick={() => removeStat(index)}
                      disabled={saving || stats.length <= 1}
                      className="cursor-pointer rounded-lg p-2 text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <HiTrash size={18} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      value={stat.value}
                      onChange={(event) =>
                        updateStat(index, "value", event.target.value)
                      }
                      className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-3 text-text-secondary outline-none placeholder:text-text-muted focus:border-accent"
                      placeholder="Value, e.g. 500+"
                    />

                    <input
                      value={stat.label}
                      onChange={(event) =>
                        updateStat(index, "label", event.target.value)
                      }
                      className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-3 text-text-secondary outline-none placeholder:text-text-muted focus:border-accent"
                      placeholder="Label, e.g. Active Members"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-border bg-background px-6 py-4">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="cursor-pointer rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || uploadingQuoteIndex !== null}
            className="cursor-pointer rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : uploadingQuoteIndex !== null
                ? "Wait for Upload..."
                : "Save About Section"}
          </button>
        </div>
      </div>
    </div>
  );
}