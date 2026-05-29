"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  HiOutlinePencilAlt,
  HiX,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import { useAuth } from "@/app/context/AuthProvider";
import { useEditor } from "@/app/context/EditorContext";
import Image from "next/image";

interface GalleryImage {
  id: number;
  url: string;
  caption: string;
}

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );

  const { auth } = useAuth();
  const { openEditor } = useEditor();

  const handleEdit = () => {
    openEditor("gallery", images);
  };

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  const nextImage = () => {
    if (selectedImageIndex !== null && images.length > 0) {
      setSelectedImageIndex((selectedImageIndex + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedImageIndex !== null && images.length > 0) {
      setSelectedImageIndex(
        (selectedImageIndex - 1 + images.length) % images.length,
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;

      if (e.key === "Escape") {
        setSelectedImageIndex(null);
      }
      if (e.key === "ArrowRight" && images.length > 0) {
        setSelectedImageIndex((prev) =>
          prev !== null ? (prev + 1) % images.length : 0,
        );
      }
      if (e.key === "ArrowLeft" && images.length > 0) {
        setSelectedImageIndex((prev) =>
          prev !== null ? (prev - 1 + images.length) % images.length : 0,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, images.length]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get("/api/content/gallery");
        const data = response.data;
        setImages(data.images || []);
      } catch (error) {
        console.error("Failed to fetch gallery:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-secondary text-2xl font-bebasNeue">
          Loading gallery...
        </div>
      </div>
    );
  }

  return (
    <>
      {auth && (
        <button
          onClick={handleEdit}
          className="fixed bottom-8 right-8 z-50 bg-accent text-white p-4 rounded-full shadow-lg hover:bg-accent/90 transition-colors flex items-center gap-2 cursor-pointer"
          title="Edit Gallery"
        >
          <HiOutlinePencilAlt size={24} />
        </button>
      )}

      <div className="min-h-screen bg-background py-20 px-6 lg:px-12 font-poppins flex flex-col items-center text-center">
        <div className="max-w-7xl mx-auto mb-16">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bebasNeue text-accent leading-none tracking-tight mb-4">
            GALLERY
          </h1>
          <p className="text-lg text-text-muted max-w-2xl">
            Capturing moments from our adventures and events.
          </p>
        </div>

        {images.length > 0 ? (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                onClick={() => openModal(index)}
                className="break-inside-avoid group relative overflow-hidden rounded-2xl bg-text-secondary/10 cursor-pointer"
              >
                <div className="relative aspect-auto">
                  {image.url ? (
                    <Image
                      src={image.url}
                      alt={image.caption || "Gallery image"}
                      width={800}
                      height={600}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                      <span className="text-text-muted/50 text-sm">
                        No image
                      </span>
                    </div>
                  )}
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white text-sm">{image.caption}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto text-center py-20">
            <div className="text-4xl mb-4 text-text-secondary/30 font-bebasNeue">
              No Images Yet
            </div>
            <p className="text-text-muted text-lg">
              Gallery is empty now. Nothing to see here.
            </p>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImageIndex !== null && images[selectedImageIndex] && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white hover:text-accent transition-colors z-10 cursor-pointer"
          >
            <HiX size={32} />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 text-white hover:text-accent transition-colors z-10 cursor-pointer"
              >
                <HiChevronLeft size={48} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 text-white hover:text-accent transition-colors z-10 cursor-pointer"
              >
                <HiChevronRight size={48} />
              </button>
            </>
          )}

          <div
            className="relative max-w-7xl max-h-[100vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[selectedImageIndex].url}
              alt={images[selectedImageIndex].caption || "Gallery image"}
              width={1920}
              height={1080}
              className="w-full h-auto max-h-[100vh] object-contain rounded-lg"
            />
            {images[selectedImageIndex].caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <p className="text-white text-center text-lg">
                  {images[selectedImageIndex].caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;
