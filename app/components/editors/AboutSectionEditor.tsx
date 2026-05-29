"use client";
import React, { useState } from "react";
import axios from "axios";
import { useScrollLock } from "@/lib/scrollLockHelper";
import Image from "next/image";

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

export default function AboutSectionEditor({
  data,
  onClose,
}: AboutSectionEditorProps) {
  useScrollLock(true);
  const [quotes, setQuotes] = useState<Quote[]>(data.quotes || []);
  const [aboutText, setAboutText] = useState<string>(data.aboutText || "");
  const [stats, setStats] = useState<Stat[]>(
    data.stats || [
      { value: "200+", label: "Active Members" },
      { value: "100+", label: "Expeditions" },
      { value: "50+", label: "Locations" },
      { value: "9+", label: "Years Strong" },
    ],
  );
  const [saving, setSaving] = useState(false);

  // Quote handlers
  const updateQuote = (index: number, field: keyof Quote, value: string) => {
    const newQuotes = [...quotes];
    newQuotes[index] = { ...newQuotes[index], [field]: value };
    setQuotes(newQuotes);
  };

  const handleImageUpload = async (index: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/api/content/upload", formData);
      if (res.data.url) {
        updateQuote(index, "image", res.data.url);
      }
    } catch (err) {
      console.error("Failed to upload image", err);
    }
  };

  const addQuote = () => {
    setQuotes([...quotes, { name: "", designation: "", quote: "", image: "" }]);
  };

  const removeQuote = (index: number) => {
    setQuotes(quotes.filter((_, i) => i !== index));
  };

  // Stats handlers
  const updateStat = (index: number, field: keyof Stat, value: string) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setStats(newStats);
  };

  const addStat = () => {
    setStats([...stats, { value: "", label: "" }]);
  };

  const removeStat = (index: number) => {
    setStats(stats.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.post(
        "/api/content/about",
        { aboutText, stats, quotes },
        { withCredentials: true },
      );

      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Failed to save content", err);
      alert("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-background rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bebasNeue text-text-secondary">
          Edit About Section
        </h2>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-secondary text-2xl"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="border border-accent/30 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-accent mb-4">About Text</h3>
          <textarea
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            rows={5}
            className="w-full p-3 bg-text-secondary/5 border border-text-muted/20 rounded-lg text-text-secondary focus:outline-none focus:border-accent"
            placeholder="Enter about text..."
          />
        </div>

        <div className="border border-accent/30 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-accent">Quotes</h3>
            <button
              type="button"
              onClick={addQuote}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              Add Quote
            </button>
          </div>

          <div className="space-y-6">
            {quotes.map((quote, index) => (
              <div
                key={index}
                className="border border-text-muted/20 p-4 rounded-lg"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-semibold text-text-secondary">
                    Quote #{index + 1}
                  </h4>
                  {quotes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuote(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={quote.name}
                    onChange={(e) => updateQuote(index, "name", e.target.value)}
                    placeholder="Name"
                    className="w-full p-2 bg-text-secondary/5 border border-text-muted/20 rounded-lg text-text-secondary focus:outline-none focus:border-accent"
                  />
                  <input
                    type="text"
                    value={quote.designation}
                    onChange={(e) =>
                      updateQuote(index, "designation", e.target.value)
                    }
                    placeholder="Designation"
                    className="w-full p-2 bg-text-secondary/5 border border-text-muted/20 rounded-lg text-text-secondary focus:outline-none focus:border-accent"
                  />
                  <textarea
                    value={quote.quote}
                    onChange={(e) =>
                      updateQuote(index, "quote", e.target.value)
                    }
                    placeholder="Quote"
                    rows={3}
                    className="w-full p-2 bg-text-secondary/5 border border-text-muted/20 rounded-lg text-text-secondary focus:outline-none focus:border-accent"
                  />

                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(index, file);
                      }}
                      className="text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-accent file:text-white hover:file:bg-accent/90"
                    />
                    {quote.image && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                          src={quote.image}
                          alt="Preview"
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
        </div>

        <div className="border border-accent/30 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-accent">Statistics</h3>
            <button
              type="button"
              onClick={addStat}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              Add Stat
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="border border-text-muted/20 p-4 rounded-lg"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-text-secondary">
                    Stat #{index + 1}
                  </h4>
                  {stats.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStat(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStat(index, "value", e.target.value)}
                    placeholder="Value (e.g., 200+)"
                    className="w-full p-2 bg-text-secondary/5 border border-text-muted/20 rounded-lg text-text-secondary focus:outline-none focus:border-accent"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => updateStat(index, "label", e.target.value)}
                    placeholder="Label (e.g., Active Members)"
                    className="w-full p-2 bg-text-secondary/5 border border-text-muted/20 rounded-lg text-text-secondary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-text-muted/20 text-text-muted rounded-lg hover:border-text-secondary hover:text-text-secondary transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
