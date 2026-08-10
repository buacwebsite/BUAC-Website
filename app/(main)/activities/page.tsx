"use client";

import { useMemo } from "react";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { useAuth } from "@/app/context/AuthProvider";
import { useEditor } from "@/app/context/EditorContext";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MotionSection,
  StaggerGrid,
  StaggerItem,
  RevealHeading,
} from "@/lib/animations";
import {
  STATIC_ACTIVITIES,
  type Activity,
} from "@/lib/siteContent";
import { usePublicContent } from "@/lib/publicContent";

interface ActivitiesResponse {
  activities: Activity[];
}

function mergeActivities(
  codeActivities: Activity[],
  apiActivities: Activity[],
) {
  const apiByName = new Map(
    apiActivities.map((activity) => [
      activity.name.trim().toLowerCase(),
      activity,
    ]),
  );

  return codeActivities.map((activity) => {
    const saved = apiByName.get(
      activity.name.trim().toLowerCase(),
    );

    return {
      ...activity,
      imageUrl: saved?.imageUrl || activity.imageUrl,
    };
  });
}

const Activities = () => {
  const { auth } = useAuth();
  const { openEditor } = useEditor();

  const { data } = usePublicContent<ActivitiesResponse>(
    "/api/content/activities",
    {
      activities: STATIC_ACTIVITIES,
    },
  );

  const activities = useMemo(() => {
    const apiActivities = Array.isArray(data?.activities)
      ? data.activities
      : [];

    return mergeActivities(
      STATIC_ACTIVITIES,
      apiActivities,
    );
  }, [data]);

  const handleEdit = () => {
    openEditor("activities", activities);
  };

  return (
    <>
      {auth && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          onClick={handleEdit}
          className="fixed right-8 bottom-8 z-50 flex cursor-pointer items-center gap-2 rounded-full bg-accent p-4 text-white shadow-lg transition-colors hover:bg-accent/90"
          title="Edit Activities"
        >
          <HiOutlinePencilAlt size={24} />
        </motion.button>
      )}

      <MotionSection className="min-h-screen bg-background px-6 py-20 font-poppins lg:px-12">
        <div className="mx-auto mb-16 flex max-w-7xl flex-col items-center text-center">
          <RevealHeading className="mb-4 font-bebasNeue text-6xl leading-none tracking-tight text-text-secondary md:text-8xl lg:text-9xl">
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
                transition: {
                  delay: 0.2,
                  duration: 0.5,
                },
              },
            }}
            className="max-w-2xl text-lg text-text-muted"
          >
            Explore our exciting events, programs, and initiatives that bring
            the outdoor adventure community together.
          </motion.p>
        </div>

        <StaggerGrid className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <StaggerItem key={`${activity.id}-${activity.name}`}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{
                  duration: 0.25,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10"
              >
                <div className="relative h-64 overflow-hidden">
                  {activity.imageUrl ? (
                    <Image
                      src={activity.imageUrl}
                      alt={activity.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5 px-4">
                      <div className="text-center">
                        <div className="mb-2 font-bebasNeue text-4xl text-text-secondary/30">
                          {activity.name}
                        </div>
                        <div className="text-sm text-text-muted/50">
                          No image
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <div className="absolute top-4 left-4">
                    <span className="rounded-full bg-accent/90 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                      {activity.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="mb-2 font-bebasNeue text-2xl tracking-wide text-text-secondary">
                    {activity.name}
                  </h3>

                  <p className="line-clamp-4 text-sm leading-relaxed text-text-muted">
                    {activity.description}
                  </p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </MotionSection>
    </>
  );
};

export default Activities;