"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import {
  HiArrowLeft,
  HiChevronLeft,
  HiChevronRight,
  HiOutlinePencilAlt,
} from "react-icons/hi";
import { IoCalendar } from "react-icons/io5";
import { useAuth } from "@/app/context/AuthProvider";
import { useEditor } from "@/app/context/EditorContext";
import { motion, AnimatePresence } from "framer-motion";

interface Activity {
  id: number;
  slug: string;
  name: string;
  description: string;
  date: string;
  category: string;
  imageUrl: string;
  images: string[];
  content: string;
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

export default function ActivityPage() {
  const params = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { auth } = useAuth();
  const { openEditor } = useEditor();

  const handleEdit = () => {
    openEditor("activities", allActivities);
  };

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await axios.get("/api/content/activities");
        const data = response.data;
        const activitiesWithSlugs = (data.activities || []).map(
          (activity: Activity) => ({
            ...activity,
            slug: activity.slug || generateSlug(activity.name),
          }),
        );
        setAllActivities(activitiesWithSlugs);

        const found = activitiesWithSlugs.find(
          (a: Activity) => a.slug === params.slug,
        );
        setActivity(found || null);
      } catch (error) {
        console.error("Failed to fetch activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [params.slug]);

  const nextImage = () => {
    if (activity && activity.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === activity.images.length - 1 ? 0 : prev + 1,
      );
    }
  };

  const prevImage = () => {
    if (activity && activity.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? activity.images.length - 1 : prev - 1,
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-text-secondary text-2xl font-bebasNeue"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!activity) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-background flex flex-col items-center justify-center"
      >
        <div className="text-text-secondary text-4xl font-bebasNeue mb-4">
          Activity Not Found
        </div>
        <button
          onClick={() => router.push("/activities")}
          className="text-accent hover:underline flex items-center gap-2 cursor-pointer"
        >
          <HiArrowLeft /> Back to Activities
        </button>
      </motion.div>
    );
  }

  const displayImages =
    activity.images && activity.images.length > 0
      ? activity.images
      : activity.imageUrl
        ? [activity.imageUrl]
        : [];

  return (
    <div className="min-h-screen bg-background">
      {auth && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          onClick={handleEdit}
          className="fixed bottom-8 right-8 z-50 bg-accent text-white p-4 rounded-full shadow-lg hover:bg-accent/90 transition-colors flex items-center gap-2 cursor-pointer"
          title="Edit Activities"
        >
          <HiOutlinePencilAlt size={24} />
        </motion.button>
      )}

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="px-6 lg:px-12 pt-8"
      >
        <button
          onClick={() => router.push("/activities")}
          className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors cursor-pointer"
        >
          <HiArrowLeft size={20} />
          <span>Back to Activities</span>
        </button>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.1 },
          },
        }}
        className="py-12 px-6 lg:px-12"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-accent/90 text-white px-4 py-1 rounded-full text-sm font-medium">
                {activity.category}
              </span>
              <span className="flex items-center gap-2 text-text-muted text-sm">
                <IoCalendar className="text-accent" />
                {activity.date}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bebasNeue text-text-secondary leading-none tracking-tight mb-4">
              {activity.name}
            </h1>
            <p className="text-xl text-text-muted max-w-3xl">
              {activity.description}
            </p>
          </motion.div>

          {/* Image Slider */}
          {displayImages.length > 0 && (
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
              }}
              className="relative w-full h-[60vh] mb-12 rounded-2xl overflow-hidden group"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={displayImages[currentImageIndex]}
                    alt={`${activity.name} - Image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {displayImages.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <HiChevronLeft size={24} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <HiChevronRight size={24} />
                  </motion.button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {displayImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? "bg-accent w-8"
                            : "bg-white/50 hover:bg-white/80"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {displayImages.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                  {currentImageIndex + 1} / {displayImages.length}
                </div>
              )}
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.3 } },
            }}
            className="max-w-4xl mx-auto"
          >
            <div className="prose prose-lg prose-invert max-w-none">
              <div
                className="text-text-muted leading-relaxed whitespace-pre-wrap"
                style={{ fontSize: "1.125rem", lineHeight: "1.75" }}
              >
                {activity.content || "No detailed content available yet."}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}