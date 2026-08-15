import {
  NextRequest,
  NextResponse,
} from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { kv } from "@/lib/kv";

export const dynamic = "force-dynamic";

type UserRole =
  | "member"
  | "alumni"
  | "admin";

interface TokenPayload {
  sub: string;
  role: UserRole;
  name?: string;
  iat?: number;
  exp?: number;
}

interface StoredUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  profile?: Record<string, unknown>;
  createdAt: string;
  authProvider?: string;
  picture?: string;
}

async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();

  const adminToken =
    cookieStore.get(
      "admin-token",
    )?.value;

  const userToken =
    cookieStore.get(
      "user-token",
    )?.value;

  const token =
    adminToken || userToken;

  if (!token) {
    return null;
  }

  const secret =
    process.env.adminJwtSecret || "";

  if (!secret) {
    console.error(
      "Profile API: adminJwtSecret is missing.",
    );

    return null;
  }

  try {
    const payload = jwt.verify(
      token,
      secret,
    ) as TokenPayload;

    if (!payload.sub) {
      return null;
    }

    return {
      ...payload,
      sub: payload.sub
        .trim()
        .toLowerCase(),
    };
  } catch (error) {
    console.error(
      "Profile API: invalid session token.",
      error,
    );

    return null;
  }
}

async function findStoredUser(
  email: string,
): Promise<StoredUser | null> {
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const directUser =
    await kv.get<StoredUser>(
      `user:${normalizedEmail}`,
    );

  if (directUser) {
    return directUser;
  }

  /*
   * Compatibility lookup for old user-list
   * entries that may contain uppercase letters
   * or extra spaces.
   */
  const usersList =
    (await kv.get<string[]>(
      "users:list",
    )) || [];

  const matchingEmail =
    usersList.find(
      (listedEmail) =>
        String(listedEmail)
          .trim()
          .toLowerCase() ===
        normalizedEmail,
    );

  if (!matchingEmail) {
    return null;
  }

  const legacyUser =
    await kv.get<StoredUser>(
      `user:${matchingEmail}`,
    );

  if (!legacyUser) {
    return null;
  }

  /*
   * Migrate the legacy key to the normalized key.
   */
  await kv.set(
    `user:${normalizedEmail}`,
    {
      ...legacyUser,
      email: normalizedEmail,
    },
  );

  if (
    matchingEmail !== normalizedEmail
  ) {
    await kv.del(
      `user:${matchingEmail}`,
    );
  }

  return {
    ...legacyUser,
    email: normalizedEmail,
  };
}

function getAdminProfile(
  session: TokenPayload,
) {
  const adminEmail =
    String(
      process.env.adminMail ||
        session.sub,
    )
      .trim()
      .toLowerCase();

  return {
    name: session.name || "Admin",
    email: adminEmail,
    role: "admin" as const,
    profile: {},
    createdAt: "",
  };
}

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        error:
          "Please log in first to view your profile.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    if (session.role === "admin") {
      return NextResponse.json(
        {
          user: getAdminProfile(session),
        },
        {
          status: 200,
        },
      );
    }

    const user =
      await findStoredUser(
        session.sub,
      );

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Your account record was not found. Please sign out and register again.",
          code: "PROFILE_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          profile:
            user.profile || {},
          createdAt:
            user.createdAt || "",
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Profile GET error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to load profile.",
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
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        error:
          "Please log in first.",
      },
      {
        status: 401,
      },
    );
  }

  if (session.role === "admin") {
    return NextResponse.json(
      {
        error:
          "The environment admin profile cannot be edited here.",
      },
      {
        status: 403,
      },
    );
  }

  try {
    const body =
      await request.json();

    const user =
      await findStoredUser(
        session.sub,
      );

    if (!user) {
      return NextResponse.json(
        {
          error:
            "User profile not found.",
          code: "PROFILE_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }

    const name =
      typeof body.name ===
        "string" &&
      body.name.trim()
        ? body.name.trim()
        : user.name;

    const incomingProfile =
      body.profile &&
      typeof body.profile ===
        "object" &&
      !Array.isArray(body.profile)
        ? (body.profile as Record<
            string,
            unknown
          >)
        : {};

    const updatedProfile = {
      ...(user.profile || {}),
      ...incomingProfile,
    };

    let passwordHash =
      user.passwordHash;

    if (body.newPassword) {
      const newPassword =
        String(body.newPassword);

      const currentPassword =
        String(
          body.currentPassword ||
            "",
        );

      if (
        newPassword.length < 6
      ) {
        return NextResponse.json(
          {
            error:
              "New password must be at least 6 characters.",
          },
          {
            status: 400,
          },
        );
      }

      if (!currentPassword) {
        return NextResponse.json(
          {
            error:
              "Current password is required to set a new password.",
          },
          {
            status: 400,
          },
        );
      }

      if (!user.passwordHash) {
        return NextResponse.json(
          {
            error:
              "This account does not currently have a password.",
          },
          {
            status: 400,
          },
        );
      }

      const validPassword =
        await bcrypt.compare(
          currentPassword,
          user.passwordHash,
        );

      if (!validPassword) {
        return NextResponse.json(
          {
            error:
              "Current password is incorrect.",
          },
          {
            status: 400,
          },
        );
      }

      passwordHash =
        await bcrypt.hash(
          newPassword,
          10,
        );
    }

    const normalizedEmail =
      session.sub
        .trim()
        .toLowerCase();

    const updatedUser: StoredUser =
      {
        ...user,
        name,
        email: normalizedEmail,
        passwordHash,
        profile: updatedProfile,
      };

    await kv.set(
      `user:${normalizedEmail}`,
      updatedUser,
    );

    return NextResponse.json(
      {
        ok: true,
        message:
          "Profile updated successfully.",
        user: {
          name:
            updatedUser.name,
          email:
            updatedUser.email,
          role:
            updatedUser.role,
          profile:
            updatedUser.profile,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Profile PUT error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to update profile.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        error:
          "Please log in first.",
      },
      {
        status: 401,
      },
    );
  }

  if (session.role === "admin") {
    return NextResponse.json(
      {
        error:
          "The main admin account cannot be deleted.",
      },
      {
        status: 403,
      },
    );
  }

  try {
    const normalizedEmail =
      session.sub
        .trim()
        .toLowerCase();

    const user =
      await findStoredUser(
        normalizedEmail,
      );

    if (!user) {
      const response =
        NextResponse.json(
          {
            error:
              "User profile not found.",
            code: "PROFILE_NOT_FOUND",
          },
          {
            status: 404,
          },
        );

      response.cookies.delete(
        "user-token",
      );

      response.cookies.delete(
        "admin-token",
      );

      return response;
    }

    await kv.del(
      `user:${normalizedEmail}`,
    );

    const usersList =
      (await kv.get<string[]>(
        "users:list",
      )) || [];

    const updatedUsersList =
      usersList.filter(
        (listedEmail) =>
          String(listedEmail)
            .trim()
            .toLowerCase() !==
          normalizedEmail,
      );

    await kv.set(
      "users:list",
      updatedUsersList,
    );

    const response =
      NextResponse.json(
        {
          ok: true,
          message:
            "Your account and profile have been permanently deleted.",
        },
        {
          status: 200,
        },
      );

    response.cookies.delete(
      "user-token",
    );

    response.cookies.delete(
      "admin-token",
    );

    return response;
  } catch (error) {
    console.error(
      "Profile DELETE error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete profile.",
      },
      {
        status: 500,
      },
    );
  }
}