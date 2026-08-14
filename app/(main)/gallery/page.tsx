"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import {
  HiOutlinePencilAlt,
} from "react-icons/hi";
import {
  FaImages,
  FaYoutube,
} from "react-icons/fa6";
import { motion } from "framer-motion";
import { useAuth } from "@/app/context/AuthProvider";
import { useEditor } from "@/app/context/EditorContext";
import { ImageGallery } from "@/app/components/gallery/ImageGallery";
import YouTubeGallery from "@/app/components/gallery/YouTubeGallery";
import { useApiData } from "@/lib/publicContent";
import BUACLoader from "@/app/components/ui/BUACLoader";

type GalleryCategory =
  | "pictures"
  | "videos";

interface GalleryItem {
  id: number;
  type: "image" | "video";
  url: string;
  youtubeUrl: string;
}

interface GalleryResponse {
  images?: GalleryItem[];
  error?: string;
}

interface TourImage {
  type?: string;
  alt?: string;
  url: string;
}

interface Tour {
  id: number | string;
  name?: string;
  images?: TourImage[];
}

interface ToursResponse {
  tours?: Tour[];
  error?: string;
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
  videos?: YouTubeVideo[];
  error?: string;
}

function uniqueImageUrls(urls: string[]) {
  return Array.from(
    new Set(
      urls
        .map((url) => url?.trim())
        .filter(
          (url): url is string =>
            Boolean(url),
        ),
    ),
  );
}

export default function Gallery() {
  const { auth } = useAuth();
  const { openEditor } = useEditor();

  const [
    activeCategory,
    setActiveCategory,
  ] = useState<GalleryCategory>(
    "pictures",
  );

  const {
    data: galleryData,
    loading: galleryLoading,
    error: galleryError,
  } = useApiData<GalleryResponse>(
    "/api/content/gallery",
  );

  const {
    data: toursData,
    loading: toursLoading,
    error: toursError,
  } = useApiData<ToursResponse>(
    "/api/content/tours",
  );

  const galleryItems = useMemo(() => {
    return Array.isArray(
      galleryData?.images,
    )
      ? galleryData.images
      : [];
  }, [galleryData]);

  const uploadedGalleryPictures =
    useMemo(() => {
      return galleryItems
        .filter(
          (item) =>
            item.type === "image" &&
            Boolean(item.url?.trim()),
        )
        .map((item) =>
          item.url.trim(),
        );
    }, [galleryItems]);

  const tourPictureUrls =
    useMemo(() => {
      const tours = Array.isArray(
        toursData?.tours,
      )
        ? toursData.tours
        : [];

      return tours.flatMap((tour) => {
        if (!Array.isArray(tour.images)) {
          return [];
        }

        return tour.images
          .map((image) => image?.url)
          .filter(
            (url): url is string =>
              typeof url === "string" &&
              Boolean(url.trim()),
          );
      });
    }, [toursData]);

  const pictureUrls = useMemo(() => {
    return uniqueImageUrls([
      ...uploadedGalleryPictures,
      ...tourPictureUrls,
    ]);
  }, [
    uploadedGalleryPictures,
    tourPictureUrls,
  ]);

  const [
    channelVideos,
    setChannelVideos,
  ] = useState<YouTubeVideo[]>([]);

  const [
    loadingVideos,
    setLoadingVideos,
  ] = useState(true);

  const [
    videoError,
    setVideoError,
  ] = useState("");

  const [
    channelUrl,
    setChannelUrl,
  ] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchChannelVideos =
      async () => {
        setLoadingVideos(true);
        setVideoError("");

        try {
          const response =
            await axios.get<YouTubeChannelResponse>(
              "/api/content/youtube-channel",
            );

          if (cancelled) return;

          setChannelVideos(
            Array.isArray(
              response.data.videos,
            )
              ? response.data.videos
              : [],
          );

          if (
            response.data.channelId
          ) {
            setChannelUrl(
              `https://www.youtube.com/channel/${response.data.channelId}`,
            );
          } else if (
            response.data.channelInput
          ) {
            const input =
              response.data.channelInput;

            const handle =
              input.startsWith("@")
                ? input
                : `@${input}`;

            setChannelUrl(
              `https://www.youtube.com/${handle}`,
            );
          } else {
            setChannelUrl("");
          }

          if (response.data.error) {
            setVideoError(
              response.data.error,
            );
          }
        } catch (error) {
          console.error(
            "Failed to fetch YouTube videos:",
            error,
          );

          if (!cancelled) {
            setVideoError(
              "Failed to load YouTube videos.",
            );
          }
        } finally {
          if (!cancelled) {
            setLoadingVideos(false);
          }
        }
      };

    fetchChannelVideos();

    return () => {
      cancelled = true;
    };
  }, []);

  const picturesLoading =
    galleryLoading && toursLoading;

  const picturesPartiallyLoading =
    pictureUrls.length === 0 &&
    (galleryLoading || toursLoading);

  const picturesFailed =
    pictureUrls.length === 0 &&
    Boolean(galleryError) &&
    Boolean(toursError);

  return (
    <main className="buac-gradient-bg min-h-screen px-4 py-20 font-poppins text-text-secondary md:px-8">
      {auth && (
        <motion.button
          initial={{
            opacity: 0,
            scale: 0,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.4,
            type: "spring",
          }}
          onClick={() =>
            openEditor(
              "gallery",
              galleryItems,
            )
          }
          className="fixed right-5 bottom-6 z-50 flex cursor-pointer items-center justify-center rounded-full bg-accent p-4 text-white shadow-xl transition hover:bg-accent/90 sm:right-8 sm:bottom-8"
          title="Edit gallery pictures"
          aria-label="Edit gallery pictures"
        >
          <HiOutlinePencilAlt
            size={24}
          />
        </motion.button>
      )}

      <div className="mx-auto max-w-7xl">
        <motion.header
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-accent">
            BUAC Memories
          </p>

          <h1 className="font-bebasNeue text-6xl leading-none tracking-wider text-text-secondary md:text-8xl">
            Gallery
          </h1>
        </motion.header>

        <div className="mb-10 flex justify-center">
          <div className="inline-flex rounded-full border border-border bg-surface/80 p-1.5 shadow-lg backdrop-blur-md">
            <button
              type="button"
              onClick={() =>
                setActiveCategory(
                  "pictures",
                )
              }
              className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition sm:px-5 sm:text-sm ${
                activeCategory ===
                "pictures"
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
              onClick={() =>
                setActiveCategory("videos")
              }
              className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition sm:px-5 sm:text-sm ${
                activeCategory ===
                "videos"
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

        {activeCategory ===
          "pictures" && (
          <motion.section
            key="pictures"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
          >
            {picturesLoading ||
            picturesPartiallyLoading ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center gap-4">
                <BUACLoader size="lg" />

                <p className="text-sm text-text-muted">
                  Loading pictures...
                </p>
              </div>
            ) : picturesFailed ? (
              <div className="flex min-h-[360px] items-center justify-center rounded-3xl border-2 border-dashed border-red-500/25 bg-red-500/5 px-6 text-center">
                <p className="text-sm text-red-400">
                  Unable to load gallery
                  and tour pictures.
                </p>
              </div>
            ) : pictureUrls.length > 0 ? (
              <ImageGallery
                images={pictureUrls}
                columns={3}
              />
            ) : (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-accent/25 bg-surface/50 px-6 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <FaImages className="h-10 w-10" />
                </div>

                <h2 className="font-bebasNeue text-4xl tracking-wider text-text-secondary">
                  No Pictures Yet
                </h2>

                <p className="mt-2 max-w-md text-sm text-text-muted">
                  Gallery and tour pictures
                  will appear here after they
                  are added.
                </p>
              </div>
            )}
          </motion.section>
        )}

        {activeCategory ===
          "videos" && (
          <motion.section
            key="videos"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
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