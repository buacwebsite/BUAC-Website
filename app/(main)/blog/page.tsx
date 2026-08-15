"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import {
  HiOutlineBookOpen,
  HiOutlinePencilAlt,
} from "react-icons/hi";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import axios from "axios";
import { useAuth } from "@/app/context/AuthProvider";
import { useEditor } from "@/app/context/EditorContext";
import PageLoader from "@/app/components/ui/PageLoader";
import { useApiData } from "@/lib/publicContent";

interface BlogPost {
  id: string;
  name: string;
  designation: string;
  quote: string;
  src: string;
}

interface BlogResponse {
  posts?: BlogPost[];
  error?: string;
}

interface BlogInteraction {
  likeCount: number;
  likedByCurrentUser: boolean;
}

interface InteractionsResponse {
  interactions?: Record<string, BlogInteraction>;
  error?: string;
}

const emptyInteraction: BlogInteraction = {
  likeCount: 0,
  likedByCurrentUser: false,
};

function calculateGap(width: number) {
  const minWidth = 1024;
  const maxWidth = 1456;
  const minGap = 60;
  const maxGap = 86;

  if (width <= minWidth) return minGap;

  if (width >= maxWidth) {
    return Math.max(
      minGap,
      maxGap + 0.06018 * (width - maxWidth),
    );
  }

  return (
    minGap +
    (maxGap - minGap) *
      ((width - minWidth) / (maxWidth - minWidth))
  );
}

function BlogImageCarousel({
  posts,
  activeIndex,
}: {
  posts: BlogPost[];
  activeIndex: number;
}) {
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const [containerWidth, setContainerWidth] = useState(1200);
  const [imageRatios, setImageRatios] = useState<Record<string, number>>({});

  const postsLength = posts.length;
  const activePost = posts[activeIndex] || posts[0];

  useEffect(() => {
    const updateWidth = () => {
      if (imageContainerRef.current) {
        setContainerWidth(imageContainerRef.current.offsetWidth);
      }
    };

    updateWidth();

    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const updateRatio = (postId: string, width: number, height: number) => {
    if (!width || !height) return;

    const ratio = width / height;

    setImageRatios((previous) => ({
      ...previous,
      [postId]: ratio,
    }));
  };

  const activeRatio = activePost?.id
    ? imageRatios[activePost.id]
    : undefined;

  const getImageStyle = (index: number): React.CSSProperties => {
    if (postsLength <= 1) {
      return {
        zIndex: 3,
        opacity: index === activeIndex ? 1 : 0,
        pointerEvents: index === activeIndex ? "auto" : "none",
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }

    const gap = calculateGap(containerWidth);
    const maxStickUp = gap * 0.8;

    const isActive = index === activeIndex;
    const isLeft =
      (activeIndex - 1 + postsLength) % postsLength === index;
    const isRight =
      (activeIndex + 1) % postsLength === index;

    if (isActive) {
      return {
        zIndex: 3,
        opacity: 1,
        pointerEvents: "auto",
        transform: "translateX(0px) translateY(0px) scale(1) rotateY(0deg)",
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }

    if (isLeft) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }

    if (isRight) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      };
    }

    return {
      zIndex: 1,
      opacity: 0,
      pointerEvents: "none",
      transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
    };
  };

  return (
    <div
      ref={imageContainerRef}
      className="relative w-full overflow-visible"
      style={{
        aspectRatio: activeRatio ? String(activeRatio) : "4 / 3",
        minHeight: "220px",
        maxHeight: "620px",
        perspective: "1000px",
      }}
    >
      {posts.map((post, index) => (
        <div
          key={post.id}
          className="absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden rounded-3xl border border-border bg-surface-secondary"
          style={getImageStyle(index)}
        >
          {post.src ? (
            <img
              src={post.src}
              alt={post.name || "Blog post image"}
              className="h-full w-full object-contain"
              loading={index === activeIndex ? "eager" : "lazy"}
              decoding="async"
              onLoad={(event) => {
                updateRatio(
                  post.id,
                  event.currentTarget.naturalWidth,
                  event.currentTarget.naturalHeight,
                );
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-accent/10 px-4 text-center">
              <span className="font-bebasNeue text-3xl text-accent/40">
                {post.name || "BUAC"}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function BlogControls({
  total,
  active,
  onPrevious,
  onNext,
}: {
  total: number;
  active: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const [hoverPrev, setHoverPrev] = useState(false);
  const [hoverNext, setHoverNext] = useState(false);

  if (total <= 1) return null;

  return (
    <div className="flex gap-4 pt-8 md:pt-0">
      <button
        type="button"
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border transition-colors"
        style={{
          backgroundColor: hoverPrev
            ? "var(--color-accent)"
            : "var(--color-surface)",
          borderColor: hoverPrev
            ? "var(--color-accent)"
            : "var(--color-border)",
        }}
        onClick={onPrevious}
        onMouseEnter={() => setHoverPrev(true)}
        onMouseLeave={() => setHoverPrev(false)}
        aria-label="Previous blog post"
      >
        <FaArrowLeft
          size={16}
          color={
            hoverPrev ? "#ffffff" : "var(--color-text-secondary)"
          }
        />
      </button>

      <button
        type="button"
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border transition-colors"
        style={{
          backgroundColor: hoverNext
            ? "var(--color-accent)"
            : "var(--color-surface)",
          borderColor: hoverNext
            ? "var(--color-accent)"
            : "var(--color-border)",
        }}
        onClick={onNext}
        onMouseEnter={() => setHoverNext(true)}
        onMouseLeave={() => setHoverNext(false)}
        aria-label="Next blog post"
      >
        <FaArrowRight
          size={16}
          color={
            hoverNext ? "#ffffff" : "var(--color-text-secondary)"
          }
        />
      </button>

      <span className="ml-2 flex items-center text-xs font-semibold text-text-muted">
        {active + 1} / {total}
      </span>
    </div>
  );
}

export default function BlogPage() {
  const { auth } = useAuth();
  const { openEditor } = useEditor();

  const { data, loading, error } =
    useApiData<BlogResponse>("/api/content/blog");

  const posts = useMemo(
    () => (Array.isArray(data?.posts) ? data.posts : []),
    [data],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [interactions, setInteractions] =
    useState<Record<string, BlogInteraction>>({});
  const [interactionError, setInteractionError] = useState("");
  const [togglingLike, setTogglingLike] = useState(false);

  const autoplayRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const postIds = useMemo(
    () => posts.map((post) => post.id).filter(Boolean),
    [posts],
  );

  const postIdsKey = postIds.join(",");

  const activePost = posts[activeIndex] || posts[0];

  useEffect(() => {
    if (activeIndex >= posts.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, posts.length]);

  useEffect(() => {
    if (posts.length <= 1) return;

    autoplayRef.current = setInterval(() => {
      setActiveIndex((previous) => (previous + 1) % posts.length);
    }, 7000);

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [posts.length]);

  const loadInteractions = useCallback(async () => {
    if (!postIds.length) {
      setInteractions({});
      return;
    }

    try {
      const response =
        await axios.get<InteractionsResponse>(
          `/api/content/blog/interactions?postIds=${encodeURIComponent(
            postIds.join(","),
          )}`,
          {
            withCredentials: true,
          },
        );

      setInteractions(response.data.interactions || {});
    } catch (requestError) {
      console.error("Failed to load blog interactions:", requestError);
      setInteractionError("Unable to load likes.");
    }
  }, [postIdsKey]);

  useEffect(() => {
    loadInteractions();
  }, [loadInteractions]);

  const goTo = useCallback(
    (index: number) => {
      if (!posts.length) return;

      setActiveIndex(
        ((index % posts.length) + posts.length) % posts.length,
      );

      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    },
    [posts.length],
  );

  const handleNext = () => goTo(activeIndex + 1);
  const handlePrevious = () => goTo(activeIndex - 1);

  const activeInteraction =
    activePost && interactions[activePost.id]
      ? interactions[activePost.id]
      : emptyInteraction;

  const updateInteraction = (
    postId: string,
    interaction: BlogInteraction,
  ) => {
    setInteractions((previous) => ({
      ...previous,
      [postId]: interaction,
    }));
  };

  const handleToggleLike = async () => {
    if (!activePost) return;

    setTogglingLike(true);
    setInteractionError("");

    try {
      const response = await axios.post(
        "/api/content/blog/interactions",
        {
          action: "toggle-like",
          postId: activePost.id,
        },
        {
          withCredentials: true,
        },
      );

      updateInteraction(activePost.id, response.data.interaction);
    } catch (requestError) {
      console.error("Unable to update like:", requestError);
      setInteractionError("Unable to update like.");
    } finally {
      setTogglingLike(false);
    }
  };

  if (loading) {
    return <PageLoader label="Loading blog posts" />;
  }

  return (
    <main className="buac-gradient-bg min-h-screen px-4 py-20 font-poppins text-text-secondary md:px-8">
      {auth && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          onClick={() => openEditor("blog", posts)}
          className="fixed right-6 bottom-8 z-50 flex cursor-pointer items-center gap-2 rounded-full bg-accent p-4 text-white shadow-xl transition hover:bg-accent/90"
          title="Edit Blog Posts"
          aria-label="Edit Blog Posts"
        >
          <HiOutlinePencilAlt size={24} />
        </motion.button>
      )}

      <div className="mx-auto max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-accent">
            BUAC Chronicles
          </p>

          <h1 className="font-bebasNeue text-6xl leading-none tracking-wider text-text-secondary md:text-8xl">
            THE BLOG
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-text-muted md:text-base">
            Journey logs, trekking stories, and memories written by club members.
          </p>
        </motion.header>

        {error ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border-2 border-dashed border-red-500/25 bg-red-500/5 px-6 text-center">
            <p className="text-sm text-red-400">
              Unable to load blog posts right now.
            </p>
          </div>
        ) : posts.length > 0 && activePost ? (
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 md:grid-cols-2 lg:gap-20">
              <BlogImageCarousel
                posts={posts}
                activeIndex={activeIndex}
              />

              <div className="flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePost.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                    className="min-h-[220px]"
                  >
                    <h2 className="font-bebasNeue text-3xl tracking-wider text-text-secondary">
                      {activePost.name}
                    </h2>

                    {activePost.designation && (
                      <p className="mb-5 mt-1 text-[11px] font-bold uppercase tracking-wider text-accent sm:text-xs">
                        {activePost.designation}
                      </p>
                    )}

                    <p
                      className="whitespace-pre-wrap break-words text-[11px] font-extrabold leading-[1.9] tracking-[0.025em] text-text-secondary sm:text-[12px]"
                      style={{
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {activePost.quote}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <BlogControls
                  total={posts.length}
                  active={activeIndex}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                />
              </div>
            </div>

            {/* Like only */}
            <section className="mt-10 w-full border-t border-border pt-6">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleLike}
                  disabled={togglingLike}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    activeInteraction.likedByCurrentUser
                      ? "border-accent bg-accent text-white"
                      : "border-accent/40 bg-accent/5 text-accent hover:bg-accent hover:text-white"
                  }`}
                >
                  {activeInteraction.likedByCurrentUser ? (
                    <FaHeart />
                  ) : (
                    <FaRegHeart />
                  )}

                  {togglingLike
                    ? "Updating..."
                    : activeInteraction.likeCount}
                </button>
              </div>

              {interactionError && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
                  {interactionError}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-accent/25 bg-surface/50 px-6 text-center backdrop-blur-md">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-accent">
              <HiOutlineBookOpen className="h-10 w-10" />
            </div>

            <h2 className="font-bebasNeue text-4xl tracking-wider text-text-secondary">
              No Blog Posts Yet
            </h2>

            <p className="mt-2 max-w-md text-sm text-text-muted">
              Blog posts will appear here after they are added.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}