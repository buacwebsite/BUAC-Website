import {
  NextRequest,
  NextResponse,
} from "next/server";
import { kv } from "@/lib/kv";
import { authenticateAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export interface BlogPost {
  id: string;
  name: string;
  designation: string;
  quote: string;
  src: string;
}

function createPostId(index: number) {
  return `blog-${index + 1}`;
}

function normalizePost(
  input: unknown,
  index: number,
): BlogPost | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const data = input as Partial<BlogPost>;

  const id =
    typeof data.id === "string" &&
    data.id.trim()
      ? data.id.trim()
      : createPostId(index);

  const name =
    typeof data.name === "string"
      ? data.name.trim()
      : "";

  const designation =
    typeof data.designation === "string"
      ? data.designation.trim()
      : "";

  /*
   * Do not trim blog content.
   * This keeps paragraph breaks, blank lines,
   * tabs, and multiple spaces.
   */
  const quote =
    typeof data.quote === "string"
      ? data.quote
      : "";

  const src =
    typeof data.src === "string"
      ? data.src.trim()
      : "";

  if (
    !name &&
    !designation &&
    !quote.trim() &&
    !src
  ) {
    return null;
  }

  return {
    id,
    name,
    designation,
    quote,
    src,
  };
}

function normalizePosts(
  input: unknown,
): BlogPost[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((post, index) =>
      normalizePost(post, index),
    )
    .filter(
      (post): post is BlogPost =>
        Boolean(post),
    );
}

export async function GET() {
  try {
    const storedPosts =
      await kv.get<unknown>(
        "blog-posts",
      );

    const posts =
      normalizePosts(storedPosts);

    return NextResponse.json(
      {
        posts,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Blog posts GET error:",
      error,
    );

    return NextResponse.json(
      {
        posts: [],
        error:
          "Failed to fetch blog posts.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(
  request: NextRequest,
) {
  const isAdmin =
    await authenticateAdmin();

  if (!isAdmin) {
    return NextResponse.json(
      {
        error: "unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const body =
      await request.json();

    if (
      !body ||
      !Array.isArray(body.posts)
    ) {
      return NextResponse.json(
        {
          error:
            "posts must be an array",
        },
        {
          status: 400,
        },
      );
    }

    const posts =
      normalizePosts(body.posts);

    /*
     * Ensure every post has an id even if
     * an old blog post was saved without one.
     */
    const postsWithIds = posts.map(
      (post, index) => ({
        ...post,
        id:
          post.id ||
          createPostId(index),
      }),
    );

    await kv.set(
      "blog-posts",
      postsWithIds,
    );

    return NextResponse.json(
      {
        ok: true,
        posts: postsWithIds,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Blog posts PUT error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to update blog posts.",
      },
      {
        status: 500,
      },
    );
  }
}