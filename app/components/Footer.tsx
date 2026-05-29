"use client";

import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="absolute h-[50vh] w-full bg-background text-zinc-100 font-poppins">
      <Image
        src="/assets/footerbg.webp"
        alt="Footer Background"
        fill
        className="absolute inset-0 object-cover md:object-fill"
        priority
      />

      <div className="absolute bottom-0 left-0 w-full z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-8 mb-2">
            <div className="flex flex-col items-center md:items-start gap-4">
              <Link href="/" className="flex gap-3 items-end justify-center">
                <Image
                  src="/assets/logos/buac.webp"
                  alt="BUAC Logo"
                  width={60}
                  height={60}
                  className="object-contain"
                />
                <h2 className="text-2xl font-bebasNeue tracking-wider">
                  BRAC UNIVERSITY ADVENTURE CLUB
                </h2>
              </Link>
            </div>

            <div className="flex flex-row md:flex-col items-center gap-8 md:gap-4">
              <h3 className="text-lg font-semibold uppercase tracking-wide">
                Connect With Us
              </h3>
              <div className="flex gap-6">
                <Link
                  href="https://facebook.com/buacofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <FaFacebook size={28} />
                </Link>
                <Link
                  href="https://instagram.com/brac_university_adventure_club"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <FaInstagram size={28} />
                </Link>
                <Link
                  href="https://linkedin.com/company/buac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-500 transition-colors duration-300"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin size={28} />
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-500/50 mb-2 md:mb-4" />

          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm tracking-wide">
              &copy; {currentYear} BRAC University Adventure Club
              <br />
              <span className="text-[0.7rem]">All rights reserved</span>
            </p>
            <p className="text-xs text-zinc-300 italic">
              A gift with love from Batch 21 🖤
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
