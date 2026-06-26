"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { motion } from "framer-motion";
import {
  HiOutlinePencilAlt,
  HiPlus,
  HiSave,
  HiTrash,
  HiUpload,
  HiX,
} from "react-icons/hi";
import UniqueLoading from "@/app/components/ui/UniqueLoading";
import { useAuth } from "@/app/context/AuthProvider";

interface PerspectiveState {
  rotateX: number;
  rotateY: number;
}

interface SpotlightConfig {
  spotlightSize?: number;
  overlayOpacity?: number;
  className?: string;
}

interface ImageSpotlightProps {
  src: string;
  alt: string;
  orientation?: "landscape" | "portrait" | "square";
  width?: number;
  height?: number;
  config?: SpotlightConfig;
}

interface PersonImage {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

interface ExecutiveDepartment {
  id: string;
  name: string;
  images: PersonImage[];
}

interface PanelEbContent {
  panel: PersonImage[];
  executiveBody: ExecutiveDepartment[];
}

function createEmptyPerson(id: string): PersonImage {
  return {
    id,
    title: "",
    subtitle: "",
    image: "",
  };
}

const defaultContent: PanelEbContent = {
  panel: [
    createEmptyPerson("panel-1"),
    createEmptyPerson("panel-2"),
    createEmptyPerson("panel-3"),
    createEmptyPerson("panel-4"),
  ],
  executiveBody: [
    {
      id: "creative",
      name: "Creative",
      images: Array.from({ length: 5 }).map((_, index) =>
        createEmptyPerson(`creative-${index + 1}`),
      ),
    },
    {
      id: "event",
      name: "Event Management",
      images: Array.from({ length: 5 }).map((_, index) =>
        createEmptyPerson(`event-${index + 1}`),
      ),
    },
    {
      id: "hr",
      name: "Human Resources Management",
      images: Array.from({ length: 5 }).map((_, index) =>
        createEmptyPerson(`hr-${index + 1}`),
      ),
    },
    {
      id: "itphoto",
      name: "IT & Photography",
      images: Array.from({ length: 5 }).map((_, index) =>
        createEmptyPerson(`itphoto-${index + 1}`),
      ),
    },
    {
      id: "pubandmarket",
      name: "Publication & Marketing",
      images: Array.from({ length: 5 }).map((_, index) =>
        createEmptyPerson(`pubandmarket-${index + 1}`),
      ),
    },
  ],
};

function ImageSpotlight({
  src,
  alt,
  orientation = "square",
  width,
  height,
  config = {},
}: ImageSpotlightProps) {
  const defaultConfig: Required<SpotlightConfig> = {
    spotlightSize: 95,
    overlayOpacity: 0.5,
    className: "",
  };

  const finalConfig = { ...defaultConfig, ...config };

  const [perspective, setPerspective] = useState<PerspectiveState>({
    rotateX: 0,
    rotateY: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      containerRef.current.style.setProperty("--mouse-x", `${x}%`);
      containerRef.current.style.setProperty("--mouse-y", `${y}%`);

      const rotateY = ((x - 50) / 50) * 8;
      const rotateX = ((50 - y) / 50) * 8;

      setPerspective({ rotateX, rotateY });
    },
    [],
  );

  const handleMouseLeave = () => {
    setPerspective({ rotateX: 0, rotateY: 0 });
  };

  const getContainerDimensions = (): React.CSSProperties => {
    if (width && height) {
      return {
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: "100%",
      };
    }

    if (orientation === "landscape") {
      return {
        width: "800px",
        height: "450px",
        maxWidth: "100%",
      };
    }

    if (orientation === "portrait") {
      return {
        width: "450px",
        height: "600px",
        maxWidth: "100%",
      };
    }

    return {
      width: "100%",
      aspectRatio: "1 / 1",
      maxWidth: "100%",
    };
  };

  const containerClasses = `
    relative overflow-hidden cursor-none rounded-3xl shadow-xl border border-accent/20 bg-accent/10
    ${finalConfig.className}
  `.trim();

  return (
    <div className="flex items-center justify-center">
      <div
        ref={containerRef}
        className={containerClasses}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        role="img"
        aria-label={alt}
        tabIndex={0}
        style={
          {
            ...getContainerDimensions(),
            "--mouse-x": "50%",
            "--mouse-y": "50%",
            "--spotlight-size": `${finalConfig.spotlightSize}px`,
            "--overlay-opacity": finalConfig.overlayOpacity,
            transform: `perspective(1000px) rotateX(${perspective.rotateX}deg) rotateY(${perspective.rotateY}deg)`,
            transformStyle: "preserve-3d",
            transition: "transform 0.2s ease-out",
          } as React.CSSProperties
        }
      >
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
          style={{ filter: "blur(5px)" }}
        />

        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
          style={{
            maskImage: `radial-gradient(
              circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              black ${finalConfig.spotlightSize * 0.45}px,
              transparent ${finalConfig.spotlightSize * 1.7}px
            )`,
            WebkitMaskImage: `radial-gradient(
              circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              black ${finalConfig.spotlightSize * 0.45}px,
              transparent ${finalConfig.spotlightSize * 1.7}px
            )`,
            zIndex: 2,
          }}
        />

        <div
          className="absolute inset-0 bg-black will-change-[mask-position] transition-all duration-100 ease-out"
          style={{
            opacity: finalConfig.overlayOpacity,
            maskImage: `radial-gradient(
              circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              transparent ${finalConfig.spotlightSize * 0.45}px,
              black ${finalConfig.spotlightSize * 1.7}px
            )`,
            WebkitMaskImage: `radial-gradient(
              circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              transparent ${finalConfig.spotlightSize * 0.45}px,
              black ${finalConfig.spotlightSize * 1.7}px
            )`,
            zIndex: 10,
          }}
        />
      </div>
    </div>
  );
}

function EmptyImageBox() {
  return (
    <div className="flex aspect-square w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-accent/30 bg-accent/10 text-center">
      <HiUpload className="mb-2 h-10 w-10 text-accent" />
      <p className="text-sm font-semibold text-text-secondary">
        No image uploaded
      </p>
    </div>
  );
}

function PersonCard({
  person,
  isAdmin,
  isEditing,
  onRemove,
  onUpload,
}: {
  person: PersonImage;
  isAdmin: boolean;
  isEditing: boolean;
  onRemove: () => void;
  onUpload: (file: File) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-[2rem] border border-accent/20 bg-white/40 p-3 shadow-xl backdrop-blur-sm"
    >
      <div className="relative">
        {person.image ? (
          <ImageSpotlight
            src={person.image}
            alt="Panel and Executive Body Image"
            orientation="square"
            config={{
              spotlightSize: 105,
              overlayOpacity: 0.48,
              className: "w-full",
            }}
          />
        ) : (
          <EmptyImageBox />
        )}

        {isAdmin && isEditing && (
          <div className="absolute inset-x-3 top-3 z-30 flex justify-between gap-2">
            <label className="flex cursor-pointer items-center gap-1 rounded-full bg-accent px-3 py-2 text-xs font-bold text-white shadow-lg">
              <HiUpload />
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(file);
                }}
              />
            </label>

            <button
              type="button"
              onClick={onRemove}
              className="flex items-center gap-1 rounded-full bg-red-500 px-3 py-2 text-xs font-bold text-white shadow-lg"
            >
              <HiTrash />
              Remove
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function PanelEbPage() {
  const { auth } = useAuth();

  const [content, setContent] = useState<PanelEbContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get("/api/content/panel-eb");

        if (res.data?.content) {
          setContent(res.data.content);
        }
      } catch (err) {
        console.error("Failed to fetch Panel & EB content:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post("/api/content/upload", formData, {
      withCredentials: true,
    });

    if (!res.data?.url) {
      throw new Error("Upload failed");
    }

    return res.data.url as string;
  };

  const updatePanelPersonImage = (index: number, image: string) => {
    const panel = [...content.panel];

    panel[index] = {
      ...panel[index],
      image,
    };

    setContent({
      ...content,
      panel,
    });
  };

  const removePanelPerson = (index: number) => {
    setContent({
      ...content,
      panel: content.panel.filter((_, i) => i !== index),
    });
  };

  const addPanelPerson = () => {
    setContent({
      ...content,
      panel: [...content.panel, createEmptyPerson(`panel-${Date.now()}`)],
    });
  };

  const uploadPanelImage = async (index: number, file: File) => {
    setUploading(`panel-${index}`);

    try {
      const url = await uploadImage(file);
      updatePanelPersonImage(index, url);
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    } finally {
      setUploading("");
    }
  };

  const updateExecutivePersonImage = (
    departmentIndex: number,
    imageIndex: number,
    image: string,
  ) => {
    const executiveBody = [...content.executiveBody];
    const images = [...executiveBody[departmentIndex].images];

    images[imageIndex] = {
      ...images[imageIndex],
      image,
    };

    executiveBody[departmentIndex] = {
      ...executiveBody[departmentIndex],
      images,
    };

    setContent({
      ...content,
      executiveBody,
    });
  };

  const removeExecutivePerson = (
    departmentIndex: number,
    imageIndex: number,
  ) => {
    const executiveBody = [...content.executiveBody];

    executiveBody[departmentIndex] = {
      ...executiveBody[departmentIndex],
      images: executiveBody[departmentIndex].images.filter(
        (_, i) => i !== imageIndex,
      ),
    };

    setContent({
      ...content,
      executiveBody,
    });
  };

  const addExecutivePerson = (departmentIndex: number) => {
    const executiveBody = [...content.executiveBody];
    const department = executiveBody[departmentIndex];

    executiveBody[departmentIndex] = {
      ...department,
      images: [...department.images, createEmptyPerson(`${department.id}-${Date.now()}`)],
    };

    setContent({
      ...content,
      executiveBody,
    });
  };

  const uploadExecutiveImage = async (
    departmentIndex: number,
    imageIndex: number,
    file: File,
  ) => {
    setUploading(`eb-${departmentIndex}-${imageIndex}`);

    try {
      const url = await uploadImage(file);
      updateExecutivePersonImage(departmentIndex, imageIndex, url);
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    } finally {
      setUploading("");
    }
  };

  const saveContent = async () => {
    setSaving(true);
    setError("");

    try {
      await axios.put(
        "/api/content/panel-eb",
        { content },
        {
          withCredentials: true,
        },
      );

      setIsEditing(false);
      alert("Panel & EB updated successfully");
    } catch (err) {
      console.error("Failed to save Panel & EB:", err);

      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to save content",
        );
      } else {
        setError("Failed to save content");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <UniqueLoading variant="morph" size="lg" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-24 font-poppins text-text-secondary md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <motion.p
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold uppercase tracking-[0.35em] text-accent"
            >
              BUAC Leadership
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-bebasNeue text-6xl leading-none tracking-wider text-accent md:text-8xl lg:text-9xl"
            >
              Panel & EB
            </motion.h1>
          </div>

          {auth && (
            <div className="flex flex-wrap gap-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-full border border-text-muted/30 px-5 py-3 text-sm font-bold text-text-muted transition hover:border-accent hover:text-accent disabled:opacity-50"
                  >
                    <HiX />
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={saveContent}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent/90 disabled:opacity-50"
                  >
                    <HiSave />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent/90"
                >
                  <HiOutlinePencilAlt />
                  Edit Page
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {uploading && (
          <div className="fixed bottom-6 right-6 z-50 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white shadow-xl">
            Uploading image...
          </div>
        )}

        <section className="mb-24">
          <div className="mb-7 flex items-center justify-between">
            <h2 className="font-bebasNeue text-6xl tracking-wider text-text-secondary md:text-7xl">
              Panel
            </h2>

            {auth && isEditing && (
              <button
                type="button"
                onClick={addPanelPerson}
                className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold text-white"
              >
                <HiPlus />
                Add Image
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-4">
            {content.panel.map((person, index) => (
              <PersonCard
                key={person.id}
                person={person}
                isAdmin={auth}
                isEditing={isEditing}
                onRemove={() => removePanelPerson(index)}
                onUpload={(file) => uploadPanelImage(index, file)}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-8">
            <h2 className="font-bebasNeue text-6xl tracking-wider text-text-secondary md:text-7xl">
              Executive Body
            </h2>
          </div>

          <div className="space-y-20">
            {content.executiveBody.map((department, departmentIndex) => (
              <section key={department.id}>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-bebasNeue text-5xl tracking-wider text-accent md:text-6xl">
                    {department.name}
                  </h3>

                  {auth && isEditing && (
                    <button
                      type="button"
                      onClick={() => addExecutivePerson(departmentIndex)}
                      className="flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold text-white"
                    >
                      <HiPlus />
                      Add Image
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {department.images.map((person, imageIndex) => (
                    <PersonCard
                      key={person.id}
                      person={person}
                      isAdmin={auth}
                      isEditing={isEditing}
                      onRemove={() =>
                        removeExecutivePerson(departmentIndex, imageIndex)
                      }
                      onUpload={(file) =>
                        uploadExecutiveImage(
                          departmentIndex,
                          imageIndex,
                          file,
                        )
                      }
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}