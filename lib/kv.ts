import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  console.warn(
    "Redis/KV environment variables are missing. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN or KV_REST_API_URL and KV_REST_API_TOKEN.",
  );
}

export const kv = new Redis({
  url: url || "",
  token: token || "",
});