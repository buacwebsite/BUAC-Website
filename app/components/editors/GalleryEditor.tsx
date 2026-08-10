"use client";

import React, { useMemo, useState } from "react";
import {
  HiOutlinePencilAlt,
  HiX,
  HiPlus,
  HiTrash,
  HiPlay,
} from "react-icons/hi";
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

  const directId = input.match(/^[a-zA-Z0-9_-]{11}$/);
  if (directId) return directId[0];

  const match = input.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );

  return match?.[1] || "";
}

function getYouTubeThumbnail(url: string) {
  const videoId = getYouTubeId(url);
  if (!videoId) return "";
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function normalizeItem(
  item: Partial<GalleryItem>,
  index: number,
): GalleryItem {
  return {
    id:
      typeof item.id === "number" && item.id > 0
        ? item.id
        : index + 1,
    type: item.type === "video" ? "video" : "image",
    url: typeof item.url === "string" ? item.url : "",
    youtubeUrl:
      typeof item.youtubeUrl === "string"
        ? item.youtubeUrl
        : "",
  };
}

export default function GalleryEditor({
  data,
  onClose,
}: GalleryEditorProps) {
  useScrollLock(true);

  const [items, setItems] = useState<GalleryItem[]>(
    (data || []).map((item, index) =>
      normalizeItem(item, index),
    ),
  );

  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] =
    useState<number | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const nextId = useMemo(() => {
    return (
      items.reduce(
        (max, item) => Math.max(max, item.id),
        0,
      ) + 1
    );
  }, [items]);

  const updateItem = (
    index: number,
    patch: Partial<GalleryItem>,
  ) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        ...patch,
      };
      return copy;
    });
  };

  const changeItemType = (
    index: number,
    type: GalleryItemType,
  ) => {
    setError("");
    setSuccessMessage("");

    setItems((prev) => {
      const copy = [...prev];
      const current = copy[index];

      copy[index] = {
        ...current,
        type,
        url: type === "image" ? current.url : "",
        youtubeUrl:
          type === "video"
            ? current.youtubeUrl
            : "",
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

      updateItem(index, {
        url: response.data.url,
      });

      setSuccessMessage("Image uploaded successfully.");
    } catch (uploadError) {
      console.error(
        "Failed to upload image:",
        uploadError,
      );
      setError(
        "Failed to upload image. Please try again.",
      );
    } finally {
      setUploadingIndex(null);
    }
  };

  const addItem = (type: GalleryItemType) => {
    setError("");
    setSuccessMessage("");

    setItems((prev) => [
      ...prev,
      {
        id: nextId,
        type,
        url: "",
        youtubeUrl: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    setError("");
    setSuccessMessage("");

    setItems((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const validateItems = () => {
    if (items.length === 0) {
      return "Add at least one gallery item.";
    }

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];

      if (item.type === "image") {
        if (!item.url || !item.url.trim()) {
          return `Picture ${index + 1} needs an uploaded image.`;
        }
      }

      if (item.type === "video") {
        if (!getYouTubeId(item.youtubeUrl)) {
          return `Video ${index + 1} needs a valid YouTube URL.`;
        }
      }
    }

    return "";
  };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const validationError = validateItems();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const cleanedItems: GalleryItem[] = items.map(
      (item, index) => ({
        id:
          Number.isFinite(item.id) && item.id > 0
            ? item.id
            : index + 1,
        type: item.type,
        url:
          item.type === "image"
            ? item.url.trim()
            : "",
        youtubeUrl:
          item.type === "video"
            ? item.youtubeUrl.trim()
            : "",
      }),
    );

    try {
      const response = await axios.put(
        "/api/content/gallery",
        {
          images: cleanedItems,
        },
        {
          withCredentials: true,
        },
      );

      if (response.status === 200) {
        setSuccessMessage("Gallery saved successfully.");
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 500);
      } else {
        setError("Failed to save gallery.");
      }
    } catch (saveError) {
      console.error(
        "Failed to update gallery:",
        saveError,
      );
      setError(
        "Failed to save gallery. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex max-h-[85vh] min-h-[60vh] w-full flex-col overflow-hidden rounded-2xl bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-text-secondary">
          <HiOutlinePencilAlt className="text-accent" />
          Edit Gallery
        </h2>

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="cursor-pointer rounded-lg p-2 text-text-muted transition hover:bg-surface-secondary hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close gallery editor"
        >
          <HiX size={24} />
        </button>
      </div>

      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="mb-6 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-text-muted">
          Add picture uploads or YouTube links. Videos
          display as thumbnails and open on YouTube when
          clicked.
        </div>

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

        <form
          onSubmit={handleSubmit}
          className="space-y-6 pb-4"
        >
          {items.map((item, index) => {
            const thumbnail =
              item.type === "video"
                ? getYouTubeThumbnail(
                    item.youtubeUrl,
                  )
                : "";

            return (
              <div
                key={`${item.id}-${index}`}
                className="space-y-5 rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-accent">
                      Item {index + 1}
                    </p>

                    <h3 className="mt-1 flex items-center gap-2 font-bebasNeue text-2xl tracking-wide text-text-secondary">
                      {item.type === "video" ? (
                        <FaYoutube className="text-red-500" />
                      ) : null}
                      {item.type === "video"
                        ? "YouTube Video"
                        : "Gallery Picture"}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeItem(index)
                    }
                    disabled={loading}
                    className="cursor-pointer rounded-lg p-2 text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Remove item ${index + 1}`}
                  >
                    <HiTrash size={20} />
                  </button>
                </div>

                <div>
                  <label
                    htmlFor={`type-${item.id}`}
                    className="mb-2 block text-sm font-semibold text-text-secondary"
                  >
                    Category
                  </label>

                  <select
                    id={`type-${item.id}`}
                    value={item.type}
                    onChange={(event) =>
                      changeItemType(
                        index,
                        event.target
                          .value as GalleryItemType,
                      )
                    }
                    disabled={loading}
                    className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-3 text-text-secondary outline-none focus:border-accent disabled:opacity-50"
                  >
                    <option value="image">
                      Picture
                    </option>
                    <option value="video">
                      YouTube Video
                    </option>
                  </select>
                </div>

                {item.type === "image" ? (
                  <div>
                    <label
                      htmlFor={`upload-${item.id}`}
                      className="mb-2 block text-sm font-semibold text-text-secondary"
                    >
                      Upload Picture
                    </label>

                    <input
                      id={`upload-${item.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        handleImageUpload(
                          index,
                          event.target
                            .files?.[0] || null,
                        )
                      }
                      disabled={
                        loading ||
                        uploadingIndex === index
                      }
                      className="w-full rounded-xl border border-input-border bg-input-bg p-3 text-sm text-text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-accent/90 disabled:opacity-50"
                    />

                    {uploadingIndex === index && (
                      <p className="mt-2 text-xs text-accent">
                        Uploading picture...
                      </p>
                    )}

                    {item.url && (
                      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface-secondary">
                        <img
                          src={item.url}
                          alt="Gallery picture preview"
                          className="h-56 w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor={`youtube-${item.id}`}
                      className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-secondary"
                    >
                      <FaYoutube className="text-red-500" />
                      YouTube URL
                    </label>

                    <input
                      id={`youtube-${item.id}`}
                      type="url"
                      value={item.youtubeUrl}
                      onChange={(event) =>
                        updateItem(index, {
                          youtubeUrl:
                            event.target.value,
                        })
                      }
                      disabled={loading}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-3 text-text-secondary outline-none placeholder:text-text-muted focus:border-accent disabled:opacity-50"
                    />

                    {thumbnail ? (
                      <div className="relative mt-4 overflow-hidden rounded-xl border border-border bg-surface-secondary">
                        <img
                          src={thumbnail}
                          alt="YouTube thumbnail preview"
                          className="aspect-video w-full object-cover"
                        />

                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-xl">
                            <HiPlay className="ml-0.5 h-6 w-6" />
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-text-muted">
                        Enter a valid YouTube URL to
                        preview its thumbnail.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => addItem("image")}
              disabled={loading}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent/40 px-4 py-3 text-sm font-semibold text-accent transition hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiPlus />
              Add Picture
            </button>

            <button
              type="button"
              onClick={() => addItem("video")}
              disabled={loading}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-red-500/40 px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaYoutube />
              Add YouTube Video
            </button>
          </div>
        </form>
      </div>

      {/* Sticky footer actions */}
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
                : "Save Gallery"}
          </button>
        </div>
      </div>
    </div>
  );
}