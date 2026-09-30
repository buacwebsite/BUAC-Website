import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: "BUAC - BRAC University Adventure Club",
  description: "BRAC University Adventure Club Official Website",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://vercel-storage.com" />
        <link
          rel="preconnect"
          href="https://9dz6cjxsbr9j371m.public.blob.vercel-storage.com"
        />
        <link
          rel="dns-prefetch"
          href="https://lh74bam5behcabag.public.blob.vercel-storage.com"
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}