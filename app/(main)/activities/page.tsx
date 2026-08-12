"use client";

import { HiOutlinePencilAlt } from "react-icons/hi";
import { useAuth } from "@/app/context/AuthProvider";
import { useEditor } from "@/app/context/EditorContext";
import Image from "next/image";
import { motion } from "framer-motion";
import PageLoader from "@/app/components/ui/PageLoader";
import {
  MotionSection,
  StaggerGrid,
  StaggerItem,
  RevealHeading,
} from "@/lib/animations";
import { useApiData } from "@/lib/publicContent";
import { useMemo } from "react";

interface Activity {
  id: number;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
}

interface ActivitiesResponse {
  activities?: Activity[];
  error?: string;
}

const Activities = () => {
  const { auth } = useAuth();
  const { openEditor } = useEditor();

  const { data, loading, error } = useApiData<ActivitiesResponse>(
    "/api/content/activities",
  );

  const activities = useMemo(
    () => (Array.isArray(data?.activities) ? data.activities : []),
    [data],
  );

  const handleEdit = () => {
    openEditor("activities", activities);
  };

  if (loading) {
    return <PageLoader label="Loading activities" />;
  }

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
        </div>

        {error ? (
          <div className="mx-auto max-w-2xl rounded-3xl border-2 border-dashed border-red-500/25 bg-red-500/5 px-6 py-20 text-center">
            <p className="text-text-muted">
              Unable to load activities right now. Please try again later.
            </p>
          </div>
        ) : activities.length > 0 ? (
          <StaggerGrid className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <StaggerItem key={activity.id}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
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
                      <div className="flex h-full w-full items-center justify-center bg-surface-secondary px-4">
                        <span className="text-sm text-text-muted/60">
                          No image
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {activity.category && (
                      <div className="absolute top-4 left-4">
                        <span className="rounded-full bg-accent/90 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                          {activity.category}
                        </span>
                      </div>
                    )}
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
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto max-w-7xl py-20 text-center"
          >
            <p className="text-lg text-text-muted">
              {auth
                ? "No activities added yet. Click Edit to add some."
                : "No activities available at the moment."}
            </p>
          </motion.div>
        )}
      </MotionSection>
    </>
  );
};

export default Activities;