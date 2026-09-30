import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), payment=(), usb=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    /*
     * Next.js 16 requires every manually used quality value
     * to appear in this list.
     */
    qualities: [35, 40, 45, 50, 55, 60, 65, 70, 75, 80],

    formats: ["image/avif", "image/webp"],

    /*
     * Keep optimized remote images cached for 30 days.
     */
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

  experimental: {
    optimizePackageImports: [
      "react-icons",
      "framer-motion",
      "gsap",
      "axios",
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,

          /*
           * HSTS is only safe on production HTTPS deployment.
           * Do not force it while testing on localhost.
           */
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;