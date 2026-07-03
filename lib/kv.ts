import { Redis } from "@upstash/redis";

function cleanEnv(value: string | undefined) {
  if (!value) return "";

  let cleaned = value.trim();

  while (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned;
}

const url = cleanEnv(
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
);

const token = cleanEnv(
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
);

if (!url || !token) {
  console.warn(
    "Redis/KV environment variables are missing. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN or KV_REST_API_URL and KV_REST_API_TOKEN.",
  );
}

if (url && !url.startsWith("https://")) {
  console.warn(
    `Invalid Redis URL. It should start with https://. Current value: ${url}`,
  );
}

export const kv = new Redis({
  url: url || "",
  token: token || "",
});