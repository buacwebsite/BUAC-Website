"use client";

import { useEffect, useState } from "react";
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
import PreviousPanels from "@/app/components/PreviousPanels";
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
  panelVideoUrl: string;
  executiveVideoUrl: string;
}

function createEmptyPerson(id: string): PersonImage {
  return {
    id,
    title: "",
    subtitle: "",
    image: "",
  };
}

function hasImage(person: PersonImage) {
  return Boolean(person?.image?.trim());
}

const defaultContent: PanelEbContent = {
  panelVideoUrl: "",
  executiveVideoUrl: "",

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
      images: Array.from({ length: 5 }, (_, index) =>
        createEmptyPerson(`creative-${index + 1}`),
      ),
    },
    {
      id: "event",
      name: "Event Management",
      images: Array.from({ length: 5 }, (_, index) =>
        createEmptyPerson(`event-${index + 1}`),
      ),
    },
    {
      id: "hr",
      name: "Human Resources Management",
      images: Array.from({ length: 5 }, (_, index) =>
        createEmptyPerson(`hr-${index + 1}`),
      ),
    },
    {
      id: "itphoto",
      name: "IT & Photography",
      images: Array.from({ length: 5 }, (_, index) =>
        createEmptyPerson(`itphoto-${index + 1}`),
      ),
    },
    {
      id: "pubandmarket",
      name: "Publication & Marketing",
      images: Array.from({ length: 5 }, (_, index) =>
        createEmptyPerson(`pubandmarket-${index + 1}`),
      ),
    },
  ],
};

/**
 * Keep older saved content compatible with the current page.
 * Older data may use featuredVideoUrl instead of panelVideoUrl.
 */
function normalizeContent(input: unknown): PanelEbContent {
  if (!input || typeof input !== "object") {
    return defaultContent;
  }

  const data = input as Partial<PanelEbContent> & {
    featuredVideoUrl?: string;
  };

  return {
    panel: Array.isArray(data.panel)
      ? data.panel
      : defaultContent.panel,

    executiveBody: Array.isArray(data.executiveBody)
      ? data.executiveBody
      : defaultContent.executiveBody,

    panelVideoUrl:
      typeof data.panelVideoUrl === "string"
        ? data.panelVideoUrl
        : typeof data.featuredVideoUrl === "string"
          ? data.featuredVideoUrl
          : "",

    executiveVideoUrl:
      typeof data.executiveVideoUrl === "string"
        ? data.executiveVideoUrl
        : "",
  };
}

function getYouTubeId(value: string) {
  const input = (value || "").trim();

  if (!input) return "";

  const directId = input.match(/^[a-zA-Z0-9_-]{11}$/);

  if (directId) {
    return directId[0];
  }

  const match = input.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );

  return match?.[1] || "";
}

/* ============================================================
   VIDEO PLAYER
============================================================ */

function SectionVideo({
  videoUrl,
  label,
}: {
  videoUrl: string;
  label: string;
}) {
  const videoId = getYouTubeId(videoUrl);

  if (!videoId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-10"
    >
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-red-500">
        <FaYoutube className="h-4 w-4" />
        {label}
      </div>

      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-black shadow-2xl">
        <div className="relative aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0`}
            title={label}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   ADMIN VIDEO URL INPUT
============================================================ */

function VideoUrlEditor({
  title,
  value,
  onChange,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-8 rounded-3xl border border-red-500/30 bg-surface p-5 shadow-xl sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
          <FaYoutube className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bebasNeue text-2xl tracking-wide text-text-secondary">
            {title}
          </h3>

          <p className="mb-4 mt-1 text-xs text-text-muted">
            Paste a YouTube video URL. Leave it empty to hide
            the video.
          </p>

          <input
            type="url"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-3 text-text-secondary outline-none placeholder:text-text-muted focus:border-accent"
          />

          {value && !getYouTubeId(value) && (
            <p className="mt-2 text-xs text-red-500">
              That does not look like a valid YouTube URL.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   IMAGE CARDS
============================================================ */

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    onUpload(file);
                  }

                  event.currentTarget.value = "";
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

/* ============================================================
   PANEL & EB PAGE
============================================================ */

export default function PanelEbPage() {
  const { auth } = useAuth();

  const [content, setContent] =
    useState<PanelEbContent>(defaultContent);

  const [originalContent, setOriginalContent] =
    useState<PanelEbContent>(defaultContent);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");

  /* ---------------- Fetch existing page content ---------------- */

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get("/api/content/panel-eb");

        if (response.data?.content) {
          const normalized = normalizeContent(
            response.data.content,
          );

          setContent(normalized);
          setOriginalContent(normalized);
        }
      } catch (requestError) {
        console.error(
          "Failed to fetch Panel & EB content:",
          requestError,
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchContent();
  }, []);

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      "/api/content/upload",
      formData,
      { withCredentials: true },
    );

    if (!response.data?.url) {
      throw new Error("Upload failed");
    }

    return response.data.url as string;
  };

  /* ---------------- Video settings ---------------- */

  const updatePanelVideoUrl = (value: string) => {
    setContent({
      ...content,
      panelVideoUrl: value,
    });
  };

  const updateExecutiveVideoUrl = (value: string) => {
    setContent({
      ...content,
      executiveVideoUrl: value,
    });
  };

  /* ---------------- Panel images ---------------- */

  const updatePanelPersonImage = (
    index: number,
    image: string,
  ) => {
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
      panel: content.panel.filter(
        (_, personIndex) => personIndex !== index,
      ),
    });
  };

  const addPanelPerson = () => {
    setContent({
      ...content,
      panel: [
        ...content.panel,
        createEmptyPerson(`panel-${Date.now()}`),
      ],
    });
  };

  const uploadPanelImage = async (
    index: number,
    file: File,
  ) => {
    setUploading(`panel-${index}`);
    setError("");

    try {
      const url = await uploadImage(file);
      updatePanelPersonImage(index, url);
    } catch (uploadError) {
      console.error(uploadError);
      setError("Panel image upload failed.");
    } finally {
      setUploading("");
    }
  };

  /* ---------------- Executive Body images ---------------- */

  const updateExecutivePersonImage = (
    departmentIndex: number,
    imageIndex: number,
    image: string,
  ) => {
    const executiveBody = [...content.executiveBody];
    const images = [
      ...executiveBody[departmentIndex].images,
    ];

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

      images: executiveBody[
        departmentIndex
      ].images.filter(
        (_, personIndex) =>
          personIndex !== imageIndex,
      ),
    };

    setContent({
      ...content,
      executiveBody,
    });
  };

  const addExecutivePerson = (
    departmentIndex: number,
  ) => {
    const executiveBody = [...content.executiveBody];
    const department = executiveBody[departmentIndex];

    executiveBody[departmentIndex] = {
      ...department,

      images: [
        ...department.images,
        createEmptyPerson(
          `${department.id}-${Date.now()}`,
        ),
      ],
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
    setUploading(
      `eb-${departmentIndex}-${imageIndex}`,
    );

    setError("");

    try {
      const url = await uploadImage(file);

      updateExecutivePersonImage(
        departmentIndex,
        imageIndex,
        url,
      );
    } catch (uploadError) {
      console.error(uploadError);

      setError(
        "Executive body image upload failed.",
      );
    } finally {
      setUploading("");
    }
  };

  /* ---------------- Existing page edit controls ---------------- */

  const startEditing = () => {
    setOriginalContent(
      JSON.parse(JSON.stringify(content)),
    );

    setIsEditing(true);
    setError("");
  };

  const cancelEditing = () => {
    if (saving || uploading) return;

    setContent(
      JSON.parse(JSON.stringify(originalContent)),
    );

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

      setOriginalContent(
        JSON.parse(JSON.stringify(content)),
      );

      setIsEditing(false);
    } catch (saveError) {
      console.error(
        "Failed to save Panel & EB:",
        saveError,
      );

      if (saveError instanceof AxiosError) {
        setError(
          saveError.response?.data?.error ||
            saveError.response?.data?.message ||
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
      <PageLoader label="Loading panel and executive body" />
    );
  }

  /* ---------------- Public visibility ---------------- */

  const showAll = auth && isEditing;

  const hasPanelVideo = Boolean(
    getYouTubeId(content.panelVideoUrl),
  );

  const hasExecutiveVideo = Boolean(
    getYouTubeId(content.executiveVideoUrl),
  );

  const visiblePanel = content.panel
    .map((person, index) => ({
      person,
      index,
    }))
    .filter(
      ({ person }) => showAll || hasImage(person),
    );

  const visibleDepartments = content.executiveBody
    .map((department, departmentIndex) => ({
      department,
      departmentIndex,

      images: department.images
        .map((person, imageIndex) => ({
          person,
          imageIndex,
        }))
        .filter(
          ({ person }) => showAll || hasImage(person),
        ),
    }))
    .filter(
      (item) =>
        showAll || item.images.length > 0,
    );

  const showPanelSection =
    showAll ||
    hasPanelVideo ||
    visiblePanel.length > 0;

  const showExecutiveSection =
    showAll ||
    hasExecutiveVideo ||
    visibleDepartments.length > 0;

  const nothingToShow =
    !showPanelSection &&
    !showExecutiveSection;

  return (
    <main className="min-h-screen bg-background px-4 py-24 font-poppins text-text-secondary md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page heading and existing admin controls */}

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
                    disabled={
                      saving || Boolean(uploading)
                    }
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-bold text-text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <HiX />
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={saveContent}
                    disabled={
                      saving || Boolean(uploading)
                    }
                    className="flex cursor-pointer items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <HiSave />
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
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
          <div className="fixed bottom-6 right-6 z-50 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white shadow-xl">
            Uploading image...
          </div>
        )}

        {/* ==================================================
            PANEL: video, then pictures
        ================================================== */}

        {showPanelSection && (
          <section className="mb-24">
            <div className="mb-7 flex items-center justify-between">
              <h2 className="font-bebasNeue text-6xl tracking-wider text-text-secondary md:text-7xl">
                Panel
              </h2>

              {auth && isEditing && (
                <button
                  type="button"
                  onClick={addPanelPerson}
                  disabled={
                    saving || Boolean(uploading)
                  }
                  className="flex cursor-pointer items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <HiPlus />
                  Add Image
                </button>
              )}
            </div>

            {auth && isEditing && (
              <VideoUrlEditor
                title="Panel YouTube Video"
                value={content.panelVideoUrl}
                onChange={updatePanelVideoUrl}
              />
            )}

            <SectionVideo
              videoUrl={content.panelVideoUrl}
              label="Panel Video"
            />

            {visiblePanel.length > 0 ? (
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-4">
                {visiblePanel.map(
                  ({ person, index }) => (
                    <SolidImageCard
                      key={person.id}
                      person={person}
                      isAdmin={auth}
                      isEditing={isEditing}
                      onRemove={() =>
                        removePanelPerson(index)
                      }
                      onUpload={(file) =>
                        uploadPanelImage(index, file)
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              showAll && (
                <div className="rounded-3xl border-2 border-dashed border-accent/30 bg-accent/5 px-6 py-16 text-center">
                  <p className="text-text-muted">
                    No panel images available.
                  </p>
                </div>
              )
            )}
          </section>
        )}

        {/* ==================================================
            EXECUTIVE BODY: video, then department pictures
        ================================================== */}

        {showExecutiveSection && (
          <section>
            <div className="mb-8">
              <h2 className="font-bebasNeue text-6xl tracking-wider text-text-secondary md:text-7xl">
                Executive Body
              </h2>
            </div>

            {auth && isEditing && (
              <VideoUrlEditor
                title="Executive Body YouTube Video"
                value={content.executiveVideoUrl}
                onChange={updateExecutiveVideoUrl}
              />
            )}

            <SectionVideo
              videoUrl={content.executiveVideoUrl}
              label="Executive Body Video"
            />

            <div className="space-y-20">
              {visibleDepartments.map(
                ({
                  department,
                  departmentIndex,
                  images,
                }) => (
                  <section key={department.id}>
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="font-bebasNeue text-5xl tracking-wider text-accent md:text-6xl">
                        {department.name}
                      </h3>

                      {auth && isEditing && (
                        <button
                          type="button"
                          onClick={() =>
                            addExecutivePerson(
                              departmentIndex,
                            )
                          }
                          disabled={
                            saving ||
                            Boolean(uploading)
                          }
                          className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <HiPlus />
                          Add Image
                        </button>
                      )}
                    </div>

                    {images.length > 0 ? (
                      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {images.map(
                          ({
                            person,
                            imageIndex,
                          }) => (
                            <SolidImageCard
                              key={person.id}
                              person={person}
                              isAdmin={auth}
                              isEditing={isEditing}
                              onRemove={() =>
                                removeExecutivePerson(
                                  departmentIndex,
                                  imageIndex,
                                )
                              }
                              onUpload={(file) =>
                                uploadExecutiveImage(
                                  departmentIndex,
                                  imageIndex,
                                  file,
                                )
                              }
                            />
                          ),
                        )}
                      </div>
                    ) : (
                      showAll && (
                        <div className="rounded-3xl border-2 border-dashed border-accent/30 bg-accent/5 px-6 py-14 text-center">
                          <p className="text-text-muted">
                            No images available for
                            this department.
                          </p>
                        </div>
                      )
                    )}
                  </section>
                ),
              )}
            </div>
          </section>
        )}

        {/* No current Panel & EB images or videos yet */}

        {nothingToShow && (
          <div className="rounded-3xl border-2 border-dashed border-accent/30 bg-accent/5 px-6 py-20 text-center">
            <p className="font-bebasNeue text-3xl tracking-wide text-text-secondary">
              Coming Soon
            </p>

            <p className="mt-2 text-sm text-text-muted">
              Panel and Executive Body content will
              appear here soon.
            </p>
          </div>
        )}

        {/* Previous panels and their separate admin editor */}

        <PreviousPanels />
      </div>
    </main>
  );
}