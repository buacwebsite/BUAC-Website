"use client";

import React, { useState } from "react";
import { HiOutlinePencilAlt, HiX, HiPlus, HiTrash } from "react-icons/hi";
import { HiOutlineBars3 } from "react-icons/hi2";
import axios from "axios";
import { useScrollLock } from "@/lib/scrollLockHelper";

interface TourImage { type: string; alt: string; url: string; }
interface Tour { id: number; name: string; subtitle: string; location: string; icon: string; elevation?: string; description?: string; visitCount: number; latestVisitYear: string; layoutType: "left" | "right"; gridLayout: string; images: TourImage[]; }
interface ToursEditorProps { data: Tour[]; onClose: () => void; }

function CompactReorderList({
  items,
  onReorder,
}: {
  items: Tour[];
  onReorder: (newItems: Tour[]) => void;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const handleDrop = (dropIdx: number) => {
    if (dragIdx === null || dragIdx === dropIdx) { setDragIdx(null); setOverIdx(null); return; }
    const copy = [...items]; const [moved] = copy.splice(dragIdx, 1); copy.splice(dropIdx, 0, moved);
    onReorder(copy); setDragIdx(null); setOverIdx(null);
  };

  return (
    <div className="mb-6 rounded-2xl border border-border bg-surface p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">Reorder Tours — drag to rearrange</h3>
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
            <span className="min-w-0 flex-1 truncate font-medium text-text-secondary">{item.name || `Tour ${idx + 1}`}{item.subtitle ? ` — ${item.subtitle}` : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ToursEditor({ data, onClose }: ToursEditorProps) {
  useScrollLock(true);
  const [tours, setTours] = useState<Tour[]>(data);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<{ tourIndex: number; imageIndex: number } | null>(null);

  const updateTour = (i: number, field: keyof Tour, value: string | number) => { const c = [...tours]; c[i] = { ...c[i], [field]: value }; setTours(c); };
  const updateImage = (ti: number, ii: number, field: keyof TourImage, value: string) => { const c = [...tours]; const imgs = [...c[ti].images]; imgs[ii] = { ...imgs[ii], [field]: value }; c[ti] = { ...c[ti], images: imgs }; setTours(c); };

  const handleImageUpload = async (ti: number, ii: number, file: File | null) => {
    if (!file) return;
    setUploadingImage({ tourIndex: ti, imageIndex: ii });
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await axios.post("/api/content/upload", fd, { withCredentials: true });
      if (res.data.url) updateImage(ti, ii, "url", res.data.url);
    } catch { alert("Failed to upload image"); } finally { setUploadingImage(null); }
  };

  const addTour = () => {
    setTours([...tours, { id: tours.length + 1, name: "NEW TOUR", subtitle: "", location: "Location", icon: "", elevation: "", visitCount: 1, latestVisitYear: String(new Date().getFullYear()), layoutType: "left", gridLayout: "standard", images: [{ type: "main", alt: "Image 1", url: "" }, { type: "small", alt: "Image 2", url: "" }, { type: "small", alt: "Image 3", url: "" }] }]);
  };

  const removeTour = (i: number) => { setTours(tours.filter((_, j) => j !== i)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await axios.put("/api/content/tours", { tours }, { withCredentials: true });
      alert("Tours updated!"); window.location.reload();
    } catch { alert("Failed to update tours"); } finally { setLoading(false); }
  };

  return (
    <div className="flex max-h-[85vh] min-h-[60vh] w-full flex-col overflow-hidden rounded-2xl bg-background">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-text-secondary"><HiOutlinePencilAlt className="text-accent" /> Edit Tours</h2>
        <button type="button" onClick={onClose} className="cursor-pointer text-text-muted hover:text-accent"><HiX size={24} /></button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <CompactReorderList items={tours} onReorder={setTours} />

          <div className="space-y-4 pb-4">
            {tours.map((tour, tourIndex) => (
              <div key={tour.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-accent">#{tourIndex + 1} — {tour.name || "Untitled"}</p>
                  <button type="button" onClick={() => removeTour(tourIndex)} className="cursor-pointer text-red-500 hover:text-red-700"><HiTrash size={18} /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div><label className="mb-1 block text-xs text-text-muted">Name</label><input type="text" value={tour.name} onChange={(e) => updateTour(tourIndex, "name", e.target.value)} className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-sm text-text-secondary outline-none focus:border-accent" /></div>
                  <div><label className="mb-1 block text-xs text-text-muted">Subtitle</label><input type="text" value={tour.subtitle} onChange={(e) => updateTour(tourIndex, "subtitle", e.target.value)} className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-sm text-text-secondary outline-none focus:border-accent" /></div>
                  <div><label className="mb-1 block text-xs text-text-muted">Location</label><input type="text" value={tour.location} onChange={(e) => updateTour(tourIndex, "location", e.target.value)} className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-sm text-text-secondary outline-none focus:border-accent" /></div>
                  <div><label className="mb-1 block text-xs text-text-muted">Elevation</label><input type="text" value={tour.elevation || ""} onChange={(e) => updateTour(tourIndex, "elevation", e.target.value)} className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-sm text-text-secondary outline-none focus:border-accent" /></div>
                  <div><label className="mb-1 block text-xs text-text-muted">Description</label><input type="text" value={tour.description || ""} onChange={(e) => updateTour(tourIndex, "description", e.target.value)} className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-sm text-text-secondary outline-none focus:border-accent" /></div>
                  <div><label className="mb-1 block text-xs text-text-muted">Visit Count</label><input type="number" value={tour.visitCount} onChange={(e) => updateTour(tourIndex, "visitCount", parseInt(e.target.value))} className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-sm text-text-secondary outline-none focus:border-accent" /></div>
                  <div><label className="mb-1 block text-xs text-text-muted">Latest Visit Year</label><input type="text" value={tour.latestVisitYear} onChange={(e) => updateTour(tourIndex, "latestVisitYear", e.target.value)} className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-sm text-text-secondary outline-none focus:border-accent" /></div>
                  <div><label className="mb-1 block text-xs text-text-muted">Grid Layout</label><select value={tour.gridLayout} onChange={(e) => updateTour(tourIndex, "gridLayout", e.target.value)} className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-sm text-text-secondary outline-none focus:border-accent"><option value="standard">Standard</option><option value="reversed">Reversed</option></select></div>
                </div>

                <div className="mt-3">
                  <label className="mb-1 block text-xs text-text-muted">Images (3)</label>
                  <div className="space-y-2">
                    {tour.images.slice(0, 3).map((img, imgIndex) => (
                      <div key={imgIndex} className="flex items-center gap-2 rounded-lg border border-border bg-background/50 p-2">
                        <span className="w-6 text-center text-xs text-text-muted">#{imgIndex + 1}</span>
                        <input type="text" placeholder="Alt text" value={img.alt} onChange={(e) => updateImage(tourIndex, imgIndex, "alt", e.target.value)} className="flex-1 rounded border border-input-border bg-input-bg px-2 py-1 text-xs text-text-secondary outline-none focus:border-accent" />
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(tourIndex, imgIndex, e.target.files?.[0] || null)} disabled={uploadingImage?.tourIndex === tourIndex && uploadingImage?.imageIndex === imgIndex} className="text-xs text-text-muted" />
                        {uploadingImage?.tourIndex === tourIndex && uploadingImage?.imageIndex === imgIndex ? <span className="text-xs text-accent">Uploading...</span> : img.url ? <span className="text-xs text-green-500">✓</span> : <span className="text-xs text-text-muted">—</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <button type="button" onClick={addTour} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent/40 py-3 text-sm font-semibold text-accent hover:bg-accent/10"><HiPlus size={20} /> Add New Tour</button>
          </div>
        </div>

        <div className="sticky bottom-0 z-20 border-t border-border bg-background px-6 py-4">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="cursor-pointer rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text-muted transition hover:text-accent">Cancel</button>
            <button type="submit" disabled={loading} className="cursor-pointer rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-50">{loading ? "Saving..." : "Save Changes"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}