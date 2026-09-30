"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import {
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import {
  HiOutlineBookOpen,
  HiOutlinePencilAlt,
} from "react-icons/hi";

import { useAuth } from "@/app/context/AuthProvider";
import { useEditor } from "@/app/context/EditorContext";
import PageLoader from "@/app/components/ui/PageLoader";
import { cn } from "@/lib/utils";

/* ============================================================
   TYPES — compatible with your existing Blog API and editor
============================================================ */

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

interface ToggleLikeResponse {
  ok?: boolean;
  interaction: BlogInteraction;
}

interface BlogItemProps {
  post: BlogPost;
  selectedId: string;
  highlightedId: string | null;
  onHighlight: (id: string | null) => void;
  onSelect: (id: string) => void;
}

/* ============================================================
   PHOTO COLUMN SIZES

   Widths and vertical offsets follow your reference.
   No fixed image heights: every image keeps its original ratio.
============================================================ */

const columnClasses = [
  "w-[110px] sm:w-[130px] md:w-[155px]",
  "mt-[48px] w-[122px] sm:mt-[56px] sm:w-[145px] md:mt-[68px] md:w-[172px]",
  "mt-[22px] w-[115px] sm:mt-[26px] sm:w-[136px] md:mt-[32px] md:w-[162px]",
];

/* ============================================================
   PHOTO CARD
============================================================ */

function BlogPhotoCard({
  post,
  selectedId,
  highlightedId,
  onHighlight,
  onSelect,
}: BlogItemProps) {
  const [failedSource, setFailedSource] = useState("");

  const isSelected = selectedId === post.id;
  const isHighlighted = highlightedId === post.id;

  const isDimmed =
    highlightedId !== null && !isHighlighted;

  const showImage =
    Boolean(post.src) && failedSource !== post.src;

  return (
    <button
      type="button"
      onClick={() => onSelect(post.id)}
      onMouseEnter={() => onHighlight(post.id)}
      onMouseLeave={() => onHighlight(null)}
      onFocus={() => onHighlight(post.id)}
      onBlur={() => onHighlight(null)}
      aria-label={`Read ${post.name || "blog post"}`}
      aria-pressed={isSelected}
      aria-controls="selected-blog-panel"
      className={cn(
        "block w-full shrink-0 cursor-pointer overflow-hidden",
        "rounded-xl border-2 bg-surface-secondary text-left",
        "transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-accent focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",
        isSelected
          ? "border-accent shadow-lg shadow-accent/15"
          : "border-border hover:border-accent/50",
        isDimmed ? "opacity-60" : "opacity-100",
      )}
    >
      {showImage ? (
        // Native image dimensions keep the entire picture visible.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.src}
          alt={post.name || "BUAC blog image"}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailedSource(post.src)}
          className="block h-auto w-full object-contain transition-[filter] duration-500"
          style={{
            filter: isHighlighted
              ? "grayscale(0) brightness(1)"
              : "grayscale(1) brightness(0.77)",
          }}
        />
      ) : (
        <div className="flex min-h-[140px] w-full items-center justify-center bg-accent/10 px-3 py-6 text-center">
          <span className="break-words font-bebasNeue text-2xl tracking-wide text-accent/60">
            {post.name || "BUAC"}
          </span>
        </div>
      )}
    </button>
  );
}

/* ============================================================
   BLOG TITLE ROW
============================================================ */

function BlogTitleRow({
  post,
  selectedId,
  highlightedId,
  onHighlight,
  onSelect,
}: BlogItemProps) {
  const isSelected = selectedId === post.id;
  const isHighlighted = highlightedId === post.id;

  const isDimmed =
    highlightedId !== null && !isHighlighted;

  return (
    <button
      type="button"
      onClick={() => onSelect(post.id)}
      onMouseEnter={() => onHighlight(post.id)}
      onMouseLeave={() => onHighlight(null)}
      onFocus={() => onHighlight(post.id)}
      onBlur={() => onHighlight(null)}
      aria-pressed={isSelected}
      aria-controls="selected-blog-panel"
      className={cn(
        "block min-h-11 w-full cursor-pointer rounded-xl",
        "px-3 py-3 text-left transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-accent",
        isSelected
          ? "bg-accent/10"
          : "hover:bg-surface",
        isDimmed ? "opacity-50" : "opacity-100",
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden="true"
          className={cn(
            "mt-1.5 h-3 shrink-0 rounded-[5px]",
            "transition-all duration-300",
            isHighlighted
              ? "w-5 bg-accent"
              : "w-4 bg-text-secondary/25",
          )}
        />

        <span
          className={cn(
            "min-w-0 break-words text-base font-semibold",
            "leading-snug tracking-tight transition-colors",
            "duration-300 md:text-[18px]",
            isHighlighted
              ? "text-accent"
              : "text-text-secondary",
          )}
        >
          {post.name || "Untitled Blog Post"}
        </span>
      </div>

      {post.designation && (
        <p className="mt-1.5 pl-[27px] text-[10px] font-medium uppercase leading-relaxed tracking-[0.18em] text-text-muted">
          {post.designation}
        </p>
      )}
    </button>
  );
}

/* ============================================================
   BLOG PAGE
============================================================ */

export default function BlogPage() {
  const { auth } = useAuth();
  const { openEditor } = useEditor();
  const reduceMotion = useReducedMotion();

  const readerRef = useRef<HTMLElement>(null);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(
    null,
  );

  const [hoveredId, setHoveredId] = useState<string | null>(
    null,
  );

  const [interactions, setInteractions] = useState<
    Record<string, BlogInteraction>
  >({});

  const [loadingLikes, setLoadingLikes] = useState(false);

  const [updatingPostId, setUpdatingPostId] = useState<
    string | null
  >(null);

  const [interactionError, setInteractionError] = useState("");

  /* ---------------- Load saved blog posts ---------------- */

  useEffect(() => {
    const controller = new AbortController();

    const loadPosts = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get<BlogResponse>(
          "/api/content/blog",
          {
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) return;

        setPosts(
          Array.isArray(response.data.posts)
            ? response.data.posts
            : [],
        );
      } catch (requestError) {
        if (
          controller.signal.aborted ||
          axios.isCancel(requestError)
        ) {
          return;
        }

        console.error(
          "Failed to load blog posts:",
          requestError,
        );

        setError(
          "Unable to load blog posts right now. Please try again later.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadPosts();

    return () => controller.abort();
  }, []);

  /* ---------------- Derived content ---------------- */

  const activePost =
    posts.find((post) => post.id === selectedId) ||
    posts[0];

  const highlightedId =
    hoveredId ?? activePost?.id ?? null;

  const imageColumns = useMemo(
    () =>
      Array.from({ length: 3 }, (_, columnIndex) =>
        posts.filter(
          (_, index) => index % 3 === columnIndex,
        ),
      ),
    [posts],
  );

  const postIds = useMemo(
    () =>
      Array.from(
        new Set(
          posts
            .map((post) => post.id)
            .filter(Boolean),
        ),
      ),
    [posts],
  );

  const activeInteraction = activePost
    ? interactions[activePost.id]
    : undefined;

  /* ---------------- Load existing likes ---------------- */

  useEffect(() => {
    if (!postIds.length) {
      setInteractions({});
      setLoadingLikes(false);
      return;
    }

    const controller = new AbortController();

    const loadInteractions = async () => {
      setLoadingLikes(true);
      setInteractionError("");

      try {
        const combined: Record<string, BlogInteraction> = {};

        /*
         * The existing API accepts up to 100 IDs per request.
         * Sequential requests also allow the first response
         * to establish the anonymous visitor cookie.
         */
        for (
          let offset = 0;
          offset < postIds.length;
          offset += 100
        ) {
          const batch = postIds.slice(offset, offset + 100);

          const response =
            await axios.get<InteractionsResponse>(
              "/api/content/blog/interactions",
              {
                params: {
                  postIds: batch.join(","),
                },
                withCredentials: true,
                signal: controller.signal,
              },
            );

          Object.assign(
            combined,
            response.data.interactions || {},
          );
        }

        if (!controller.signal.aborted) {
          setInteractions(combined);
        }
      } catch (requestError) {
        if (
          controller.signal.aborted ||
          axios.isCancel(requestError)
        ) {
          return;
        }

        console.error(
          "Failed to load blog interactions:",
          requestError,
        );

        setInteractionError("Unable to load likes.");
      } finally {
        if (!controller.signal.aborted) {
          setLoadingLikes(false);
        }
      }
    };

    void loadInteractions();

    return () => controller.abort();
  }, [postIds]);

  /* ---------------- Select a post ---------------- */

  const selectPost = (postId: string) => {
    setSelectedId(postId);
    setHoveredId(null);

    // Bring the reading panel into view on mobile and tablet.
    if (
      window.matchMedia("(max-width: 1023px)").matches
    ) {
      window.requestAnimationFrame(() => {
        readerRef.current?.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    }
  };

  /* ---------------- Like / unlike ---------------- */

  const handleToggleLike = async () => {
    if (
      !activePost ||
      loadingLikes ||
      updatingPostId !== null
    ) {
      return;
    }

    // Capture the ID so switching posts cannot update the wrong one.
    const postId = activePost.id;

    setUpdatingPostId(postId);
    setInteractionError("");

    try {
      const response =
        await axios.post<ToggleLikeResponse>(
          "/api/content/blog/interactions",
          {
            action: "toggle-like",
            postId,
          },
          {
            withCredentials: true,
          },
        );

      if (!response.data.interaction) {
        throw new Error("Missing interaction response.");
      }

      setInteractions((previous) => ({
        ...previous,
        [postId]: response.data.interaction,
      }));
    } catch (requestError) {
      console.error(
        "Unable to update blog like:",
        requestError,
      );

      setInteractionError(
        "Unable to update like. Please try again.",
      );
    } finally {
      setUpdatingPostId(null);
    }
  };

  const likeLabel = loadingLikes
    ? "Loading likes..."
    : updatingPostId === activePost?.id
      ? "Updating..."
      : activeInteraction
        ? `${activeInteraction.likeCount.toLocaleString()} ${
            activeInteraction.likeCount === 1
              ? "like"
              : "likes"
          }`
        : "Like this post";

  /* ---------------- Loading ---------------- */

  if (loading) {
    return <PageLoader label="Loading blog posts" />;
  }

  /* ---------------- Page ---------------- */

  return (
    <main className="page-shell min-h-screen px-4 py-20 font-poppins text-text-secondary sm:px-6 md:px-8">
      {auth && !error && (
        <button
          type="button"
          onClick={() => openEditor("blog", posts)}
          className="fixed bottom-6 right-5 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-accent text-white shadow-xl shadow-accent/20 transition hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:bottom-8 sm:right-8"
          title="Edit Blog Posts"
          aria-label="Edit Blog Posts"
        >
          <HiOutlinePencilAlt size={24} />
        </button>
      )}

      <div className="mx-auto max-w-6xl">
        <motion.header
          initial={
            reduceMotion
              ? false
              : { opacity: 0, y: 20 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.45,
          }}
          className="mb-12 text-center sm:mb-16"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-accent">
            BUAC Chronicles
          </p>

          <h1 className="font-bebasNeue text-6xl leading-none tracking-wider text-text-secondary md:text-8xl">
            THE BLOG
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-text-muted md:text-base">
            Journey logs, trekking stories, and memories
            written by club members.
          </p>
        </motion.header>

        {error ? (
          <div
            role="alert"
            className="flex min-h-[300px] items-center justify-center rounded-3xl border-2 border-dashed border-red-500/25 bg-red-500/5 px-6 text-center"
          >
            <p className="text-sm text-red-500">
              {error}
            </p>
          </div>
        ) : posts.length > 0 && activePost ? (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-10 xl:gap-14">
            {/* ============================================
                LEFT: STAGGERED PHOTO GRID
            ============================================ */}

            <div className="min-w-0 lg:w-max">
              <div className="w-full max-w-full overflow-x-auto pb-3">
                <div className="mx-auto flex w-max items-start gap-2 sm:gap-3">
                  {imageColumns.map(
                    (column, columnIndex) =>
                      column.length > 0 && (
                        <div
                          key={columnIndex}
                          className={cn(
                            "flex shrink-0 flex-col gap-2 sm:gap-3",
                            columnClasses[columnIndex],
                          )}
                        >
                          {column.map((post) => (
                            <BlogPhotoCard
                              key={post.id}
                              post={post}
                              selectedId={activePost.id}
                              highlightedId={highlightedId}
                              onHighlight={setHoveredId}
                              onSelect={selectPost}
                            />
                          ))}
                        </div>
                      ),
                  )}
                </div>
              </div>

              <p className="mt-4 text-center text-[11px] leading-relaxed text-text-muted">
                Select a photo or title to read its story.
              </p>
            </div>

            {/* ============================================
                RIGHT: BLOG TITLES + COMPLETE SELECTED POST
            ============================================ */}

            <div className="min-w-0 lg:pt-2">
              <ul
                aria-label="Choose a blog post"
                className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 lg:gap-3"
              >
                {posts.map((post) => (
                  <li key={post.id} className="min-w-0">
                    <BlogTitleRow
                      post={post}
                      selectedId={activePost.id}
                      highlightedId={highlightedId}
                      onHighlight={setHoveredId}
                      onSelect={selectPost}
                    />
                  </li>
                ))}
              </ul>

              <section
                ref={readerRef}
                id="selected-blog-panel"
                aria-labelledby="selected-blog-title"
                className="mt-8 scroll-mt-28 rounded-2xl border border-border bg-surface/80 p-5 shadow-xl sm:p-6"
              >
                <motion.article
                  key={activePost.id}
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, y: 12 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.25,
                  }}
                >
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
                    Adventure Story
                  </p>

                  <h2
                    id="selected-blog-title"
                    className="break-words font-bebasNeue text-3xl leading-tight tracking-wide text-text-secondary sm:text-4xl"
                  >
                    {activePost.name || "Untitled Blog Post"}
                  </h2>

                  {activePost.designation && (
                    <p className="mt-2 text-[10px] font-semibold uppercase leading-relaxed tracking-[0.18em] text-accent sm:text-xs">
                      {activePost.designation}
                    </p>
                  )}

                  <div className="my-5 h-px bg-border" />

                  {activePost.quote ? (
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-text-secondary [overflow-wrap:anywhere] sm:text-[15px] sm:leading-8">
                      {activePost.quote}
                    </p>
                  ) : (
                    <p className="text-sm leading-relaxed text-text-muted">
                      Text for this post has not been added yet.
                    </p>
                  )}
                </motion.article>

                {/* Existing anonymous blog likes */}

                <div className="mt-7 border-t border-border pt-5">
                  <button
                    type="button"
                    onClick={handleToggleLike}
                    disabled={
                      loadingLikes ||
                      updatingPostId !== null
                    }
                    aria-pressed={
                      activeInteraction?.likedByCurrentUser ??
                      false
                    }
                    aria-label={
                      activeInteraction?.likedByCurrentUser
                        ? "Unlike this blog post"
                        : "Like this blog post"
                    }
                    className={cn(
                      "inline-flex min-h-11 cursor-pointer",
                      "items-center justify-center gap-2",
                      "rounded-full border px-4 py-2",
                      "text-sm font-semibold transition",
                      "focus-visible:outline-none",
                      "focus-visible:ring-2 focus-visible:ring-accent",
                      "focus-visible:ring-offset-2",
                      "focus-visible:ring-offset-surface",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      activeInteraction?.likedByCurrentUser
                        ? "border-accent bg-accent text-white"
                        : "border-accent/40 bg-accent/5 text-accent hover:bg-accent hover:text-white",
                    )}
                  >
                    {activeInteraction?.likedByCurrentUser ? (
                      <FaHeart aria-hidden="true" />
                    ) : (
                      <FaRegHeart aria-hidden="true" />
                    )}

                    <span aria-live="polite">
                      {likeLabel}
                    </span>
                  </button>

                  {interactionError && (
                    <p
                      role="alert"
                      className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs leading-relaxed text-red-500"
                    >
                      {interactionError}
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-accent/25 bg-surface/50 px-6 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-accent">
              <HiOutlineBookOpen className="h-10 w-10" />
            </div>

            <h2 className="font-bebasNeue text-4xl tracking-wider text-text-secondary">
              No Blog Posts Yet
            </h2>

            <p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">
              {auth
                ? "Click the edit button to add your first blog post."
                : "Blog posts will appear here after they are added."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}