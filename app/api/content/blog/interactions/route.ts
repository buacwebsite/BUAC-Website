import {
  NextRequest,
  NextResponse,
} from "next/server";
import { cookies } from "next/headers";
import { kv } from "@/lib/kv";

export const dynamic = "force-dynamic";

interface BlogPostReference {
  id?: string;
}

interface BlogInteraction {
  likes: string[];
}

interface PublicBlogInteraction {
  likeCount: number;
  likedByCurrentUser: boolean;
}

function interactionKey(postId: string) {
  return `blog:interaction:${postId}`;
}

function normalizeInteraction(input: unknown): BlogInteraction {
  if (!input || typeof input !== "object") {
    return { likes: [] };
  }

  const data = input as Partial<BlogInteraction>;

  const likes = Array.isArray(data.likes)
    ? Array.from(
        new Set(
          data.likes
            .filter((value): value is string => typeof value === "string")
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      )
    : [];

  return { likes };
}

async function postExists(postId: string): Promise<boolean> {
  const storedPosts = await kv.get<unknown>("blog-posts");

  if (!Array.isArray(storedPosts)) {
    return false;
  }

  return storedPosts.some((post, index) => {
    if (!post || typeof post !== "object") return false;

    const item = post as BlogPostReference;

    const id =
      typeof item.id === "string" && item.id.trim()
        ? item.id.trim()
        : `blog-${index + 1}`;

    return id === postId;
  });
}

function createVisitorId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function getVisitorId() {
  const cookieStore = await cookies();

  const existing = cookieStore.get("blog-like-id")?.value;

  if (existing) {
    return {
      visitorId: existing,
      shouldSetCookie: false,
    };
  }

  return {
    visitorId: createVisitorId(),
    shouldSetCookie: true,
  };
}

function toPublicInteraction(
  interaction: BlogInteraction,
  visitorId: string,
): PublicBlogInteraction {
  return {
    likeCount: interaction.likes.length,
    likedByCurrentUser: interaction.likes.includes(visitorId),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { visitorId, shouldSetCookie } = await getVisitorId();

    const { searchParams } = new URL(request.url);

    const postIds = Array.from(
      new Set(
        (searchParams.get("postIds") || "")
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
          .slice(0, 100),
      ),
    );

    const entries = await Promise.all(
      postIds.map(async (postId) => {
        const stored = await kv.get<BlogInteraction>(
          interactionKey(postId),
        );

        const interaction = normalizeInteraction(stored);

        return [
          postId,
          toPublicInteraction(interaction, visitorId),
        ] as const;
      }),
    );

    const response = NextResponse.json(
      {
        interactions: Object.fromEntries(entries),
      },
      { status: 200 },
    );

    if (shouldSetCookie) {
      response.cookies.set({
        name: "blog-like-id",
        value: visitorId,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Blog interactions GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch blog interactions." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { visitorId, shouldSetCookie } = await getVisitorId();

    const body = await request.json();

    const postId =
      typeof body.postId === "string" ? body.postId.trim() : "";

    const action =
      typeof body.action === "string" ? body.action : "";

    if (!postId) {
      return NextResponse.json(
        { error: "Blog post ID is required." },
        { status: 400 },
      );
    }

    if (action !== "toggle-like") {
      return NextResponse.json(
        { error: "Unsupported interaction action." },
        { status: 400 },
      );
    }

    const exists = await postExists(postId);

    if (!exists) {
      return NextResponse.json(
        { error: "Blog post not found." },
        { status: 404 },
      );
    }

    const stored = await kv.get<BlogInteraction>(interactionKey(postId));
    const interaction = normalizeInteraction(stored);

    const hasLiked = interaction.likes.includes(visitorId);

    interaction.likes = hasLiked
      ? interaction.likes.filter((id) => id !== visitorId)
      : [...interaction.likes, visitorId];

    await kv.set(interactionKey(postId), interaction);

    const response = NextResponse.json(
      {
        ok: true,
        interaction: toPublicInteraction(interaction, visitorId),
      },
      { status: 200 },
    );

    if (shouldSetCookie) {
      response.cookies.set({
        name: "blog-like-id",
        value: visitorId,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Blog interactions POST error:", error);

    return NextResponse.json(
      { error: "Failed to update like." },
      { status: 500 },
    );
  }
}