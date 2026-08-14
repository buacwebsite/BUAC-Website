"use client";

import React, { useState } from "react";
import axios from "axios";
import { useScrollLock } from "@/lib/scrollLockHelper";
import Image from "next/image";
import { HiOutlinePencilAlt, HiPlus, HiTrash, HiX } from "react-icons/hi";
import { HiOutlineBars3 } from "react-icons/hi2";

interface Quote { name: string; designation: string; quote: string; image: string; }
interface Stat { value: string; label: string; }
interface AboutSectionData { quotes: Quote[]; aboutText: string; stats: Stat[]; }
interface AboutSectionEditorProps { data: AboutSectionData; onClose: () => void; }

function CompactReorderList<T extends Record<string, unknown>>({
  items,
  onReorder,
  getLabel,
}: {
  items: T[];
  onReorder: (newItems: T[]) => void;
  getLabel: (item: T, index: number) => string;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const handleDrop = (dropIdx: number) => {
    if (dragIdx === null || dragIdx === dropIdx) { setDragIdx(null); setOverIdx(null); return; }
    const copy = [...items]; const [moved] = copy.splice(dragIdx, 1); copy.splice(dropIdx, 0, moved);
    onReorder(copy); setDragIdx(null); setOverIdx(null);
  };

  if (items.length < 2) return null;

  return (
    <div className="mb-4 rounded-2xl border border-border bg-surface p-3">
      <h4 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-accent">Reorder — drag to rearrange</h4>
      <div className="space-y-1">
        {items.map((item, idx) => (
          <div
            key={`ro-${idx}`}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => { e.preventDefault(); setOverIdx(idx); }}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
            className={`flex cursor-grab items-center gap-2.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all active:cursor-grabbing ${
              overIdx === idx ? "border-accent bg-accent/10" : dragIdx === idx ? "border-accent opacity-40" : "border-border bg-background hover:border-accent/40"
            }`}
          >
            <HiOutlineBars3 className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[8px] font-bold text-accent">{idx + 1}</span>
            <span className="min-w-0 flex-1 truncate font-medium text-text-secondary">{getLabel(item, idx)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AboutSectionEditor({ data, onClose }: AboutSectionEditorProps) {
  useScrollLock(true);

  const [quotes, setQuotes] = useState<Quote[]>(
    Array.isArray(data?.quotes) ? data.quotes.map((q) => ({ name: q.name || "", designation: q.designation || "", quote: q.quote || "", image: q.image || "" })) : [],
  );
  const [aboutText, setAboutText] = useState(data?.aboutText || "");
  const [stats, setStats] = useState<Stat[]>(
    Array.isArray(data?.stats) && data.stats.length ? data.stats.map((s) => ({ value: s.value || "", label: s.label || "" })) : [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }],
  );

  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateQuote = (i: number, f: keyof Quote, v: string) => { setQuotes((p) => { const c = [...p]; c[i] = { ...c[i], [f]: v }; return c; }); };
  const addQuote = () => { setQuotes((p) => [...p, { name: "", designation: "", quote: "", image: "" }]); };
  const removeQuote = (i: number) => { setQuotes((p) => p.filter((_, j) => j !== i)); };

  const handleImageUpload = async (i: number, file: File | null) => {
    if (!file) return;
    setUploadingIdx(i); setError(""); setSuccess("");
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await axios.post("/api/content/upload", fd, { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } });
      if (res.data?.url) { updateQuote(i, "image", res.data.url); setSuccess("Image uploaded."); }
    } catch { setError("Image upload failed."); } finally { setUploadingIdx(null); }
  };

  const updateStat = (i: number, f: keyof Stat, v: string) => { setStats((p) => { const c = [...p]; c[i] = { ...c[i], [f]: v }; return c; }); };
  const addStat = () => { setStats((p) => [...p, { value: "", label: "" }]); };
  const removeStat = (i: number) => { setStats((p) => p.filter((_, j) => j !== i)); };

  const handleSubmit = async () => {
    setError(""); setSuccess(""); setSaving(true);
    const cq = quotes.map((q) => ({ name: q.name.trim(), designation: q.designation.trim(), quote: q.quote.trim(), image: q.image.trim() })).filter((q) => q.name || q.quote || q.image);
    const cs = stats.map((s) => ({ value: s.value.trim(), label: s.label.trim() })).filter((s) => s.value && s.label);
    try {
      await axios.post("/api/content/about", { aboutText, stats: cs, quotes: cq }, { withCredentials: true });
      setSuccess("Saved."); setTimeout(() => { onClose(); window.location.reload(); }, 500);
    } catch { setError("Failed to save."); } finally { setSaving(false); }
  };

  return (
    <div className="flex max-h-[85vh] min-h-[60vh] w-full flex-col overflow-hidden rounded-2xl bg-background">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-text-secondary"><HiOutlinePencilAlt className="text-accent" /> Edit About Section</h2>
        <button type="button" onClick={onClose} disabled={saving} className="cursor-pointer rounded-lg p-2 text-text-muted transition hover:text-accent disabled:opacity-50"><HiX size={24} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-500">{success}</div>}

        <section className="mb-8 rounded-2xl border border-border bg-surface p-5">
          <h3 className="mb-3 font-bebasNeue text-3xl tracking-wide text-accent">About Text</h3>
          <textarea value={aboutText} onChange={(e) => setAboutText(e.target.value)} rows={5} className="w-full resize-none rounded-xl border border-input-border bg-input-bg px-4 py-3 text-text-secondary outline-none focus:border-accent" placeholder="Enter about text..." />
        </section>

        <section className="mb-8 rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bebasNeue text-3xl tracking-wide text-accent">Quotes</h3>
            <button type="button" onClick={addQuote} disabled={saving} className="flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50"><HiPlus /> Add Quote</button>
          </div>

          <CompactReorderList
            items={quotes as unknown as Record<string, unknown>[]}
            onReorder={(newItems) => setQuotes(newItems as unknown as Quote[])}
            getLabel={(item, i) => String(item.name || `Quote ${i + 1}`)}
          />

          {quotes.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-accent/25 bg-accent/5 p-6 text-center text-sm text-text-muted">No quotes yet.</div>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote, index) => (
                <div key={index} className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Quote #{index + 1}</h4>
                    <button type="button" onClick={() => removeQuote(index)} disabled={saving} className="cursor-pointer rounded-lg p-1.5 text-red-500 hover:bg-red-500/10 disabled:opacity-50"><HiTrash size={16} /></button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input value={quote.name} onChange={(e) => updateQuote(index, "name", e.target.value)} className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-2.5 text-sm text-text-secondary outline-none focus:border-accent" placeholder="Name" />
                    <input value={quote.designation} onChange={(e) => updateQuote(index, "designation", e.target.value)} className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-2.5 text-sm text-text-secondary outline-none focus:border-accent" placeholder="Designation" />
                    <textarea value={quote.quote} onChange={(e) => updateQuote(index, "quote", e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-input-border bg-input-bg px-4 py-2.5 text-sm text-text-secondary outline-none focus:border-accent md:col-span-2" placeholder="Quote text" />
                    <div className="md:col-span-2">
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e.target.files?.[0] || null)} disabled={saving || uploadingIdx === index} className="w-full rounded-xl border border-input-border bg-input-bg p-2.5 text-sm text-text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-white disabled:opacity-50" />
                      {uploadingIdx === index && <p className="mt-1 text-xs text-accent">Uploading...</p>}
                      {quote.image && <div className="relative mt-2 h-28 w-full overflow-hidden rounded-xl border border-border"><Image src={quote.image} alt={quote.name || "Quote"} fill className="object-cover" /></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-4 rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bebasNeue text-3xl tracking-wide text-accent">Statistics</h3>
            <button type="button" onClick={addStat} disabled={saving} className="flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50"><HiPlus /> Add Stat</button>
          </div>

          <CompactReorderList
            items={stats as unknown as Record<string, unknown>[]}
            onReorder={(newItems) => setStats(newItems as unknown as Stat[])}
            getLabel={(item, i) => `${String(item.value || "?")} — ${String(item.label || `Stat ${i + 1}`)}`}
          />

          <div className="grid gap-3 md:grid-cols-2">
            {stats.map((stat, index) => (
              <div key={index} className="rounded-xl border border-border bg-background/40 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-text-secondary">Stat #{index + 1}</h4>
                  <button type="button" onClick={() => removeStat(index)} disabled={saving || stats.length <= 1} className="cursor-pointer rounded-lg p-1 text-red-500 hover:bg-red-500/10 disabled:opacity-30"><HiTrash size={14} /></button>
                </div>
                <div className="space-y-2">
                  <input value={stat.value} onChange={(e) => updateStat(index, "value", e.target.value)} className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-sm text-text-secondary outline-none focus:border-accent" placeholder="Value, e.g. 500+" />
                  <input value={stat.label} onChange={(e) => updateStat(index, "label", e.target.value)} className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-sm text-text-secondary outline-none focus:border-accent" placeholder="Label, e.g. Active Members" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-border bg-background px-6 py-4">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={saving} className="cursor-pointer rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text-muted transition hover:text-accent disabled:opacity-50">Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={saving || uploadingIdx !== null} className="cursor-pointer rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-50">
            {saving ? "Saving..." : uploadingIdx !== null ? "Wait for Upload..." : "Save About Section"}
          </button>
        </div>
      </div>
    </div>
  );
}