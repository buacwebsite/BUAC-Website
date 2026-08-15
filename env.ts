import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    /* Admin */
    adminMail: z.string().email(),
    adminPassword: z.string().min(1),
    adminJwtSecret: z.string().min(1),

    /* Weather */
    WEATHERAPI_KEY: z.string().min(1),

    /* Email */
    EMAIL_SERVICE: z.string().default("gmail"),
    EMAIL_USER: z.string().email(),
    EMAIL_PASS: z.string().optional(),
    GMAIL_APP_PASSWORD: z.string().optional(),
    ADMIN_EMAIL: z.string().email().optional(),

    /*
     * Kept optional for compatibility with any old route.
     * New routes should use lib/email.ts instead.
     */
    GMAIL_CLIENT_ID: z.string().optional(),
    GMAIL_CLIENT_SECRET: z.string().optional(),
    GMAIL_REFRESH_TOKEN: z.string().optional(),
    GMAIL_ACCESS_TOKEN: z.string().optional(),

    /* Redis / Upstash */
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
    KV_REST_API_URL: z.string().url().optional(),
    KV_REST_API_TOKEN: z.string().min(1).optional(),

    /* Google Apps Script */
    GOOGLE_SCRIPT_URL: z.string().url().optional(),

    /* YouTube */
    YOUTUBE_API_KEY: z.string().optional(),
    YOUTUBE_CHANNEL_ID: z.string().optional(),

    /* Vercel Blob */
    BLOB_READ_WRITE_TOKEN: z.string().optional(),
  },

  client: {},

  experimental__runtimeEnv: {},
});