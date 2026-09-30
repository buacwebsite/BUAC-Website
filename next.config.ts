import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },

  poweredByHeader: false,

  experimental: {
    optimizePackageImports: [
      "react-icons",
      "framer-motion",
      "gsap",
      "axios",
    ],
  },
};

export default nextConfig;