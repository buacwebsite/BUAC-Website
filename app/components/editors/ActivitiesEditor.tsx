"use client";
import React, { useState } from "react";
import { HiOutlinePencilAlt, HiX, HiPlus, HiTrash } from "react-icons/hi";
import axios from "axios";
import { useScrollLock } from "@/lib/scrollLockHelper";
import Image from "next/image";

interface Activity {
  id: number;
  slug: string;
  name: string;
  description: string;
  date: string;
  category: string;
  imageUrl: string;
  images: string[];
  content: string;
}

interface ActivitiesEditorProps {
  data: Activity[];
  onClose: () => void;
}

export default function ActivitiesEditor({
  data,
  onClose,
}: ActivitiesEditorProps) {
  useScrollLock(true);
  const dataWithSlugs = data.map((activity) => ({
    ...activity,
    slug:
      activity.slug ||
      activity.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
  }));
  const [activities, setActivities] = useState<Activity[]>(dataWithSlugs);
  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadingSliderImage, setUploadingSliderImage] = useState<{
    activityIndex: number;
    imageIndex: number;
  } | null>(null);

  const updateActivity = (
    index: number,
    field: keyof Activity,
    value: string | number,
  ) => {
    const copy = [...activities];
    copy[index] = { ...copy[index], [field]: value };
    setActivities(copy);
  };

  const handleImageUpload = async (index: number, file: File | null) => {
    if (!file) return;

    setUploadingIndex(index);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/content/upload", formData, {
        withCredentials: true,
      });

      if (response.data.url) {
        updateActivity(index, "imageUrl", response.data.url);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSliderImageUpload = async (
    activityIndex: number,
    imageIndex: number,
    file: File | null,
  ) => {
    if (!file) return;

    setUploadingSliderImage({ activityIndex, imageIndex });
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/content/upload", formData, {
        withCredentials: true,
      });

      if (response.data.url) {
        const copy = [...activities];
        const images = [...(copy[activityIndex].images || [])];
        images[imageIndex] = response.data.url;
        copy[activityIndex] = { ...copy[activityIndex], images };
        setActivities(copy);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingSliderImage(null);
    }
  };

  const addSliderImage = (activityIndex: number) => {
    const copy = [...activities];
    const images = [...(copy[activityIndex].images || [])];
    images.push("");
    copy[activityIndex] = { ...copy[activityIndex], images };
    setActivities(copy);
  };

  const removeSliderImage = (activityIndex: number, imageIndex: number) => {
    const copy = [...activities];
    const images = [...(copy[activityIndex].images || [])];
    images.splice(imageIndex, 1);
    copy[activityIndex] = { ...copy[activityIndex], images };
    setActivities(copy);
  };

  const addActivity = () => {
    const newActivity: Activity = {
      id: activities.length + 1,
      slug: "new-activity",
      name: "New Activity",
      description: "Description of the activity",
      date: "TBD, 2026",
      category: "Event",
      imageUrl: "",
      images: [],
      content: "",
    };
    setActivities([...activities, newActivity]);
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        "/api/content/activities",
        { activities },
        {
          withCredentials: true,
        },
      );
      alert("Activities updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Failed to update activities:", error);
      alert("Failed to update activities");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-background pb-4 border-b border-text-muted/20">
        <h2 className="text-2xl font-bold text-text-secondary flex items-center gap-2">
          <HiOutlinePencilAlt /> Edit Activities
        </h2>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          <HiX size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="border border-text-muted/20 rounded-lg p-4 space-y-4"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-text-secondary">
                Activity #{index + 1}
              </h3>
              <button
                type="button"
                onClick={() => removeActivity(index)}
                className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
              >
                <HiTrash size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-text-muted mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={activity.name}
                  onChange={(e) =>
                    updateActivity(index, "name", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-background border border-text-muted/30 rounded text-text-secondary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={activity.slug}
                  onChange={(e) =>
                    updateActivity(
                      index,
                      "slug",
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                    )
                  }
                  placeholder="e.g., bootcamp, mountain-marathon"
                  className="w-full px-3 py-2 bg-background border border-text-muted/30 rounded text-text-secondary focus:outline-none focus:border-accent font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={activity.category}
                  onChange={(e) =>
                    updateActivity(index, "category", e.target.value)
                  }
                  placeholder="e.g., Training, Orientation, National Event"
                  className="w-full px-3 py-2 bg-background border border-text-muted/30 rounded text-text-secondary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-text-muted mb-1">
                  Description
                </label>
                <textarea
                  value={activity.description}
                  onChange={(e) =>
                    updateActivity(index, "description", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-text-muted/30 rounded text-text-secondary focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-text-muted mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={activity.date}
                  onChange={(e) =>
                    updateActivity(index, "date", e.target.value)
                  }
                  placeholder="e.g., March 15-17, 2026"
                  className="w-full px-3 py-2 bg-background border border-text-muted/30 rounded text-text-secondary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-text-muted mb-2">
                Thumbnail Image
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageUpload(index, e.target.files?.[0] || null)
                  }
                  disabled={uploadingIndex === index}
                  className="text-sm text-text-muted flex-1"
                />
                {uploadingIndex === index ? (
                  <span className="text-sm text-accent">Uploading...</span>
                ) : activity.imageUrl ? (
                  <span className="text-sm text-green-500">✓ Uploaded</span>
                ) : (
                  <span className="text-sm text-text-muted">No image</span>
                )}
              </div>
              {activity.imageUrl && (
                <div className="mt-2 relative h-32 w-full rounded overflow-hidden">
                  <Image
                    src={activity.imageUrl}
                    alt={activity.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm text-text-muted mb-2">
                Slider Images
              </label>
              <div className="space-y-2">
                {(activity.images || []).map((img, imgIndex) => (
                  <div
                    key={imgIndex}
                    className="flex gap-2 items-center bg-background/50 p-2 rounded border border-text-muted/10"
                  >
                    <span className="text-xs text-text-muted w-8">
                      #{imgIndex + 1}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleSliderImageUpload(
                          index,
                          imgIndex,
                          e.target.files?.[0] || null,
                        )
                      }
                      disabled={
                        uploadingSliderImage?.activityIndex === index &&
                        uploadingSliderImage?.imageIndex === imgIndex
                      }
                      className="text-xs text-text-muted flex-1"
                    />
                    {uploadingSliderImage?.activityIndex === index &&
                    uploadingSliderImage?.imageIndex === imgIndex ? (
                      <span className="text-xs text-accent">Uploading...</span>
                    ) : img ? (
                      <span className="text-xs text-green-500">✓</span>
                    ) : (
                      <span className="text-xs text-text-muted">No image</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeSliderImage(index, imgIndex)}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <HiTrash size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSliderImage(index)}
                  className="w-full py-1 border border-dashed border-text-muted/30 rounded text-text-muted hover:text-text-secondary hover:border-accent/50 transition-colors text-sm flex items-center justify-center gap-1 cursor-pointer"
                >
                  <HiPlus size={16} /> Add Slider Image
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-text-muted mb-2">
                Content
              </label>
              <textarea
                value={activity.content || ""}
                onChange={(e) =>
                  updateActivity(index, "content", e.target.value)
                }
                rows={8}
                placeholder="Write detailed content about this activity..."
                className="w-full px-3 py-2 bg-background border border-text-muted/30 rounded text-text-secondary focus:outline-none focus:border-accent resize-none font-mono text-sm"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addActivity}
          className="w-full py-2 border-2 border-dashed border-text-muted/30 rounded-lg text-text-muted hover:text-text-secondary hover:border-accent/50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <HiPlus size={20} /> Add New Activity
        </button>

        <div className="flex gap-3 pt-4 border-t border-text-muted/20">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-accent text-white py-2 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-text-muted/30 text-text-muted rounded-lg hover:bg-text-muted/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
