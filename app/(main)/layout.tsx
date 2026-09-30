import type { Metadata } from "next";
import { Poppins, Bebas_Neue } from "next/font/google";
import "../globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider } from "../context/AuthProvider";
import { EditorProvider } from "../context/EditorContext";
import SmoothScroll from "../components/SmoothScroll";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebasNeue",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "BUAC - BRAC University Adventure Club",
  description: "BRAC University Adventure Club Official Website",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${poppins.variable} ${bebasNeue.variable} min-h-screen bg-background text-text antialiased`}
    >
      <AuthProvider>
        <EditorProvider>
          <Navbar />
          <main className="overflow-hidden pt-16">{children}</main>
          <Footer />
          <SmoothScroll />
        </EditorProvider>
      </AuthProvider>
    </div>
  );
}