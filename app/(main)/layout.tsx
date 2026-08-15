import type { Metadata } from "next";
import { Poppins, Bebas_Neue } from "next/font/google";
import "../globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider } from "../context/AuthProvider";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { ReactLenis } from "lenis/react";
import { EditorProvider } from "../context/EditorContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebasNeue",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "BUAC - BRAC University Adventure Club",
  description: "BRAC University Adventure Club Official Website",
};

interface TokenPayload {
  sub: string;
  role: string;
  name: string;
}

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin-token")?.value ?? "";
  let authenticated = false;
  let initialUser = null;

  const jwtSecret = process.env.adminJwtSecret || "buac_secret_key_2026";
  const adminMail = process.env.adminMail || "admin@gmail.com";

  if (adminToken) {
    try {
      const payload = jwt.verify(adminToken, jwtSecret) as TokenPayload;

      if (payload?.role === "admin") {
        authenticated = true;
        initialUser = {
          email: payload.sub || adminMail,
          name: payload.name || "Admin",
          role: "admin" as const,
        };
      }
    } catch {
      authenticated = false;
      initialUser = null;
    }
  }

  return (
    <div
      className={`${poppins.variable} ${bebasNeue.variable} bg-background text-text min-h-screen antialiased`}
    >
      <ReactLenis root />
      <AuthProvider initialAuth={authenticated} initialUser={initialUser}>
        <EditorProvider>
          <Navbar />
          <div className="pt-16 overflow-hidden">{children}</div>
          <Footer />
        </EditorProvider>
      </AuthProvider>
    </div>
  );
}