"use client";
import React, { useState } from "react";
import { HiOutlinePencilAlt, HiX, HiPlus, HiTrash } from "react-icons/hi";
import axios from "axios";
import { useScrollLock } from "@/lib/scrollLockHelper";

interface TourImage {
  type: string;
  alt: string;
  url: string;
}

interface Tour {
  id: number;
  name: string;
  subtitle: string;
  location: string;
  icon: string;
  elevation?: string;
  description?: string;
  visitCount: number;
  latestVisitYear: string;
  layoutType: "left" | "right";
  gridLayout: string;
  images: TourImage[];
}

interface ToursEditorProps {
  data: Tour[];
  onClose: () => void;
}

export default function ToursEditor({ data, onClose }: ToursEditorProps) {
  useScrollLock(true);
  const [tours, setTours] = useState<Tour[]>(data);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<{
    tourIndex: number;
    imageIndex: number;
  } | null>(null);

  const updateTour = (
    index: number,
    field: keyof Tour,
    value: string | number,
  ) => {
    const copy = [...tours];
    copy[index] = { ...copy[index], [field]: value };
    setTours(copy);
  };

  const updateImage = (
    tourIndex: number,
    imageIndex: number,
    field: keyof TourImage,
    value: string,
  ) => {
    const copy = [...tours];
    const images = [...copy[tourIndex].images];
    images[imageIndex] = { ...images[imageIndex], [field]: value };
    copy[tourIndex] = { ...copy[tourIndex], images };
    setTours(copy);
  };

  const handleImageUpload = async (
    tourIndex: number,
    imageIndex: number,
    file: File | null,
  ) => {
    if (!file) return;

    setUploadingImage({ tourIndex, imageIndex });
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/content/upload", formData, {
        withCredentials: true,
      });

      if (response.data.url) {
        updateImage(tourIndex, imageIndex, "url", response.data.url);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(null);
    }
  };

  const addTour = () => {
    const newTour: Tour = {
      id: tours.length + 1,
      name: "NEW TOUR",
      subtitle: "",
      location: "Location",
      icon: "🏔️",
      elevation: "1,000 ft",
      visitCount: 1,
      latestVisitYear: "2025",
      layoutType: "left",
      gridLayout: "standard",
      images: [
        { type: "main", alt: "Image 1", url: "" },
        { type: "small", alt: "Image 2", url: "" },
        { type: "small", alt: "Image 3", url: "" },
      ],
    };
    setTours([...tours, newTour]);
  };

  const removeTour = (index: number) => {
    setTours(tours.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        "/api/content/tours",
        { tours },
        {
          withCredentials: true,
        },
      );
      alert("Tours updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Failed to update tours:", error);
      alert("Failed to update tours");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-background pb-4 border-b border-text-muted/20">
        <h2 className="text-2xl font-bold text-text-secondary flex items-center gap-2">
          <HiOutlinePencilAlt /> Edit Tours
        </h2>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          <HiX size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {tours.map((tour, tourIndex) => (
          <div
            key={tour.id}
            className="border border-text-muted/20 rounded-lg p-4 space-y-4"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-text-secondary">
                Tour #{tourIndex + 1}
              </h3>
              <button
                type="button"
                onClick={() => removeTour(tourIndex)}
                className="text-red-500 hover:text-red-700 transition-colors"
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
                  value={tour.name}
                  onChange={(e) =>
                    updateTour(tourIndex, "name", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-background border border-text-muted/30 rounded text-text-secondary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={tour.subtitle}
                  onChange={(e) =>
                    updateTour(tourIndex, "subtitle", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-background border border-text-muted/30 rounded text-text-secondary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={tour.location}
                  onChange={(e) =>
                    updateTour(tourIndex, "location", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-background border border-text-muted/30 rounded text-text-secondary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">
                  Elevation
                </label>
                <input
                  type="text"
                  value={tour.elevation || ""}
                  onChange={(e) =>
                    updateTour(tourIndex, "elevation", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-background border border-text-muted/30 rounded text-text-secondary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={tour.description || ""}
                  onChange={(e) =>
                    updateTour(tourIndex, "description", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-background border border-text-muted/30 rounded text-text-secondary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">
                  Visit Count
                </label>
                <input
                  type="number"
                  value={tour.visitCount}
                  onChange={(e) =>
                    updateTour(
                      tourIndex,
                      "visitCount",
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full px-3 py-2 bg-background border border-text-muted/30 rounded text-text-secondary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">
                  Latest Visit Year
                </label>
                <input
                  type="text"
                  value={tour.latestVisitYear}
                  onChange={(e) =>
                    updateTour(tourIndex, "latestVisitYear", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-background border border-text-muted/30 rounded text-text-secondary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">
                  Grid Layout
                </label>
                <select
                  value={tour.gridLayout}
                  onChange={(e) =>
                    updateTour(tourIndex, "gridLayout", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-background border border-text-muted/30 rounded text-text-secondary focus:outline-none focus:border-accent"
                >
                  <option value="standard">Standard</option>
                  <option value="reversed">Reversed</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-text-muted mb-2">
                Images (exactly 3)
              </label>

              <div className="space-y-2">
                {tour.images.slice(0, 3).map((img, imgIndex) => (
                  <div
                    key={imgIndex}
                    className="flex gap-2 items-center bg-background/50 p-2 rounded border border-text-muted/10"
                  >
                    <span className="text-xs text-text-muted w-8">
                      #{imgIndex + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Alt text"
                      value={img.alt}
                      onChange={(e) =>
                        updateImage(tourIndex, imgIndex, "alt", e.target.value)
                      }
                      className="flex-1 px-2 py-1 bg-background border border-text-muted/30 rounded text-text-secondary text-sm focus:outline-none focus:border-accent"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(
                          tourIndex,
                          imgIndex,
                          e.target.files?.[0] || null,
                        )
                      }
                      disabled={
                        uploadingImage?.tourIndex === tourIndex &&
                        uploadingImage?.imageIndex === imgIndex
                      }
                      className="text-xs text-text-muted"
                    />
                    {uploadingImage?.tourIndex === tourIndex &&
                    uploadingImage?.imageIndex === imgIndex ? (
                      <span className="text-xs text-accent">Uploading...</span>
                    ) : img.url ? (
                      <span className="text-xs text-green-500">✓</span>
                    ) : (
                      <span className="text-xs text-text-muted">No image</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addTour}
          className="w-full py-2 border-2 border-dashed border-text-muted/30 rounded-lg text-text-muted hover:text-text-secondary hover:border-accent/50 transition-colors flex items-center justify-center gap-2"
        >
          <HiPlus size={20} /> Add New Tour
        </button>

        <div className="flex gap-3 pt-4 border-t border-text-muted/20">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-accent text-white py-2 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-text-muted/30 text-text-muted rounded-lg hover:bg-text-muted/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
