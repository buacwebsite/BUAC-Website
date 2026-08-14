"use client";

import React, { useMemo, useState } from "react";
import {
  HiOutlinePencilAlt,
  HiX,
  HiPlus,
  HiTrash,
} from "react-icons/hi";
import { HiOutlineBars3 } from "react-icons/hi2";
import axios from "axios";
import { useScrollLock } from "@/lib/scrollLockHelper";
import Image from "next/image";

interface Activity {
  id: number;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
}

interface ActivitiesEditorProps {
  data: Activity[];
  onClose: () => void;
}

function CompactReorderList({
  items,
  onReorder,
  labelKey,
}: {
  items: { id: number; [key: string]: unknown }[];
  onReorder: (newItems: typeof items) => void;
  labelKey: string;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const handleDrop = (dropIdx: number) => {
    if (dragIdx === null || dragIdx === dropIdx) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }
    const copy = [...items];
    const [moved] = copy.splice(dragIdx, 1);
    copy.splice(dropIdx, 0, moved);
    onReorder(copy);
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div className="mb-6 rounded-2xl border border-border bg-surface p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">
        Reorder — drag to rearrange
      </h3>

      <div className="space-y-1.5">
        {items.map((item, idx) => (
          <div
            key={`reorder-${item.id}-${idx}`}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIdx(idx);
            }}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => {
              setDragIdx(null);
              setOverIdx(null);
            }}
            className={`flex cursor-grab items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-all active:cursor-grabbing ${
              overIdx === idx
                ? "border-accent bg-accent/10"
                : dragIdx === idx
                  ? "border-accent opacity-40"
                  : "border-border bg-background hover:border-accent/40"
            }`}
          >
            <HiOutlineBars3 className="h-4 w-4 shrink-0 text-accent" />

            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">
              {idx + 1}
            </span>

            <span className="min-w-0 flex-1 truncate font-medium text-text-secondary">
              {String(item[labelKey] || `Item ${idx + 1}`)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ActivitiesEditor({
  data,
  onClose,
}: ActivitiesEditorProps) {
  useScrollLock(true);

  const [activities, setActivities] = useState<Activity[]>(
    (data || []).map((item, index) => ({
      id: typeof item.id === "number" && item.id > 0 ? item.id : index + 1,
      name: item.name || "",
      description: item.description || "",
      category: item.category || "",
      imageUrl: item.imageUrl || "",
    })),
  );

  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const nextId = useMemo(
    () => activities.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    [activities],
  );

  const updateActivity = (index: number, field: keyof Activity, value: string) => {
    setActivities((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleImageUpload = async (index: number, file: File | null) => {
    if (!file) return;
    setUploadingIndex(index);
    setError("");
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post("/api/content/upload", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!response.data?.url) throw new Error("Upload failed");
      updateActivity(index, "imageUrl", response.data.url);
      setSuccessMessage("Image uploaded.");
    } catch {
      setError("Failed to upload image.");
    } finally {
      setUploadingIndex(null);
    }
  };

  const addActivity = () => {
    setActivities((prev) => [
      ...prev,
      { id: nextId, name: "", description: "", category: "", imageUrl: "" },
    ]);
  };

  const removeActivity = (index: number) => {
    setActivities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccessMessage("");

    for (let i = 0; i < activities.length; i++) {
      if (!activities[i].name.trim()) {
        setError(`Activity ${i + 1}: name is required.`);
        return;
      }
    }

    setLoading(true);

    try {
      const cleaned = activities.map((a, i) => ({
        id: a.id > 0 ? a.id : i + 1,
        name: a.name.trim(),
        description: a.description.trim(),
        category: a.category.trim(),
        imageUrl: a.imageUrl.trim(),
      }));

      await axios.put("/api/content/activities", { activities: cleaned }, { withCredentials: true });
      setSuccessMessage("Activities saved.");
      setTimeout(() => { onClose(); window.location.reload(); }, 500);
    } catch {
      setError("Failed to save activities.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex max-h-[85vh] min-h-[60vh] w-full flex-col overflow-hidden rounded-2xl bg-background">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-text-secondary">
          <HiOutlinePencilAlt className="text-accent" /> Edit Activities
        </h2>
        <button type="button" onClick={onClose} disabled={loading} className="cursor-pointer rounded-lg p-2 text-text-muted transition hover:text-accent disabled:opacity-50">
          <HiX size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}
        {successMessage && <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-500">{successMessage}</div>}

        <CompactReorderList
          items={activities as unknown as { id: number; [key: string]: unknown }[]}
          labelKey="name"
          onReorder={(newItems) => setActivities(newItems as unknown as Activity[])}
        />

        <div className="space-y-4 pb-4">
          {activities.map((activity, index) => (
            <div key={`${activity.id}-${index}`} className="rounded-2xl border border-border bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-accent">
                  #{index + 1} — {activity.name || "Untitled"}
                </p>
                <button type="button" onClick={() => removeActivity(index)} disabled={loading} className="cursor-pointer rounded-lg p-1.5 text-red-500 transition hover:bg-red-500/10 disabled:opacity-50">
                  <HiTrash size={18} />
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-secondary">Name</label>
                  <input type="text" value={activity.name} onChange={(e) => updateActivity(index, "name", e.target.value)} disabled={loading} className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-2.5 text-sm text-text-secondary outline-none focus:border-accent disabled:opacity-50" placeholder="Activity name" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-secondary">Category</label>
                  <input type="text" value={activity.category} onChange={(e) => updateActivity(index, "category", e.target.value)} disabled={loading} className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-2.5 text-sm text-text-secondary outline-none focus:border-accent disabled:opacity-50" placeholder="e.g. Training, Workshop" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-text-secondary">Description</label>
                  <textarea value={activity.description} onChange={(e) => updateActivity(index, "description", e.target.value)} disabled={loading} rows={3} className="w-full resize-none rounded-xl border border-input-border bg-input-bg px-4 py-2.5 text-sm text-text-secondary outline-none focus:border-accent disabled:opacity-50" placeholder="Short description" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-text-secondary">Image</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e.target.files?.[0] || null)} disabled={loading || uploadingIndex === index} className="w-full rounded-xl border border-input-border bg-input-bg p-2.5 text-sm text-text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-white disabled:opacity-50" />
                  {uploadingIndex === index && <p className="mt-1 text-xs text-accent">Uploading...</p>}
                  {activity.imageUrl && (
                    <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl border border-border">
                      <Image src={activity.imageUrl} alt={activity.name} fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={addActivity} disabled={loading} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent/40 px-4 py-3 text-sm font-semibold text-accent transition hover:bg-accent/10 disabled:opacity-50">
            <HiPlus /> Add New Activity
          </button>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-border bg-background px-6 py-4">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={loading} className="cursor-pointer rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text-muted transition hover:text-accent disabled:opacity-50">Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={loading || uploadingIndex !== null} className="cursor-pointer rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-50">
            {loading ? "Saving..." : uploadingIndex !== null ? "Wait for Upload..." : "Save Activities"}
          </button>
        </div>
      </div>
    </div>
  );
}