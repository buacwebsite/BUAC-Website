import type { Metadata } from "next";
import { Poppins, Bebas_Neue } from "next/font/google";
import "../globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider } from "../context/AuthProvider";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { env } from "../../env";
import { ReactLenis } from "lenis/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EditorProvider } from "../context/EditorContext";

gsap.registerPlugin(ScrollTrigger);

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
  title: "BUAC",
  description: "BUAC - BRAC University Adventure Club",
};

interface TokenPayload {
  sub: string;
  role: string;
  name: string;
  iat: number;
  exp: number;
}

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  // Check admin token
  const adminToken = cookieStore.get("admin-token")?.value ?? "";
  let authenticated = false;

  try {
    const payload = jwt.verify(adminToken, env.adminJwtSecret) as TokenPayload;
    authenticated = payload?.role === "admin";
  } catch {
    authenticated = false;
  }

  // Check user token
  const userToken = cookieStore.get("user-token")?.value ?? "";
  let initialUser: {
    email: string;
    name: string;
    role: "admin" | "member" | "alumni";
  } | null = null;

  try {
    const payload = jwt.verify(userToken, env.adminJwtSecret) as TokenPayload;
    if (payload?.sub) {
      initialUser = {
        email: payload.sub,
        name: payload.name || "User",
        role: payload.role as "admin" | "member" | "alumni",
      };
      if (payload.role === "admin") {
        authenticated = true;
      }
    }
  } catch {
    initialUser = null;
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