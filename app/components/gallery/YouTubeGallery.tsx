"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineSearch, HiOutlineX } from "react-icons/hi";
import { FaYoutube } from "react-icons/fa6";
import Link from "next/link";
import BUACLoader from "@/app/components/ui/BUACLoader";

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  watchUrl: string;
}

interface YouTubeGalleryProps {
  videos: YouTubeVideo[];
  loading: boolean;
  error?: string;
  channelUrl?: string;
}

function decodeHtmlEntities(text: string) {
  if (typeof window === "undefined") {
    return text
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  }

  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

function formatRelativeDate(publishedAt: string) {
  const date = new Date(publishedAt);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;

  return `${Math.floor(diff / 31536000)} years ago`;
}

export default function YouTubeGallery({
  videos,
  loading,
  error,
  channelUrl,
}: YouTubeGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [search, setSearch] = useState("");

  const filteredVideos = useMemo(() => {
    if (!search.trim()) return videos;
    const query = search.toLowerCase().trim();
    return videos.filter((video) =>
      decodeHtmlEntities(video.title).toLowerCase().includes(query),
    );
  }, [videos, search]);

  useEffect(() => {
    if (!selectedVideo) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedVideo(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedVideo]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <BUACLoader size="lg" />
        <p className="text-sm text-text-muted">Loading YouTube videos...</p>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-accent/25 bg-surface/50 px-6 text-center backdrop-blur-md">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <FaYoutube className="h-10 w-10" />
        </div>

        <h2 className="font-bebasNeue text-4xl tracking-wider text-text-secondary">
          {error ? "YouTube Not Connected" : "No Videos Yet"}
        </h2>

        <p className="mt-2 max-w-md text-sm text-text-muted">
          {error || "YouTube channel videos will appear here soon."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="relative w-full max-w-md">
            <HiOutlineSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search videos..."
              className="w-full rounded-full border border-border bg-surface/80 py-3 pl-11 pr-4 text-sm text-text-secondary outline-none backdrop-blur-md focus:border-accent"
            />
          </div>
        </div>

        {channelUrl && (
          <Link
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700 hover:shadow-xl"
          >
            <FaYoutube className="h-5 w-5" />
            Visit YouTube Channel
          </Link>
        )}
      </div>

      {filteredVideos.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-border bg-surface/50 p-8 text-center">
          <HiOutlineSearch className="mb-3 h-10 w-10 text-text-muted" />
          <p className="text-lg font-semibold text-text-secondary">
            No videos found
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Try a different search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video, index) => {
            const cleanTitle = decodeHtmlEntities(video.title);

            return (
              <motion.button
                key={video.id}
                type="button"
                onClick={() => setSelectedVideo(video)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: Math.min(index * 0.03, 0.6),
                  duration: 0.4,
                }}
                whileHover={{ y: -4 }}
                className="group block cursor-pointer overflow-hidden rounded-2xl bg-transparent text-left transition"
              >
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-surface-secondary">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={cleanTitle}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-text-muted">
                      Thumbnail unavailable
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-black/30" />

                    <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl">
                      <svg
                        viewBox="0 0 24 24"
                        className="ml-1 h-8 w-8 fill-current"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                    <FaYoutube className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-text-secondary transition group-hover:text-accent">
                      {cleanTitle}
                    </h3>

                    <p className="mt-1 text-xs text-text-muted">
                      BUAC Official
                    </p>

                    <p className="text-xs text-text-muted">
                      {formatRelativeDate(video.publishedAt)}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-5xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-12 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
                aria-label="Close video"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>

              <div className="overflow-hidden rounded-2xl bg-black shadow-2xl">
                <div className="relative aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0`}
                    title={decodeHtmlEntities(selectedVideo.title)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}