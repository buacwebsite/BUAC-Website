"use client";

import { useMemo } from "react";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { useAuth } from "@/app/context/AuthProvider";
import { useEditor } from "@/app/context/EditorContext";
import { motion } from "framer-motion";
import PageLoader from "@/app/components/ui/PageLoader";
import {
  MotionSection,
  StaggerGrid,
  StaggerItem,
  RevealHeading,
} from "@/lib/animations";
import { useApiData } from "@/lib/publicContent";

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

function ActivityImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="relative w-full overflow-hidden bg-surface-secondary">
      <img
        src={src}
        alt={alt}
        className="block h-auto w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
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
          className="fixed right-6 bottom-6 z-50 flex cursor-pointer items-center gap-2 rounded-full bg-accent p-4 text-white shadow-lg transition-colors hover:bg-accent/90 sm:right-8 sm:bottom-8"
          title="Edit Activities"
        >
          <HiOutlinePencilAlt size={24} />
        </motion.button>
      )}

      <MotionSection className="min-h-screen bg-background px-4 py-20 font-poppins sm:px-6 lg:px-12">
        <div className="mx-auto mb-12 flex max-w-7xl flex-col items-center text-center sm:mb-16">
          <RevealHeading className="mb-4 font-bebasNeue text-5xl leading-none tracking-tight text-text-secondary sm:text-7xl md:text-8xl lg:text-9xl">
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
          <StaggerGrid className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {activities.map((activity) => (
              <StaggerItem key={activity.id}>
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10"
                >
                  {activity.imageUrl ? (
                    <ActivityImage
                      src={activity.imageUrl}
                      alt={activity.name}
                    />
                  ) : (
                    <div className="flex min-h-[120px] items-center justify-center bg-surface-secondary px-3 py-8">
                      <span className="text-xs text-text-muted/60">
                        No image
                      </span>
                    </div>
                  )}

                  <div className="p-3 sm:p-4">
                    {activity.category && (
                      <span className="mb-2 inline-block rounded-full bg-accent/90 px-2.5 py-0.5 text-[10px] font-medium text-white sm:text-xs">
                        {activity.category}
                      </span>
                    )}

                    <h3 className="mb-1.5 font-bebasNeue text-lg leading-tight tracking-wide text-text-secondary sm:text-2xl">
                      {activity.name}
                    </h3>

                    {activity.description && (
                      <p className="line-clamp-3 text-[11px] leading-relaxed text-text-muted sm:text-sm">
                        {activity.description}
                      </p>
                    )}
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