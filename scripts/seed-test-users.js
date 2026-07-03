const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { Redis } = require("@upstash/redis");

function cleanEnvValue(value) {
  if (!value) return "";

  let cleaned = value.trim();

  // Remove comments after value only if there is a space before #
  cleaned = cleaned.replace(/\s+#.*$/, "").trim();

  // Remove wrapping quotes repeatedly
  while (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned;
}

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    console.error(".env.local not found");
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, "utf8");

  content.split("\n").forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) return;

    const equalIndex = trimmed.indexOf("=");

    if (equalIndex === -1) return;

    const key = trimmed.slice(0, equalIndex).trim();
    const rawValue = trimmed.slice(equalIndex + 1).trim();
    const value = cleanEnvValue(rawValue);

    process.env[key] = value;
  });
}

loadEnvFile();

const redisUrl =
  cleanEnvValue(process.env.UPSTASH_REDIS_REST_URL) ||
  cleanEnvValue(process.env.KV_REST_API_URL);

const redisToken =
  cleanEnvValue(process.env.UPSTASH_REDIS_REST_TOKEN) ||
  cleanEnvValue(process.env.KV_REST_API_TOKEN);

if (!redisUrl || !redisToken) {
  console.error("Redis env missing.");
  console.error("Please set one of these pairs in .env.local:");
  console.error("");
  console.error("UPSTASH_REDIS_REST_URL=https://your-db.upstash.io");
  console.error("UPSTASH_REDIS_REST_TOKEN=your_write_token");
  console.error("");
  console.error("OR");
  console.error("");
  console.error("KV_REST_API_URL=https://your-db.upstash.io");
  console.error("KV_REST_API_TOKEN=your_write_token");
  process.exit(1);
}

if (!redisUrl.startsWith("https://")) {
  console.error("Invalid Redis URL:");
  console.error(redisUrl);
  console.error("");
  console.error("It must start with https:// and must not contain quotes.");
  process.exit(1);
}

const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});

const TEST_PASSWORD = "Test@12345";

const users = [
  {
    name: "Test Member",
    email: "test.member@g.bracu.ac.bd",
    role: "member",
    profile: {
      contact: "01700000001",
      varsityDepartment: "CSE",
      joinSemester: "Spring 2025",
      buacDepartment: "Creative",
      buacPosition: "General Member",
      panelPosition: "",
      bloodGroup: "Unknown",
      donateBlood: "no",
      facebook: "https://facebook.com/test.member",
    },
  },
  {
    name: "Test Alumni",
    email: "test.alumni@gmail.com",
    role: "alumni",
    profile: {
      contact: "01700000002",
      facebook: "https://facebook.com/test.alumni",
      buacExDepartment: "Event Management",
      buacExPosition: "Coordinator",
      panelPosition: "",
      bloodGroup: "Unknown",
      donateBlood: "no",
    },
  },
  {
    name: "Test Panel",
    email: "test.panel@g.bracu.ac.bd",
    role: "member",
    profile: {
      contact: "01700000003",
      varsityDepartment: "CSE",
      joinSemester: "Spring 2025",
      buacDepartment: "Panel",
      buacPosition: "",
      panelPosition: "President",
      bloodGroup: "Unknown",
      donateBlood: "no",
      facebook: "https://facebook.com/test.panel",
    },
  },
];

async function main() {
  console.log("Using Redis URL:", redisUrl);
  console.log(
    "Using token:",
    process.env.UPSTASH_REDIS_REST_TOKEN
      ? "UPSTASH_REDIS_REST_TOKEN"
      : "KV_REST_API_TOKEN",
  );
  console.log("");

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

  const existingList = (await redis.get("users:list")) || [];
  const usersList = Array.isArray(existingList) ? existingList : [];

  for (const user of users) {
    await redis.set(`user:${user.email}`, {
      name: user.name,
      email: user.email,
      passwordHash,
      role: user.role,
      profile: user.profile,
      createdAt: new Date().toISOString(),
      authProvider: "password",
    });

    if (!usersList.includes(user.email)) {
      usersList.push(user.email);
    }

    console.log(`Seeded: ${user.email}`);
  }

  await redis.set("users:list", usersList);

  console.log("");
  console.log("Test users created successfully:");
  console.log("--------------------------------");
  console.log(`Member: ${users[0].email}`);
  console.log(`Alumni: ${users[1].email}`);
  console.log(`Panel:  ${users[2].email}`);
  console.log(`Password for all: ${TEST_PASSWORD}`);
}

main().catch((error) => {
  console.error("");
  console.error("Seed failed:");
  console.error(error);
  process.exit(1);
});