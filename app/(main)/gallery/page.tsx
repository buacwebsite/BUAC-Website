"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { FaImages, FaYoutube } from "react-icons/fa6";
import { motion } from "framer-motion";
import { useAuth } from "@/app/context/AuthProvider";
import { useEditor } from "@/app/context/EditorContext";
import { ImageGallery } from "@/app/components/gallery/ImageGallery";
import YouTubeGallery from "@/app/components/gallery/YouTubeGallery";
import { usePublicContent } from "@/lib/publicContent";

type GalleryCategory = "pictures" | "videos";

interface GalleryItem {
  id: number;
  type: "image" | "video";
  url: string;
  youtubeUrl: string;
}

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  watchUrl: string;
}

interface YouTubeChannelResponse {
  channelId?: string;
  channelInput?: string;
  totalVideos?: number;
  videos: YouTubeVideo[];
  error?: string;
}

const FALLBACK_PICTURES: string[] = [
  "/assets/footerbg.webp",
  "/assets/panelbg.jpg",
  "/assets/footerbg.webp",
  "/assets/panelbg.jpg",
  "/assets/footerbg.webp",
  "/assets/panelbg.jpg",
];

const STATIC_GALLERY_ITEMS: GalleryItem[] = [];

export default function Gallery() {
  const { auth } = useAuth();
  const { openEditor } = useEditor();

  const [activeCategory, setActiveCategory] =
    useState<GalleryCategory>("pictures");

  const { data: apiData } = usePublicContent<{ images: GalleryItem[] }>(
    "/api/content/gallery",
    { images: STATIC_GALLERY_ITEMS },
  );

  const items = useMemo(
    () => (Array.isArray(apiData?.images) ? apiData.images : []),
    [apiData],
  );

  const adminPictureUrls = useMemo(
    () =>
      items
        .filter(
          (item) => item.type === "image" && Boolean(item.url?.trim()),
        )
        .map((item) => item.url.trim()),
    [items],
  );

  const pictureUrls = useMemo(
    () => (adminPictureUrls.length > 0 ? adminPictureUrls : FALLBACK_PICTURES),
    [adminPictureUrls],
  );

  const [channelVideos, setChannelVideos] = useState<YouTubeVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [videoError, setVideoError] = useState("");
  const [channelUrl, setChannelUrl] = useState("");

  useEffect(() => {
    const fetchChannelVideos = async () => {
      try {
        const response = await axios.get<YouTubeChannelResponse>(
          "/api/content/youtube-channel",
        );

        if (Array.isArray(response.data.videos)) {
          setChannelVideos(response.data.videos);
        }

        if (response.data.channelId) {
          setChannelUrl(
            `https://www.youtube.com/channel/${response.data.channelId}`,
          );
        } else if (response.data.channelInput) {
          const input = response.data.channelInput;
          const handle = input.startsWith("@") ? input : `@${input}`;
          setChannelUrl(`https://www.youtube.com/${handle}`);
        }

        if (response.data.error) {
          setVideoError(response.data.error);
        }
      } catch (error) {
        console.error("Failed to fetch YouTube channel videos:", error);
        setVideoError("Failed to load YouTube videos.");
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchChannelVideos();
  }, []);

  return (
    <main className="buac-gradient-bg min-h-screen px-4 py-20 font-poppins text-text-secondary md:px-8">
      {auth && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          onClick={() => openEditor("gallery", items)}
          className="fixed right-6 bottom-8 z-50 flex cursor-pointer items-center gap-2 rounded-full bg-accent p-4 text-white shadow-xl transition hover:bg-accent/90"
          title="Edit Gallery Pictures"
        >
          <HiOutlinePencilAlt size={24} />
        </motion.button>
      )}

      <div className="mx-auto max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-accent">
            BUAC Memories
          </p>

          <h1 className="font-bebasNeue text-6xl leading-none tracking-wider text-text-secondary md:text-8xl">
            GALLERY
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-text-muted md:text-base">
            Explore pictures from BUAC adventures and watch our YouTube videos.
          </p>
        </motion.header>

        <div className="mb-10 flex justify-center">
          <div className="inline-flex rounded-full border border-border bg-surface/80 p-1.5 shadow-lg backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveCategory("pictures")}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeCategory === "pictures"
                  ? "bg-accent text-white shadow-lg shadow-accent/20"
                  : "text-text-muted hover:text-accent"
              }`}
            >
              <FaImages />
              Pictures
              <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px]">
                {pictureUrls.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory("videos")}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeCategory === "videos"
                  ? "bg-accent text-white shadow-lg shadow-accent/20"
                  : "text-text-muted hover:text-accent"
              }`}
            >
              <FaYoutube />
              Videos
              <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px]">
                {channelVideos.length}
              </span>
            </button>
          </div>
        </div>

        {activeCategory === "pictures" && (
          <motion.section
            key="pictures"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <ImageGallery images={pictureUrls} columns={3} />
          </motion.section>
        )}

        {activeCategory === "videos" && (
          <motion.section
            key="videos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <YouTubeGallery
              videos={channelVideos}
              loading={loadingVideos}
              error={videoError}
              channelUrl={channelUrl}
            />
          </motion.section>
        )}
      </div>
    </main>
  );
}