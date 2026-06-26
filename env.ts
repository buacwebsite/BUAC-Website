import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    adminMail: z.string().min(1),
    adminPassword: z.string().min(1),
    adminJwtSecret: z.string().min(1),

    // WeatherAPI.com
    WEATHERAPI_KEY: z.string().min(1),

    // Email OAuth2 configuration
    EMAIL_SERVICE: z.string().default("gmail"),
    EMAIL_USER: z.string().email(),
    GMAIL_CLIENT_ID: z.string().min(1),
    GMAIL_CLIENT_SECRET: z.string().min(1),
    GMAIL_REFRESH_TOKEN: z.string().min(1),
    GMAIL_ACCESS_TOKEN: z.string().optional(),
    ADMIN_EMAIL: z.string().email().optional(),

    // Redis - support both naming conventions
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
    KV_REST_API_URL: z.string().url().optional(),
    KV_REST_API_TOKEN: z.string().min(1).optional(),
  },
  client: {},
  experimental__runtimeEnv: {},
});