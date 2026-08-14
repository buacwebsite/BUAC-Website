"use client";

import React, { useMemo, useState } from "react";
import { HiOutlinePencilAlt, HiX, HiPlus, HiTrash, HiPlay } from "react-icons/hi";
import { HiOutlineBars3 } from "react-icons/hi2";
import { FaYoutube } from "react-icons/fa6";
import axios from "axios";
import { useScrollLock } from "@/lib/scrollLockHelper";

type GalleryItemType = "image" | "video";

interface GalleryItem {
  id: number;
  type: GalleryItemType;
  url: string;
  youtubeUrl: string;
}

interface GalleryEditorProps {
  data: GalleryItem[];
  onClose: () => void;
}

function getYouTubeId(value: string) {
  const input = value.trim();
  if (!input) return "";
  const direct = input.match(/^[a-zA-Z0-9_-]{11}$/);
  if (direct) return direct[0];
  const match = input.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] || "";
}

function getYouTubeThumbnail(url: string) {
  const id = getYouTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
}

function getItemLabel(item: GalleryItem, index: number) {
  if (item.type === "video") {
    const id = getYouTubeId(item.youtubeUrl);
    return id ? `Video — ${id}` : `Video ${index + 1}`;
  }
  if (item.url) {
    const parts = item.url.split("/");
    const filename = parts[parts.length - 1];
    return filename.length > 30 ? `${filename.slice(0, 28)}…` : filename;
  }
  return `Picture ${index + 1}`;
}

function CompactReorderList({
  items,
  onReorder,
  getLabel,
}: {
  items: GalleryItem[];
  onReorder: (newItems: GalleryItem[]) => void;
  getLabel: (item: GalleryItem, index: number) => string;
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
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">Reorder — drag to rearrange</h3>
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
            <span className={`mr-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${item.type === "video" ? "bg-red-500/15 text-red-500" : "bg-accent/15 text-accent"}`}>
              {item.type === "video" ? "Video" : "Pic"}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium text-text-secondary">{getLabel(item, idx)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GalleryEditor({ data, onClose }: GalleryEditorProps) {
  useScrollLock(true);

  const [items, setItems] = useState<GalleryItem[]>(
    (data || []).map((item, index) => ({
      id: typeof item.id === "number" && item.id > 0 ? item.id : index + 1,
      type: item.type === "video" ? "video" : "image",
      url: item.url || "",
      youtubeUrl: item.youtubeUrl || "",
    })),
  );

  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const nextId = useMemo(() => items.reduce((m, i) => Math.max(m, i.id), 0) + 1, [items]);

  const updateItem = (index: number, patch: Partial<GalleryItem>) => {
    setItems((prev) => { const c = [...prev]; c[index] = { ...c[index], ...patch }; return c; });
  };

  const changeItemType = (index: number, type: GalleryItemType) => {
    setItems((prev) => {
      const c = [...prev]; const cur = c[index];
      c[index] = { ...cur, type, url: type === "image" ? cur.url : "", youtubeUrl: type === "video" ? cur.youtubeUrl : "" };
      return c;
    });
  };

  const handleImageUpload = async (index: number, file: File | null) => {
    if (!file) return;
    setUploadingIndex(index); setError(""); setSuccessMessage("");
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await axios.post("/api/content/upload", fd, { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } });
      if (!res.data?.url) throw new Error("Upload failed");
      updateItem(index, { url: res.data.url });
      setSuccessMessage("Image uploaded.");
    } catch { setError("Failed to upload image."); } finally { setUploadingIndex(null); }
  };

  const addItem = (type: GalleryItemType) => { setItems((p) => [...p, { id: nextId, type, url: "", youtubeUrl: "" }]); };
  const removeItem = (index: number) => { setItems((p) => p.filter((_, i) => i !== index)); };

  const handleSubmit = async () => {
    setError(""); setSuccessMessage("");
    for (let i = 0; i < items.length; i++) {
      if (items[i].type === "image" && !items[i].url?.trim()) { setError(`Picture ${i + 1} needs an image.`); return; }
      if (items[i].type === "video" && !getYouTubeId(items[i].youtubeUrl)) { setError(`Video ${i + 1} needs a valid YouTube URL.`); return; }
    }
    setLoading(true);
    try {
      const cleaned = items.map((it, i) => ({ id: it.id > 0 ? it.id : i + 1, type: it.type, url: it.type === "image" ? it.url.trim() : "", youtubeUrl: it.type === "video" ? it.youtubeUrl.trim() : "" }));
      await axios.put("/api/content/gallery", { images: cleaned }, { withCredentials: true });
      setSuccessMessage("Gallery saved.");
      setTimeout(() => { onClose(); window.location.reload(); }, 500);
    } catch { setError("Failed to save gallery."); } finally { setLoading(false); }
  };

  return (
    <div className="flex max-h-[85vh] min-h-[60vh] w-full flex-col overflow-hidden rounded-2xl bg-background">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-text-secondary"><HiOutlinePencilAlt className="text-accent" /> Edit Gallery</h2>
        <button type="button" onClick={onClose} disabled={loading} className="cursor-pointer rounded-lg p-2 text-text-muted transition hover:text-accent disabled:opacity-50"><HiX size={24} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}
        {successMessage && <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-500">{successMessage}</div>}

        <CompactReorderList items={items} onReorder={setItems} getLabel={getItemLabel} />

        <div className="space-y-4 pb-4">
          {items.map((item, index) => {
            const thumb = item.type === "video" ? getYouTubeThumbnail(item.youtubeUrl) : "";
            return (
              <div key={`${item.id}-${index}`} className="rounded-2xl border border-border bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-accent">#{index + 1} — {item.type === "video" ? "YouTube Video" : "Picture"}</p>
                  <button type="button" onClick={() => removeItem(index)} disabled={loading} className="cursor-pointer rounded-lg p-1.5 text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"><HiTrash size={18} /></button>
                </div>

                <div className="mb-3">
                  <label className="mb-1 block text-xs font-semibold text-text-secondary">Category</label>
                  <select value={item.type} onChange={(e) => changeItemType(index, e.target.value as GalleryItemType)} disabled={loading} className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-2.5 text-sm text-text-secondary outline-none focus:border-accent disabled:opacity-50">
                    <option value="image">Picture</option>
                    <option value="video">YouTube Video</option>
                  </select>
                </div>

                {item.type === "image" ? (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-text-secondary">Upload Picture</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e.target.files?.[0] || null)} disabled={loading || uploadingIndex === index} className="w-full rounded-xl border border-input-border bg-input-bg p-2.5 text-sm text-text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-white disabled:opacity-50" />
                    {uploadingIndex === index && <p className="mt-1 text-xs text-accent">Uploading...</p>}
                    {item.url && <div className="mt-2 overflow-hidden rounded-xl border border-border"><img src={item.url} alt="Preview" className="h-32 w-full object-cover" /></div>}
                  </div>
                ) : (
                  <div>
                    <label className="mb-1 flex items-center gap-2 text-xs font-semibold text-text-secondary"><FaYoutube className="text-red-500" /> YouTube URL</label>
                    <input type="url" value={item.youtubeUrl} onChange={(e) => updateItem(index, { youtubeUrl: e.target.value })} disabled={loading} placeholder="https://www.youtube.com/watch?v=..." className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-2.5 text-sm text-text-secondary outline-none placeholder:text-text-muted focus:border-accent disabled:opacity-50" />
                    {thumb ? (
                      <div className="relative mt-2 overflow-hidden rounded-xl border border-border"><img src={thumb} alt="YouTube thumbnail" className="aspect-video w-full object-cover" /><div className="absolute inset-0 flex items-center justify-center"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-xl"><HiPlay className="ml-0.5 h-6 w-6" /></span></div></div>
                    ) : <p className="mt-1 text-xs text-text-muted">Enter a valid YouTube URL to preview.</p>}
                  </div>
                )}
              </div>
            );
          })}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => addItem("image")} disabled={loading} className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent/40 px-4 py-3 text-sm font-semibold text-accent transition hover:bg-accent/10 disabled:opacity-50"><HiPlus /> Add Picture</button>
            <button type="button" onClick={() => addItem("video")} disabled={loading} className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-red-500/40 px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"><FaYoutube /> Add YouTube Video</button>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-border bg-background px-6 py-4">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={loading} className="cursor-pointer rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text-muted transition hover:text-accent disabled:opacity-50">Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={loading || uploadingIndex !== null} className="cursor-pointer rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-50">
            {loading ? "Saving..." : uploadingIndex !== null ? "Wait for Upload..." : "Save Gallery"}
          </button>
        </div>
      </div>
    </div>
  );
}