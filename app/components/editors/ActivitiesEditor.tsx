"use client";

import React, { useMemo, useState } from "react";
import {
  HiOutlinePencilAlt,
  HiX,
  HiPlus,
  HiTrash,
} from "react-icons/hi";
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

function normalizeActivity(
  item: Partial<Activity>,
  index: number,
): Activity {
  return {
    id:
      typeof item.id === "number" && item.id > 0
        ? item.id
        : index + 1,
    name: item.name || "",
    description: item.description || "",
    category: item.category || "",
    imageUrl: item.imageUrl || "",
  };
}

export default function ActivitiesEditor({
  data,
  onClose,
}: ActivitiesEditorProps) {
  useScrollLock(true);

  const [activities, setActivities] = useState<Activity[]>(
    (data || []).map((item, index) =>
      normalizeActivity(item, index),
    ),
  );

  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] =
    useState<number | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const nextId = useMemo(() => {
    return (
      activities.reduce(
        (max, item) => Math.max(max, item.id),
        0,
      ) + 1
    );
  }, [activities]);

  const updateActivity = (
    index: number,
    field: keyof Activity,
    value: string,
  ) => {
    setActivities((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
  };

  const handleImageUpload = async (
    index: number,
    file: File | null,
  ) => {
    if (!file) return;

    setUploadingIndex(index);
    setError("");
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "/api/content/upload",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (!response.data?.url) {
        throw new Error("Upload failed");
      }

      updateActivity(index, "imageUrl", response.data.url);
      setSuccessMessage("Image uploaded successfully.");
    } catch (uploadError) {
      console.error("Failed to upload image:", uploadError);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploadingIndex(null);
    }
  };

  const addActivity = () => {
    setError("");
    setSuccessMessage("");

    setActivities((prev) => [
      ...prev,
      {
        id: nextId,
        name: "New Activity",
        description: "",
        category: "Event",
        imageUrl: "",
      },
    ]);
  };

  const removeActivity = (index: number) => {
    setActivities((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const validate = () => {
    for (let index = 0; index < activities.length; index += 1) {
      const activity = activities[index];

      if (!activity.name.trim()) {
        return `Activity ${index + 1}: name is required.`;
      }

      if (!activity.category.trim()) {
        return `Activity ${index + 1}: category is required.`;
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

    setLoading(true);

    const cleaned = activities.map((activity, index) => ({
      id:
        Number.isFinite(activity.id) && activity.id > 0
          ? activity.id
          : index + 1,
      name: activity.name.trim(),
      description: activity.description.trim(),
      category: activity.category.trim(),
      imageUrl: activity.imageUrl.trim(),
    }));

    try {
      const response = await axios.put(
        "/api/content/activities",
        { activities: cleaned },
        { withCredentials: true },
      );

      if (response.status === 200) {
        setSuccessMessage("Activities saved successfully.");
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 500);
      } else {
        setError("Failed to save activities.");
      }
    } catch (saveError) {
      console.error("Failed to update activities:", saveError);
      setError("Failed to save activities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex max-h-[85vh] min-h-[60vh] w-full flex-col overflow-hidden rounded-2xl bg-background">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-text-secondary">
          <HiOutlinePencilAlt className="text-accent" />
          Edit Activities
        </h2>

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="cursor-pointer rounded-lg p-2 text-text-muted transition hover:bg-surface-secondary hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close activities editor"
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

        <div className="space-y-6 pb-4">
          {activities.map((activity, index) => (
            <div
              key={`${activity.id}-${index}`}
              className="space-y-5 rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-accent">
                  Activity {index + 1}
                </p>

                <button
                  type="button"
                  onClick={() => removeActivity(index)}
                  disabled={loading}
                  className="cursor-pointer rounded-lg p-2 text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Remove activity ${index + 1}`}
                >
                  <HiTrash size={20} />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-secondary">
                    Name
                  </label>
                  <input
                    type="text"
                    value={activity.name}
                    onChange={(event) =>
                      updateActivity(index, "name", event.target.value)
                    }
                    disabled={loading}
                    className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-3 text-text-secondary outline-none placeholder:text-text-muted focus:border-accent disabled:opacity-50"
                    placeholder="Activity name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-secondary">
                    Category
                  </label>
                  <input
                    type="text"
                    value={activity.category}
                    onChange={(event) =>
                      updateActivity(index, "category", event.target.value)
                    }
                    disabled={loading}
                    className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-3 text-text-secondary outline-none placeholder:text-text-muted focus:border-accent disabled:opacity-50"
                    placeholder="e.g. Training, Event, Orientation"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-text-secondary">
                    Description
                  </label>
                  <textarea
                    value={activity.description}
                    onChange={(event) =>
                      updateActivity(
                        index,
                        "description",
                        event.target.value,
                      )
                    }
                    disabled={loading}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-input-border bg-input-bg px-4 py-3 text-text-secondary outline-none placeholder:text-text-muted focus:border-accent disabled:opacity-50"
                    placeholder="Short description of the activity"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-text-secondary">
                    Image
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
                    disabled={loading || uploadingIndex === index}
                    className="w-full rounded-xl border border-input-border bg-input-bg p-3 text-sm text-text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-accent/90 disabled:opacity-50"
                  />

                  {uploadingIndex === index && (
                    <p className="mt-2 text-xs text-accent">
                      Uploading image...
                    </p>
                  )}

                  {activity.imageUrl && (
                    <div className="relative mt-4 h-48 w-full overflow-hidden rounded-xl border border-border bg-surface-secondary">
                      <Image
                        src={activity.imageUrl}
                        alt={activity.name || "Activity image"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addActivity}
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent/40 px-4 py-3 text-sm font-semibold text-accent transition hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <HiPlus />
            Add New Activity
          </button>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-border bg-background px-6 py-4">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || uploadingIndex !== null}
            className="cursor-pointer rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : uploadingIndex !== null
                ? "Wait for Upload..."
                : "Save Activities"}
          </button>
        </div>
      </div>
    </div>
  );
}