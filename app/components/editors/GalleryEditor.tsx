"use client";
import React, { useState } from "react";
import { HiOutlinePencilAlt, HiX, HiPlus, HiTrash } from "react-icons/hi";
import axios from "axios";
import { useScrollLock } from "@/lib/scrollLockHelper";
import Image from "next/image";

interface GalleryImage {
  id: number;
  url: string;
  caption: string;
}

interface GalleryEditorProps {
  data: GalleryImage[];
  onClose: () => void;
}

export default function GalleryEditor({ data, onClose }: GalleryEditorProps) {
  useScrollLock(true);
  const [images, setImages] = useState<GalleryImage[]>(data);
  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const updateImage = (
    index: number,
    field: keyof GalleryImage,
    value: string,
  ) => {
    const copy = [...images];
    copy[index] = { ...copy[index], [field]: value };
    setImages(copy);
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
        updateImage(index, "url", response.data.url);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingIndex(null);
    }
  };

  const addImage = () => {
    const newImage: GalleryImage = {
      id: images.length + 1,
      url: "",
      caption: "",
    };
    setImages([...images, newImage]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        "/api/content/gallery",
        { images },
        {
          withCredentials: true,
        },
      );
      alert("Gallery updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Failed to update gallery:", error);
      alert("Failed to update gallery");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-background pb-4 border-b border-text-muted/20">
        <h2 className="text-2xl font-bold text-accent flex items-center gap-2">
          <HiOutlinePencilAlt /> Edit Gallery
        </h2>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
        >
          <HiX size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="border border-text-muted/20 rounded-lg p-4 space-y-4"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-accent">
                Image #{index + 1}
              </h3>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
              >
                <HiTrash size={20} />
              </button>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-1">
                Caption (optional)
              </label>
              <input
                type="text"
                value={image.caption}
                onChange={(e) => updateImage(index, "caption", e.target.value)}
                placeholder="Add a caption for this image"
                className="w-full px-3 py-2 bg-background border border-text-muted/30 rounded text-text-secondary focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">
                Image
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
                ) : image.url ? (
                  <span className="text-sm text-green-500">✓ Uploaded</span>
                ) : (
                  <span className="text-sm text-text-muted">No image</span>
                )}
              </div>
              {image.url && (
                <div className="mt-2 relative h-48 w-full rounded overflow-hidden">
                  <Image
                    src={image.url}
                    alt={image.caption || "Gallery image"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addImage}
          className="w-full py-2 border-2 border-dashed border-text-muted/30 rounded-lg text-text-muted hover:text-text-secondary hover:border-accent/50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <HiPlus size={20} /> Add New Image
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
