"use client";

import React, { useEffect, useState } from "react";
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
import { FaYoutube } from "react-icons/fa6";
import PageLoader from "@/app/components/ui/PageLoader";
import { useAuth } from "@/app/context/AuthProvider";

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
  featuredVideoUrl: string;
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
  featuredVideoUrl: "",
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

function FeaturedVideo({ videoUrl }: { videoUrl: string }) {
  const videoId = getYouTubeId(videoUrl);

  if (!videoId) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-16"
    >
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-red-500">
          <FaYoutube className="h-4 w-4" />
          Featured Video
        </div>
        <h2 className="font-bebasNeue text-4xl tracking-wider text-text-secondary md:text-5xl">
          Meet the Team
        </h2>
      </div>

      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-black shadow-2xl">
        <div className="relative aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0`}
            title="BUAC Featured Video"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    </motion.section>
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

function SolidImageCard({
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
      className="group relative overflow-hidden rounded-[2rem] border border-border bg-surface p-3 shadow-xl"
    >
      <div className="relative">
        {person.image ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-surface-secondary">
            <img
              src={person.image}
              alt={person.title || "Panel and Executive Body Image"}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
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
                  e.currentTarget.value = "";
                }}
              />
            </label>

            <button
              type="button"
              onClick={onRemove}
              className="flex cursor-pointer items-center gap-1 rounded-full bg-red-500 px-3 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-red-600"
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
  const [originalContent, setOriginalContent] =
    useState<PanelEbContent>(defaultContent);

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
          setOriginalContent(res.data.content);
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

    if (!res.data?.url) throw new Error("Upload failed");
    return res.data.url as string;
  };

  const updateFeaturedVideoUrl = (value: string) => {
    setContent({ ...content, featuredVideoUrl: value });
  };

  const updatePanelPersonImage = (index: number, image: string) => {
    const panel = [...content.panel];
    panel[index] = { ...panel[index], image };
    setContent({ ...content, panel });
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
    setError("");

    try {
      const url = await uploadImage(file);
      updatePanelPersonImage(index, url);
    } catch (err) {
      console.error(err);
      setError("Panel image upload failed.");
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
    images[imageIndex] = { ...images[imageIndex], image };
    executiveBody[departmentIndex] = {
      ...executiveBody[departmentIndex],
      images,
    };
    setContent({ ...content, executiveBody });
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
    setContent({ ...content, executiveBody });
  };

  const addExecutivePerson = (departmentIndex: number) => {
    const executiveBody = [...content.executiveBody];
    const department = executiveBody[departmentIndex];
    executiveBody[departmentIndex] = {
      ...department,
      images: [
        ...department.images,
        createEmptyPerson(`${department.id}-${Date.now()}`),
      ],
    };
    setContent({ ...content, executiveBody });
  };

  const uploadExecutiveImage = async (
    departmentIndex: number,
    imageIndex: number,
    file: File,
  ) => {
    setUploading(`eb-${departmentIndex}-${imageIndex}`);
    setError("");

    try {
      const url = await uploadImage(file);
      updateExecutivePersonImage(departmentIndex, imageIndex, url);
    } catch (err) {
      console.error(err);
      setError("Executive body image upload failed.");
    } finally {
      setUploading("");
    }
  };

  const startEditing = () => {
    setOriginalContent(JSON.parse(JSON.stringify(content)));
    setIsEditing(true);
    setError("");
  };

  const cancelEditing = () => {
    if (saving || uploading) return;
    setContent(JSON.parse(JSON.stringify(originalContent)));
    setIsEditing(false);
    setError("");
  };

  const saveContent = async () => {
    setSaving(true);
    setError("");

    try {
      await axios.put(
        "/api/content/panel-eb",
        { content },
        { withCredentials: true },
      );

      setOriginalContent(JSON.parse(JSON.stringify(content)));
      setIsEditing(false);
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
    return <PageLoader label="Loading panel and executive body" />;
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
                    onClick={cancelEditing}
                    disabled={saving || Boolean(uploading)}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-bold text-text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <HiX />
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={saveContent}
                    disabled={saving || Boolean(uploading)}
                    className="flex cursor-pointer items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <HiSave />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={startEditing}
                  className="flex cursor-pointer items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent/90"
                >
                  <HiOutlinePencilAlt />
                  Edit Page
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        {uploading && (
          <div className="fixed right-6 bottom-6 z-50 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white shadow-xl">
            Uploading image...
          </div>
        )}

        {auth && isEditing && (
          <div className="mb-10 rounded-3xl border border-red-500/30 bg-surface p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                <FaYoutube className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <h3 className="font-bebasNeue text-2xl tracking-wide text-text-secondary">
                  Featured YouTube Video
                </h3>
                <p className="mt-1 mb-4 text-xs text-text-muted">
                  Paste any YouTube video URL. It will appear at the top of the
                  Panel & EB page. Leave empty to hide the video section.
                </p>

                <input
                  type="url"
                  value={content.featuredVideoUrl}
                  onChange={(e) => updateFeaturedVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-3 text-text-secondary outline-none placeholder:text-text-muted focus:border-accent"
                />

                {content.featuredVideoUrl &&
                  !getYouTubeId(content.featuredVideoUrl) && (
                    <p className="mt-2 text-xs text-red-500">
                      That does not look like a valid YouTube URL.
                    </p>
                  )}
              </div>
            </div>
          </div>
        )}

        <FeaturedVideo videoUrl={content.featuredVideoUrl} />

        <section className="mb-24">
          <div className="mb-7 flex items-center justify-between">
            <h2 className="font-bebasNeue text-6xl tracking-wider text-text-secondary md:text-7xl">
              Panel
            </h2>

            {auth && isEditing && (
              <button
                type="button"
                onClick={addPanelPerson}
                disabled={saving || Boolean(uploading)}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <HiPlus />
                Add Image
              </button>
            )}
          </div>

          {content.panel.length > 0 ? (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-4">
              {content.panel.map((person, index) => (
                <SolidImageCard
                  key={person.id}
                  person={person}
                  isAdmin={auth}
                  isEditing={isEditing}
                  onRemove={() => removePanelPerson(index)}
                  onUpload={(file) => uploadPanelImage(index, file)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-accent/30 bg-accent/5 px-6 py-16 text-center">
              <p className="text-text-muted">No panel images available.</p>
            </div>
          )}
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
                      disabled={saving || Boolean(uploading)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <HiPlus />
                      Add Image
                    </button>
                  )}
                </div>

                {department.images.length > 0 ? (
                  <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {department.images.map((person, imageIndex) => (
                      <SolidImageCard
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
                ) : (
                  <div className="rounded-3xl border-2 border-dashed border-accent/30 bg-accent/5 px-6 py-14 text-center">
                    <p className="text-text-muted">
                      No images available for this department.
                    </p>
                  </div>
                )}
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}