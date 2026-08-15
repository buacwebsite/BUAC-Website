"use client";

import React, {
  useMemo,
  useState,
} from "react";
import {
  HiOutlinePencilAlt,
  HiX,
  HiPlus,
  HiTrash,
} from "react-icons/hi";
import { HiOutlineBars3 } from "react-icons/hi2";
import axios from "axios";
import Image from "next/image";
import { useScrollLock } from "@/lib/scrollLockHelper";

interface BlogPost {
  id: string;
  name: string;
  designation: string;
  quote: string;
  src: string;
}

interface BlogEditorProps {
  data: BlogPost[];
  onClose: () => void;
}

function createPostId() {
  return `blog-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function getImageName(
  source: string,
  fallback: string,
) {
  if (!source) {
    return fallback;
  }

  try {
    const url = new URL(
      source,
      window.location.origin,
    );

    const lastPart =
      url.pathname
        .split("/")
        .filter(Boolean)
        .pop() || fallback;

    return decodeURIComponent(lastPart);
  } catch {
    const parts = source.split("/");
    return parts[parts.length - 1] || fallback;
  }
}

function CompactReorderList({
  posts,
  onReorder,
}: {
  posts: BlogPost[];
  onReorder: (
    newPosts: BlogPost[],
  ) => void;
}) {
  const [dragIndex, setDragIndex] =
    useState<number | null>(null);

  const [
    dragOverIndex,
    setDragOverIndex,
  ] = useState<number | null>(null);

  const handleDrop = (
    dropIndex: number,
  ) => {
    if (
      dragIndex === null ||
      dragIndex === dropIndex
    ) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...posts];
    const [movedPost] =
      updated.splice(dragIndex, 1);

    updated.splice(dropIndex, 0, movedPost);

    onReorder(updated);

    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <section className="mb-6 rounded-2xl border border-border bg-surface p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">
        Reorder Posts
      </h3>

      <p className="mb-3 text-xs text-text-muted">
        Drag a post name to change the
        display order.
      </p>

      <div className="space-y-1.5">
        {posts.map((post, index) => (
          <div
            key={post.id}
            draggable
            onDragStart={() =>
              setDragIndex(index)
            }
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverIndex(index);
            }}
            onDrop={() =>
              handleDrop(index)
            }
            onDragEnd={() => {
              setDragIndex(null);
              setDragOverIndex(null);
            }}
            className={`flex cursor-grab items-center gap-3 rounded-lg border px-3 py-2 text-sm transition active:cursor-grabbing ${
              dragOverIndex === index
                ? "border-accent bg-accent/10"
                : dragIndex === index
                  ? "border-accent opacity-40"
                  : "border-border bg-background hover:border-accent/40"
            }`}
          >
            <HiOutlineBars3 className="h-4 w-4 shrink-0 text-accent" />

            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">
              {index + 1}
            </span>

            <span className="min-w-0 flex-1 truncate font-medium text-text-secondary">
              {post.name ||
                getImageName(
                  post.src,
                  `Blog Post ${index + 1}`,
                )}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function BlogEditor({
  data,
  onClose,
}: BlogEditorProps) {
  useScrollLock(true);

  const [posts, setPosts] =
    useState<BlogPost[]>(
      (data || []).map(
        (post, index) => ({
          id:
            post.id ||
            `blog-${index + 1}`,
          name:
            post.name || "",
          designation:
            post.designation || "",
          quote:
            post.quote || "",
          src: post.src || "",
        }),
      ),
    );

  const [saving, setSaving] =
    useState(false);

  const [
    uploadingIndex,
    setUploadingIndex,
  ] = useState<number | null>(
    null,
  );

  const [error, setError] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const nextPostId = useMemo(
    () => createPostId(),
    [posts.length],
  );

  const updatePost = (
    index: number,
    field: keyof BlogPost,
    value: string,
  ) => {
    setPosts((previous) => {
      const updated = [...previous];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;
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
        },
      );

      if (!response.data?.url) {
        throw new Error(
          "Upload failed",
        );
      }

      updatePost(
        index,
        "src",
        response.data.url,
      );

      setSuccessMessage(
        "Image uploaded successfully.",
      );
    } catch (uploadError) {
      console.error(
        "Failed to upload image:",
        uploadError,
      );

      setError(
        "Failed to upload image.",
      );
    } finally {
      setUploadingIndex(null);
    }
  };

  const addPost = () => {
    setPosts((previous) => [
      ...previous,
      {
        id: nextPostId,
        name: "New Blog Post",
        designation: "",
        quote: "",
        src: "",
      },
    ]);
  };

  const removePost = (
    index: number,
  ) => {
    setPosts((previous) =>
      previous.filter(
        (_, postIndex) =>
          postIndex !== index,
      ),
    );
  };

  const validate = () => {
    if (!posts.length) {
      return "Add at least one blog post.";
    }

    for (
      let index = 0;
      index < posts.length;
      index += 1
    ) {
      const post = posts[index];

      if (!post.name.trim()) {
        return `Post ${index + 1}: title is required.`;
      }

      if (!post.quote.trim()) {
        return `Post ${index + 1}: text content is required.`;
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

    const validationError =
      validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    const cleanPosts = posts.map(
      (post, index) => ({
        id:
          post.id ||
          `blog-${index + 1}`,
        name: post.name.trim(),
        designation:
          post.designation.trim(),
        /*
         * Do not trim quote.
         * Keep all user-entered spaces
         * and paragraph breaks.
         */
        quote: post.quote,
        src: post.src.trim(),
      }),
    );

    try {
      const response = await axios.put(
        "/api/content/blog",
        {
          posts: cleanPosts,
        },
        {
          withCredentials: true,
        },
      );

      if (response.status === 200) {
        setSuccessMessage(
          "Blog posts saved successfully.",
        );

        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 500);
      }
    } catch (saveError) {
      console.error(
        "Failed to save blog posts:",
        saveError,
      );

      setError(
        "Failed to save blog posts.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex max-h-[85vh] min-h-[60vh] w-full flex-col overflow-hidden rounded-2xl bg-background">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-text-secondary">
          <HiOutlinePencilAlt className="text-accent" />
          Edit Blog Posts
        </h2>

        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="cursor-pointer rounded-lg p-2 text-text-muted transition hover:text-accent disabled:opacity-50"
          aria-label="Close blog editor"
        >
          <HiX size={24} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-500">
              {successMessage}
            </div>
          )}

          <CompactReorderList
            posts={posts}
            onReorder={setPosts}
          />

          <div className="space-y-4 pb-4">
            {posts.map(
              (post, index) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-border bg-surface p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-xs font-bold uppercase tracking-widest text-accent">
                      Post {index + 1} —{" "}
                      {post.name ||
                        "Untitled"}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        removePost(index)
                      }
                      disabled={saving}
                      className="shrink-0 cursor-pointer rounded-lg p-1.5 text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                      aria-label={`Remove post ${index + 1}`}
                    >
                      <HiTrash size={18} />
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-text-secondary">
                        Post Title
                      </label>

                      <input
                        type="text"
                        value={post.name}
                        onChange={(event) =>
                          updatePost(
                            index,
                            "name",
                            event.target.value,
                          )
                        }
                        disabled={saving}
                        className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-2.5 text-sm text-text-secondary outline-none focus:border-accent disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-text-secondary">
                        Location / Category
                      </label>

                      <input
                        type="text"
                        value={
                          post.designation
                        }
                        onChange={(event) =>
                          updatePost(
                            index,
                            "designation",
                            event.target.value,
                          )
                        }
                        disabled={saving}
                        className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-2.5 text-sm text-text-secondary outline-none focus:border-accent disabled:opacity-50"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-text-secondary">
                        Blog Text
                      </label>

                      <textarea
                        value={post.quote}
                        onChange={(event) =>
                          updatePost(
                            index,
                            "quote",
                            event.target.value,
                          )
                        }
                        disabled={saving}
                        rows={8}
                        className="w-full resize-y rounded-xl border border-input-border bg-input-bg px-4 py-3 text-sm leading-relaxed text-text-secondary outline-none placeholder:text-text-muted focus:border-accent disabled:opacity-50"
                        placeholder={`Write your blog post here.

Use Enter for a new line.

Use an empty line between paragraphs.

Your spacing and line breaks will be preserved on the Blog page.`}
                      />

                      <p className="mt-1 text-[11px] text-text-muted">
                        Your line breaks, empty lines,
                        and spaces are preserved.
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-text-secondary">
                        Image
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          handleImageUpload(
                            index,
                            event.target.files?.[0] ||
                              null,
                          )
                        }
                        disabled={
                          saving ||
                          uploadingIndex ===
                            index
                        }
                        className="w-full rounded-xl border border-input-border bg-input-bg p-2.5 text-sm text-text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-white disabled:opacity-50"
                      />

                      {uploadingIndex ===
                        index && (
                        <p className="mt-1 text-xs text-accent">
                          Uploading image...
                        </p>
                      )}

                      {post.src && (
                        <div className="relative mt-3 h-40 w-full overflow-hidden rounded-xl border border-border bg-surface-secondary">
                          <Image
                            src={post.src}
                            alt={
                              post.name ||
                              "Blog post"
                            }
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ),
            )}

            <button
              type="button"
              onClick={addPost}
              disabled={saving}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent/40 px-4 py-3 text-sm font-semibold text-accent transition hover:bg-accent/10 disabled:opacity-50"
            >
              <HiPlus />
              Add New Blog Post
            </button>
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-background px-6 py-4">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text-muted transition hover:text-accent disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                uploadingIndex !== null
              }
              className="cursor-pointer rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : uploadingIndex !== null
                  ? "Wait for Upload..."
                  : "Save Blog Posts"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}