"use client";
import React, { useState } from "react";
import { HiOutlinePencilAlt } from "react-icons/hi";
import axios from "axios";
import Image from "next/image";
import { useScrollLock } from "@/lib/scrollLockHelper";

interface HeroSlide {
  id: string;
  place: string;
  image: string | File;
}

interface LandingHeroEditorProps {
  data: HeroSlide[];
  onClose: () => void;
}

export default function LandingHeroEditor({
  data,
  onClose,
}: LandingHeroEditorProps) {
  useScrollLock(true);
  const [slides, setSlides] = useState<HeroSlide[]>(data);

  const updateSlide = (index: number, field: string, value: string | File) => {
    const copy = [...slides];
    copy[index] = { ...copy[index], [field]: value };
    setSlides(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const finalSlides = await Promise.all(
        slides.map(async (slide) => {
          if (slide.image instanceof File) {
            const formData = new FormData();
            formData.append("file", slide.image);
            const res = await axios.post("/api/content/upload", formData);
            return { ...slide, image: res.data.url };
          }
          return slide;
        }),
      );
      console.log("Final slides to be sent:", finalSlides);
      const res = await axios.put("/api/content/landinghero", finalSlides, {
        withCredentials: true,
      });

      if (res.status === 200) {
        onClose();
        location.reload();
      } else {
        console.error("Failed to update hero images");
      }
    } catch (err) {
      console.error("Error updating hero images", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        data-lenis-prevent
        className="bg-linear-to-br from-white to-gray-50 text-text-muted p-8 rounded-2xl w-full max-w-2xl shadow-2xl border-2 border-accent/20 overflow-y-auto max-h-[90vh] overscroll-contain"
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-accent/20">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <HiOutlinePencilAlt className="text-accent text-3xl" />
            Edit Landing Hero Slides
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 cursor-pointer"
          >
            Close
          </button>
        </div>

        {slides.map((slide, i) => (
          <div key={slide.id} className="mb-6 border-b border-accent/20 pb-4">
            <label
              htmlFor={`place-${slide.id}`}
              className="block mb-1 text-sm font-bold"
            >
              Place Name
            </label>
            <input
              id={`place-${slide.id}`}
              value={slide.place}
              onChange={(e) => updateSlide(i, "place", e.target.value)}
              className="w-full mb-2 p-3 border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
            />

            <label
              htmlFor={`image-${slide.id}`}
              className="block mb-1 text-sm font-bold"
            >
              Replace Image
            </label>
            <input
              id={`image-${slide.id}`}
              type="file"
              accept="image/*"
              onChange={(e) =>
                updateSlide(i, "image", e.target.files?.[0] ?? slide.image)
              }
              className="w-full mb-2 file:py-2 file:px-4 file:rounded-lg file:bg-accent file:text-white hover:file:bg-accent/90 cursor-pointer"
            />
            <Image
              src={
                typeof slide.image === "string"
                  ? slide.image
                  : URL.createObjectURL(slide.image)
              }
              width={400}
              height={160}
              alt={slide.place}
              className="w-full h-40 object-cover rounded-lg mt-2"
            />
          </div>
        ))}

        <div className="flex justify-end gap-3 pt-4 border-t-2 border-accent/20">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
