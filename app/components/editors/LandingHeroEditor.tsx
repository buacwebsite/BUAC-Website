"use client";

import React, { useEffect, useMemo, useState } from "react";
import { HiOutlinePencilAlt, HiPlus, HiTrash } from "react-icons/hi";
import { HiOutlineBars3 } from "react-icons/hi2";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import { useScrollLock } from "@/lib/scrollLockHelper";

interface HeroSlide {
  id: string;
  place: string;
  image: string | File;
  description: string;
  country: string;
  tag: string;
}

interface LandingHeroEditorProps {
  data: Partial<HeroSlide>[];
  onClose: () => void;
}

function slugify(v: string) { return v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

function norm(s: Partial<HeroSlide>, i: number): HeroSlide {
  return { id: s.id || `slide-${i + 1}`, place: s.place || "", image: s.image || "", description: s.description || "", country: s.country || "", tag: s.tag || "" };
}

function CompactReorderList({
  items,
  onReorder,
}: {
  items: HeroSlide[];
  onReorder: (newItems: HeroSlide[]) => void;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const handleDrop = (dropIdx: number) => {
    if (dragIdx === null || dragIdx === dropIdx) { setDragIdx(null); setOverIdx(null); return; }
    const copy = [...items];
    const [moved] = copy.splice(dragIdx, 1);
    copy.splice(dropIdx, 0, moved);
    onReorder(copy);
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div className="mb-6 rounded-2xl border border-border bg-surface p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">Reorder Slides — drag to rearrange</h3>
      <div className="space-y-1.5">
        {items.map((item, idx) => (
          <div
            key={`reorder-${item.id}-${idx}`}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => { e.preventDefault(); setOverIdx(idx); }}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
            className={`flex cursor-grab items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-all active:cursor-grabbing ${
              overIdx === idx ? "border-accent bg-accent/10" : dragIdx === idx ? "border-accent opacity-40" : "border-border bg-background hover:border-accent/40"
            }`}
          >
            <HiOutlineBars3 className="h-4 w-4 shrink-0 text-accent" />
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">{idx + 1}</span>
            <span className="min-w-0 flex-1 truncate font-medium text-text-secondary">{item.place || `Slide ${idx + 1}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingHeroEditor({ data, onClose }: LandingHeroEditorProps) {
  useScrollLock(true);

  const initial = useMemo(() => (data || []).map((s, i) => norm(s, i)), [data]);
  const [slides, setSlides] = useState<HeroSlide[]>(initial);
  const [saving, setSaving] = useState(false);
  const [loadingFresh, setLoadingFresh] = useState(true);
  const [error, setError] = useState("");
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("/api/content/landinghero");
        if (Array.isArray(res.data.images)) setSlides(res.data.images.map((s: Partial<HeroSlide>, i: number) => norm(s, i)));
      } catch {} finally { setLoadingFresh(false); }
    };
    load();
  }, []);

  const updateSlide = (i: number, field: keyof HeroSlide, value: string | File) => {
    const c = [...slides]; c[i] = { ...c[i], [field]: value };
    if (field === "place" && typeof value === "string") { const cur = c[i].id; if (!cur || cur.startsWith("slide-")) c[i].id = slugify(value) || `slide-${i + 1}`; }
    setSlides(c);
  };

  const addSlide = () => { setSlides([...slides, { id: `slide-${slides.length + 1}`, place: "", image: "", description: "", country: "", tag: "" }]); };
  const removeSlide = (i: number) => { if (slides.length <= 1) { setError("At least one slide is required."); return; } setSlides(slides.filter((_, j) => j !== i)); };

  const uploadIfNeeded = async (slide: HeroSlide, i: number): Promise<HeroSlide> => {
    if (!(slide.image instanceof File)) return slide;
    setUploadingIndex(i);
    const fd = new FormData(); fd.append("file", slide.image);
    const res = await axios.post("/api/content/upload", fd, { withCredentials: true });
    if (!res.data?.url) throw new Error(`Upload failed for slide ${i + 1}`);
    return { ...slide, image: res.data.url };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!slides.length) { setError("At least one slide is required."); return; }
    for (let i = 0; i < slides.length; i++) { if (!slides[i].place.trim()) { setError(`Slide ${i + 1}: place name is required.`); return; } }
    setSaving(true);
    try {
      const final = await Promise.all(slides.map((s, i) => uploadIfNeeded(s, i)));
      const cleaned = final.map((s, i) => ({ id: s.id || slugify(s.place) || `slide-${i + 1}`, place: s.place.trim(), image: typeof s.image === "string" ? s.image : "", description: s.description.trim(), country: s.country.trim(), tag: s.tag.trim() }));
      const res = await axios.put("/api/content/landinghero", { images: cleaned }, { withCredentials: true });
      if (res.status === 200) { onClose(); window.location.reload(); } else setError("Failed to update hero slides.");
    } catch (err) {
      if (err instanceof AxiosError) setError(err.response?.data?.error || "Failed to save.");
      else if (err instanceof Error) setError(err.message);
      else setError("Something went wrong.");
    } finally { setUploadingIndex(null); setSaving(false); }
  };

  const getPreview = (image: string | File) => image instanceof File ? URL.createObjectURL(image) : image;

  return (
    <div className="flex max-h-[85vh] min-h-[60vh] w-full flex-col overflow-hidden rounded-2xl bg-background">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-text-secondary"><HiOutlinePencilAlt className="text-accent" /> Edit Hero Slides</h2>
        <button type="button" onClick={onClose} disabled={saving} className="cursor-pointer text-2xl text-text-muted hover:text-accent disabled:opacity-50">×</button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loadingFresh && <div className="mb-4 rounded-lg border border-accent/20 bg-accent/5 p-3 text-sm text-text-muted">Loading latest saved hero content...</div>}
          {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}

          <CompactReorderList items={slides} onReorder={setSlides} />

          <div className="space-y-5 pb-4">
            {slides.map((slide, index) => {
              const preview = getPreview(slide.image);
              return (
                <div key={`${slide.id}-${index}`} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-accent">Slide {index + 1} — {slide.place || "Untitled"}</h4>
                    <button type="button" onClick={() => removeSlide(index)} disabled={saving} className="cursor-pointer rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-500/20 disabled:opacity-50"><HiTrash className="inline" /> Remove</button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div><label className="mb-1 block text-xs font-bold text-text-secondary">Place Name</label><input value={slide.place} disabled={saving} onChange={(e) => updateSlide(index, "place", e.target.value)} className="w-full rounded-lg border-2 border-input-border bg-input-bg p-2.5 text-sm focus:border-accent focus:outline-none disabled:opacity-60" placeholder="e.g. Bandarban" /></div>
                    <div><label className="mb-1 block text-xs font-bold text-text-secondary">Country / Location</label><input value={slide.country} disabled={saving} onChange={(e) => updateSlide(index, "country", e.target.value)} className="w-full rounded-lg border-2 border-input-border bg-input-bg p-2.5 text-sm focus:border-accent focus:outline-none disabled:opacity-60" placeholder="e.g. Bangladesh" /></div>
                    <div><label className="mb-1 block text-xs font-bold text-text-secondary">Tag</label><input value={slide.tag} disabled={saving} onChange={(e) => updateSlide(index, "tag", e.target.value)} className="w-full rounded-lg border-2 border-input-border bg-input-bg p-2.5 text-sm focus:border-accent focus:outline-none disabled:opacity-60" placeholder="e.g. Adventure" /></div>
                    <div><label className="mb-1 block text-xs font-bold text-text-secondary">Slide ID</label><input value={slide.id} disabled={saving} onChange={(e) => updateSlide(index, "id", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} className="w-full rounded-lg border-2 border-input-border bg-input-bg p-2.5 font-mono text-sm focus:border-accent focus:outline-none disabled:opacity-60" /></div>
                    <div className="md:col-span-2"><label className="mb-1 block text-xs font-bold text-text-secondary">Description</label><textarea value={slide.description} disabled={saving} onChange={(e) => updateSlide(index, "description", e.target.value)} rows={3} className="w-full resize-none rounded-lg border-2 border-input-border bg-input-bg p-2.5 text-sm focus:border-accent focus:outline-none disabled:opacity-60" placeholder="Hero slide description..." /></div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-bold text-text-secondary">Replace Image</label>
                      <input type="file" accept="image/*" disabled={saving} onChange={(e) => { const f = e.target.files?.[0]; if (f) updateSlide(index, "image", f); }} className="mb-2 w-full cursor-pointer file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-white hover:file:bg-accent/90 disabled:opacity-60" />
                      {uploadingIndex === index && <p className="mb-2 text-sm text-accent">Uploading image...</p>}
                      {preview ? (
                        <div className="relative h-36 w-full overflow-hidden rounded-xl border border-border bg-surface-secondary"><Image src={preview} width={900} height={360} alt={slide.place || "Hero preview"} className="h-full w-full object-cover" /></div>
                      ) : (
                        <div className="flex h-36 w-full items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-secondary text-sm text-text-muted">No image selected</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button type="button" onClick={addSlide} disabled={saving} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent/40 py-3 font-semibold text-accent hover:bg-accent/10 disabled:opacity-50"><HiPlus /> Add New Slide</button>
        </div>

        <div className="sticky bottom-0 z-20 border-t border-border bg-background px-6 py-4">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={saving} className="cursor-pointer rounded-lg border border-border px-6 py-3 font-medium text-text-muted hover:text-accent disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving} className="cursor-pointer rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent/90 disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}