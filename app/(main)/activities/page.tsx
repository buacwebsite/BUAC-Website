"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { IoCalendarSharp } from "react-icons/io5";
import { useAuth } from "@/app/context/AuthProvider";
import { useEditor } from "@/app/context/EditorContext";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MotionSection,
  StaggerGrid,
  StaggerItem,
  RevealHeading,
} from "@/lib/animations";

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

const Activities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const { auth } = useAuth();
  const { openEditor } = useEditor();

  const handleEdit = () => {
    openEditor("activities", activities);
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get("/api/content/activities");
        const data = response.data;
        const activitiesWithSlugs = (data.activities || []).map(
          (activity: Activity) => ({
            ...activity,
            slug: activity.slug || generateSlug(activity.name),
          }),
        );
        setActivities(activitiesWithSlugs);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-text-secondary text-2xl font-bebasNeue"
        >
          Loading activities...
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {auth && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          onClick={handleEdit}
          className="fixed bottom-8 right-8 z-50 bg-accent text-white p-4 rounded-full shadow-lg hover:bg-accent/90 transition-colors flex items-center gap-2 cursor-pointer"
          title="Edit Activities"
        >
          <HiOutlinePencilAlt size={24} />
        </motion.button>
      )}

      <MotionSection className="min-h-screen bg-background py-20 px-6 lg:px-12 font-poppins">
        <div className="max-w-7xl mx-auto mb-16 text-center flex flex-col items-center">
          <RevealHeading className="text-6xl md:text-8xl lg:text-9xl font-bebasNeue text-text-secondary leading-none tracking-tight mb-4">
            ACTIVITIES
          </RevealHeading>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { delay: 0.2, duration: 0.5 },
              },
            }}
            className="text-lg text-text-muted max-w-2xl"
          >
            Explore our exciting events, programs, and initiatives that bring
            the outdoor adventure community together.
          </motion.p>
        </div>

        <StaggerGrid className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity) => (
            <StaggerItem key={activity.id}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                <Link
                  href={`/activities/${activity.slug}`}
                  className="group bg-background border border-text-muted/20 rounded-2xl overflow-hidden hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-accent/10 cursor-pointer block"
                >
                  <div className="relative h-64 overflow-hidden">
                    {activity.imageUrl ? (
                      <Image
                        src={activity.imageUrl}
                        alt={activity.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl font-bebasNeue text-text-secondary/30 mb-2">
                            {activity.name}
                          </div>
                          <div className="text-sm text-text-muted/50">
                            No image
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-accent/90 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                        {activity.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bebasNeue text-text-secondary mb-2 tracking-wide">
                      {activity.name}
                    </h3>
                    <p className="text-text-muted text-sm mb-4 line-clamp-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-accent text-sm">
                      <IoCalendarSharp size={16} />
                      <span>{activity.date}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerGrid>

        {/* Empty State */}
        {activities.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto text-center py-20"
          >
            <div className="text-6xl mb-4 opacity-30">📅</div>
            <p className="text-text-muted text-lg">
              No activities available at the moment.
            </p>
          </motion.div>
        )}
      </MotionSection>
    </>
  );
};

export default Activities;