"use client";

import React, { useEffect, useMemo, useState } from "react";
import { HiOutlinePencilAlt, HiPlus, HiTrash } from "react-icons/hi";
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeSlide(slide: Partial<HeroSlide>, index: number): HeroSlide {
  return {
    id: slide.id || `slide-${index + 1}`,
    place: slide.place || `Slide ${index + 1}`,
    image: slide.image || "",
    description: slide.description || "",
    country: slide.country || "BUAC Trail",
    tag: slide.tag || "Adventure",
  };
}

export default function LandingHeroEditor({
  data,
  onClose,
}: LandingHeroEditorProps) {
  useScrollLock(true);

  const initialSlides = useMemo(
    () => (data || []).map((slide, index) => normalizeSlide(slide, index)),
    [data],
  );

  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [saving, setSaving] = useState(false);
  const [loadingFreshData, setLoadingFreshData] = useState(true);
  const [error, setError] = useState("");
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchFreshSlides = async () => {
      try {
        const res = await axios.get("/api/content/landinghero");

        if (Array.isArray(res.data.images)) {
          setSlides(
            res.data.images.map((slide: Partial<HeroSlide>, index: number) =>
              normalizeSlide(slide, index),
            ),
          );
        }
      } catch (err) {
        console.error("Failed to fetch fresh hero slides:", err);
      } finally {
        setLoadingFreshData(false);
      }
    };

    fetchFreshSlides();
  }, []);

  const updateSlide = (
    index: number,
    field: keyof HeroSlide,
    value: string | File,
  ) => {
    const copy = [...slides];

    copy[index] = {
      ...copy[index],
      [field]: value,
    };

    if (field === "place" && typeof value === "string") {
      const currentId = copy[index].id;

      if (!currentId || currentId.startsWith("slide-")) {
        copy[index].id = slugify(value) || `slide-${index + 1}`;
      }
    }

    setSlides(copy);
  };

  const handleImageFile = (index: number, file: File | null) => {
    if (!file) return;
    updateSlide(index, "image", file);
  };

  const addSlide = () => {
    const nextNumber = slides.length + 1;

    setSlides([
      ...slides,
      {
        id: `slide-${nextNumber}`,
        place: `New Slide ${nextNumber}`,
        image: "",
        description: "",
        country: "BUAC Trail",
        tag: "Adventure",
      },
    ]);
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 1) {
      setError("At least one hero slide is required.");
      return;
    }

    setSlides(slides.filter((_, i) => i !== index));
  };

  const uploadImageIfNeeded = async (
    slide: HeroSlide,
    index: number,
  ): Promise<HeroSlide> => {
    if (!(slide.image instanceof File)) {
      return slide;
    }

    setUploadingIndex(index);

    const formData = new FormData();
    formData.append("file", slide.image);

    const res = await axios.post("/api/content/upload", formData, {
      withCredentials: true,
    });

    if (!res.data?.url) {
      throw new Error(`Image upload failed for slide ${index + 1}`);
    }

    return {
      ...slide,
      image: res.data.url,
    };
  };

  const validateSlides = () => {
    if (!slides.length) {
      return "At least one slide is required.";
    }

    for (let i = 0; i < slides.length; i += 1) {
      const slide = slides[i];

      if (!slide.place.trim()) {
        return `Slide ${i + 1}: place name is required.`;
      }

      if (!slide.description.trim()) {
        return `Slide ${i + 1}: description is required.`;
      }

      if (!slide.country.trim()) {
        return `Slide ${i + 1}: country/location text is required.`;
      }

      if (!slide.tag.trim()) {
        return `Slide ${i + 1}: tag is required.`;
      }
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    const validationError = validateSlides();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const finalSlides = await Promise.all(
        slides.map((slide, index) => uploadImageIfNeeded(slide, index)),
      );

      const cleanedSlides = finalSlides.map((slide, index) => ({
        id: slide.id || slugify(slide.place) || `slide-${index + 1}`,
        place: slide.place.trim(),
        image: typeof slide.image === "string" ? slide.image : "",
        description: slide.description.trim(),
        country: slide.country.trim(),
        tag: slide.tag.trim(),
      }));

      const res = await axios.put(
        "/api/content/landinghero",
        { images: cleanedSlides },
        {
          withCredentials: true,
        },
      );

      if (res.status === 200) {
        onClose();
        window.location.reload();
      } else {
        setError("Failed to update hero slides.");
      }
    } catch (err) {
      console.error("Error updating hero slides:", err);

      if (err instanceof AxiosError) {
        const serverError =
          err.response?.data?.details ||
          err.response?.data?.error ||
          err.response?.data?.message;

        if (err.response?.status === 401) {
          setError("Unauthorized. Please login again as admin.");
        } else {
          setError(serverError || "Failed to save hero slides.");
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong while saving.");
      }
    } finally {
      setUploadingIndex(null);
      setSaving(false);
    }
  };

  const getPreviewSrc = (image: string | File) => {
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }

    return image;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        data-lenis-prevent
        className="bg-linear-to-br from-white to-gray-50 text-text-muted p-6 md:p-8 rounded-2xl w-full max-w-4xl shadow-2xl border-2 border-accent/20 overflow-y-auto max-h-[90vh] overscroll-contain"
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-accent/20">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-text-secondary">
            <HiOutlinePencilAlt className="text-accent text-3xl" />
            Edit Landing Hero Slides
          </h3>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 cursor-pointer"
          >
            Close
          </button>
        </div>

        {loadingFreshData && (
          <div className="mb-4 rounded-lg border border-accent/20 bg-accent/5 p-3 text-sm text-text-muted">
            Loading latest saved hero content...
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {slides.map((slide, index) => {
            const previewSrc = getPreviewSrc(slide.image);

            return (
              <div
                key={`${slide.id}-${index}`}
                className="rounded-2xl border border-accent/20 bg-white p-4 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-bold text-text-secondary">
                    Slide {index + 1}
                  </h4>

                  <button
                    type="button"
                    onClick={() => removeSlide(index)}
                    disabled={saving}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    <HiTrash />
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-bold text-text-secondary">
                      Place Name
                    </label>
                    <input
                      value={slide.place}
                      disabled={saving}
                      onChange={(e) =>
                        updateSlide(index, "place", e.target.value)
                      }
                      className="w-full rounded-lg border-2 border-gray-300 p-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
                      placeholder="Bandarban"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-bold text-text-secondary">
                      Country / Location Text
                    </label>
                    <input
                      value={slide.country}
                      disabled={saving}
                      onChange={(e) =>
                        updateSlide(index, "country", e.target.value)
                      }
                      className="w-full rounded-lg border-2 border-gray-300 p-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
                      placeholder="Bangladesh"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-bold text-text-secondary">
                      Tag
                    </label>
                    <input
                      value={slide.tag}
                      disabled={saving}
                      onChange={(e) =>
                        updateSlide(index, "tag", e.target.value)
                      }
                      className="w-full rounded-lg border-2 border-gray-300 p-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
                      placeholder="Adventure"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-bold text-text-secondary">
                      Slide ID
                    </label>
                    <input
                      value={slide.id}
                      disabled={saving}
                      onChange={(e) =>
                        updateSlide(
                          index,
                          "id",
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-"),
                        )
                      }
                      className="w-full rounded-lg border-2 border-gray-300 p-3 font-mono text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
                      placeholder="bandarban"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-bold text-text-secondary">
                      Description
                    </label>
                    <textarea
                      value={slide.description}
                      disabled={saving}
                      onChange={(e) =>
                        updateSlide(index, "description", e.target.value)
                      }
                      rows={4}
                      className="w-full rounded-lg border-2 border-gray-300 p-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none disabled:opacity-60"
                      placeholder="Write the hero slide description..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-bold text-text-secondary">
                      Replace Image
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      disabled={saving}
                      onChange={(e) =>
                        handleImageFile(index, e.target.files?.[0] ?? null)
                      }
                      className="w-full mb-3 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent file:text-white hover:file:bg-accent/90 disabled:opacity-60 cursor-pointer"
                    />

                    {uploadingIndex === index && (
                      <p className="mb-2 text-sm text-accent">
                        Uploading image...
                      </p>
                    )}

                    {previewSrc ? (
                      <div className="relative h-48 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                        <Image
                          src={previewSrc}
                          width={900}
                          height={360}
                          alt={slide.place || "Hero preview"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-100 text-sm text-gray-500">
                        No image selected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addSlide}
          disabled={saving}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent/40 py-3 text-accent font-semibold hover:bg-accent/10 disabled:opacity-50 cursor-pointer"
        >
          <HiPlus />
          Add New Slide
        </button>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t-2 border-accent/20 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg bg-gray-200 px-6 py-3 font-medium hover:bg-gray-300 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent/90 disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}