import {
  NextRequest,
  NextResponse,
} from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { kv } from "@/lib/kv";

export const dynamic = "force-dynamic";

type UserRole = "member" | "alumni" | "admin";
type InteractableRole = "member" | "alumni";

interface TokenPayload {
  sub: string;
  role: UserRole;
  name?: string;
}

interface StoredUser {
  name: string;
  email: string;
  role: UserRole;
  profile?: Record<string, unknown>;
}

interface BlogPostReference {
  id?: string;
  name?: string;
}

interface BlogComment {
  id: string;
  authorEmail: string;
  authorName: string;
  authorRole: InteractableRole;
  content: string;
  createdAt: string;
}

interface BlogInteraction {
  likes: string[];
  comments: BlogComment[];
}

interface PublicBlogInteraction {
  likeCount: number;
  likedByCurrentUser: boolean;
  comments: Array<{
    id: string;
    authorName: string;
    authorRole: InteractableRole;
    content: string;
    createdAt: string;
    canDelete: boolean;
  }>;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function interactionKey(postId: string) {
  return `blog:interaction:${postId}`;
}

function normalizeAuthorRole(
  value: unknown,
): InteractableRole {
  return value === "alumni" ? "alumni" : "member";
}

function normalizeComment(
  input: unknown,
): BlogComment | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const comment = input as Partial<BlogComment>;

  if (
    typeof comment.id !== "string" ||
    typeof comment.authorEmail !== "string" ||
    typeof comment.authorName !== "string" ||
    typeof comment.content !== "string" ||
    typeof comment.createdAt !== "string"
  ) {
    return null;
  }

  return {
    id: comment.id,
    authorEmail: normalizeEmail(comment.authorEmail),
    authorName: comment.authorName,
    authorRole: normalizeAuthorRole(comment.authorRole),
    content: comment.content,
    createdAt: comment.createdAt,
  };
}

function normalizeInteraction(
  input: unknown,
): BlogInteraction {
  if (!input || typeof input !== "object") {
    return {
      likes: [],
      comments: [],
    };
  }

  const data = input as Partial<BlogInteraction>;

  const likes = Array.isArray(data.likes)
    ? Array.from(
        new Set(
          data.likes
            .filter(
              (email): email is string =>
                typeof email === "string",
            )
            .map(normalizeEmail),
        ),
      )
    : [];

  const comments = Array.isArray(data.comments)
    ? data.comments
        .map((comment) => normalizeComment(comment))
        .filter(
          (comment): comment is BlogComment =>
            Boolean(comment),
        )
    : [];

  return {
    likes,
    comments,
  };
}

async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("user-token")?.value ||
    cookieStore.get("admin-token")?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.adminJwtSecret || "",
    ) as TokenPayload;

    if (!payload.sub) {
      return null;
    }

    return {
      ...payload,
      sub: normalizeEmail(payload.sub),
    };
  } catch {
    return null;
  }
}

async function getStoredUser(
  email: string,
): Promise<StoredUser | null> {
  const normalizedEmail = normalizeEmail(email);

  const directUser = await kv.get<StoredUser>(
    `user:${normalizedEmail}`,
  );

  if (directUser) {
    return directUser;
  }

  const usersList =
    (await kv.get<string[]>("users:list")) || [];

  const legacyEmail = usersList.find(
    (listedEmail) =>
      normalizeEmail(String(listedEmail)) ===
      normalizedEmail,
  );

  if (!legacyEmail) {
    return null;
  }

  return (
    (await kv.get<StoredUser>(`user:${legacyEmail}`)) ||
    null
  );
}

async function postExists(postId: string): Promise<boolean> {
  const storedPosts = await kv.get<unknown>("blog-posts");

  if (!Array.isArray(storedPosts)) {
    return false;
  }

  return storedPosts.some((post, index) => {
    if (!post || typeof post !== "object") {
      return false;
    }

    const item = post as BlogPostReference;

    const id =
      typeof item.id === "string" && item.id.trim()
        ? item.id.trim()
        : `blog-${index + 1}`;

    return id === postId;
  });
}

function toPublicInteraction(
  interaction: BlogInteraction,
  currentEmail: string | null,
): PublicBlogInteraction {
  const normalizedCurrentEmail = currentEmail
    ? normalizeEmail(currentEmail)
    : null;

  return {
    likeCount: interaction.likes.length,
    likedByCurrentUser:
      normalizedCurrentEmail !== null &&
      interaction.likes.includes(normalizedCurrentEmail),
    comments: interaction.comments.map((comment) => ({
      id: comment.id,
      authorName: comment.authorName,
      authorRole: comment.authorRole,
      content: comment.content,
      createdAt: comment.createdAt,
      canDelete:
        normalizedCurrentEmail !== null &&
        comment.authorEmail === normalizedCurrentEmail,
    })),
  };
}

function canInteract(
  session: TokenPayload | null,
): session is TokenPayload & {
  role: InteractableRole;
} {
  return (
    Boolean(session) &&
    (session?.role === "member" ||
      session?.role === "alumni")
  );
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const rawPostIds = searchParams.get("postIds") || "";

    const postIds = Array.from(
      new Set(
        rawPostIds
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
          .slice(0, 100),
      ),
    );

    const interactions = await Promise.all(
      postIds.map(async (postId) => {
        const stored = await kv.get<BlogInteraction>(
          interactionKey(postId),
        );

        return [
          postId,
          toPublicInteraction(
            normalizeInteraction(stored),
            session?.sub || null,
          ),
        ] as const;
      }),
    );

    return NextResponse.json(
      {
        interactions: Object.fromEntries(interactions),
        viewer: session
          ? {
              role: session.role,
              email: session.sub,
            }
          : null,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Blog interactions GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch blog interactions.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!canInteract(session)) {
    return NextResponse.json(
      {
        error:
          "Only logged-in members and alumni can like or comment on blog posts.",
      },
      {
        status: 403,
      },
    );
  }

  try {
    const body = await request.json();

    const postId =
      typeof body.postId === "string"
        ? body.postId.trim()
        : "";

    const action =
      typeof body.action === "string" ? body.action : "";

    if (!postId) {
      return NextResponse.json(
        {
          error: "Blog post ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const exists = await postExists(postId);

    if (!exists) {
      return NextResponse.json(
        {
          error: "Blog post not found.",
        },
        {
          status: 404,
        },
      );
    }

    const currentStoredInteraction =
      await kv.get<BlogInteraction>(
        interactionKey(postId),
      );

    const interaction = normalizeInteraction(
      currentStoredInteraction,
    );

    const userEmail = normalizeEmail(session.sub);

    if (action === "toggle-like") {
      const hasLiked = interaction.likes.includes(userEmail);

      interaction.likes = hasLiked
        ? interaction.likes.filter(
            (email) => email !== userEmail,
          )
        : [...interaction.likes, userEmail];

      await kv.set(interactionKey(postId), interaction);

      return NextResponse.json(
        {
          ok: true,
          interaction: toPublicInteraction(
            interaction,
            userEmail,
          ),
        },
        {
          status: 200,
        },
      );
    }

    if (action === "add-comment") {
      const content =
        typeof body.content === "string"
          ? body.content
          : typeof body.comment === "string"
            ? body.comment
            : "";

      if (!content.trim()) {
        return NextResponse.json(
          {
            error: "Comment cannot be empty.",
          },
          {
            status: 400,
          },
        );
      }

      if (content.length > 2000) {
        return NextResponse.json(
          {
            error: "Comment must be under 2000 characters.",
          },
          {
            status: 400,
          },
        );
      }

      const storedUser = await getStoredUser(userEmail);

      const comment: BlogComment = {
        id: crypto.randomUUID(),
        authorEmail: userEmail,
        authorName:
          storedUser?.name || session.name || "BUAC Member",
        authorRole: session.role,
        content,
        createdAt: new Date().toISOString(),
      };

      interaction.comments = [
        comment,
        ...interaction.comments,
      ];

      await kv.set(interactionKey(postId), interaction);

      return NextResponse.json(
        {
          ok: true,
          interaction: toPublicInteraction(
            interaction,
            userEmail,
          ),
        },
        {
          status: 201,
        },
      );
    }

    return NextResponse.json(
      {
        error: "Unsupported interaction action.",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error("Blog interactions POST error:", error);

    return NextResponse.json(
      {
        error: "Failed to update blog interaction.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();

  if (!canInteract(session)) {
    return NextResponse.json(
      {
        error:
          "Only logged-in members and alumni can delete their comments.",
      },
      {
        status: 403,
      },
    );
  }

  try {
    const body = await request.json();

    const postId =
      typeof body.postId === "string"
        ? body.postId.trim()
        : "";

    const commentId =
      typeof body.commentId === "string"
        ? body.commentId.trim()
        : "";

    if (!postId || !commentId) {
      return NextResponse.json(
        {
          error: "Post ID and comment ID are required.",
        },
        {
          status: 400,
        },
      );
    }

    const currentStoredInteraction =
      await kv.get<BlogInteraction>(
        interactionKey(postId),
      );

    const interaction = normalizeInteraction(
      currentStoredInteraction,
    );

    const userEmail = normalizeEmail(session.sub);

    const comment = interaction.comments.find(
      (item) => item.id === commentId,
    );

    if (!comment) {
      return NextResponse.json(
        {
          error: "Comment not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (comment.authorEmail !== userEmail) {
      return NextResponse.json(
        {
          error: "You can only delete your own comments.",
        },
        {
          status: 403,
        },
      );
    }

    interaction.comments = interaction.comments.filter(
      (item) => item.id !== commentId,
    );

    await kv.set(interactionKey(postId), interaction);

    return NextResponse.json(
      {
        ok: true,
        interaction: toPublicInteraction(
          interaction,
          userEmail,
        ),
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Blog interactions DELETE error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete comment.",
      },
      {
        status: 500,
      },
    );
  }
}