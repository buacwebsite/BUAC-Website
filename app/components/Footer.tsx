"use client";

import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa6";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const giftTeam = [
    "Mehedi Hasan Nabil",
    "Farhan Labib Jahin",
    "Nafisa Rahman",
    "Mohammad Omar Raihan Shafin",
  ];

  const upgradingTeam = [
    "Md. Tawfiq Islam Tonmoy",
    "Mahmuda Aktar Mridula",
    "Md. Sadab Zahin Apurbo",
    "Ahnaf Atif Prapon",
    "Sadman Sakib Saad",
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative w-full overflow-hidden bg-black text-zinc-100 font-poppins"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-black to-black" />
      <div className="absolute left-1/2 top-0 h-80 w-[80vw] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <Link href="/" className="flex flex-col items-center md:items-start gap-4 group">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/logos/buac.webp"
                alt="BUAC Logo"
                width={64}
                height={64}
                className="object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <div>
                <h2 className="font-bebasNeue text-3xl tracking-wider text-white">
                  BRAC UNIVERSITY
                </h2>
                <h3 className="font-bebasNeue text-2xl tracking-wider text-accent -mt-2">
                  ADVENTURE CLUB
                </h3>
              </div>
            </div>
            <p className="max-w-md text-center md:text-left text-sm text-zinc-400 leading-relaxed">
              Built by challenges, driven by purpose. Explore more, climb
              higher, and keep the adventure alive.
            </p>
          </Link>

          <div className="flex flex-col items-center md:items-end gap-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-400">
              Connect With Us
            </h3>
            <div className="flex gap-4">
              <motion.div whileHover={{ scale: 1.15, y: -3 }}>
                <Link
                  href="https://facebook.com/buacofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:border-accent hover:bg-accent hover:text-white"
                  aria-label="Facebook"
                >
                  <FaFacebook size={22} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.15, y: -3 }}>
                <Link
                  href="https://instagram.com/brac_university_adventure_club"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:border-accent hover:bg-accent hover:text-white"
                  aria-label="Instagram"
                >
                  <FaInstagram size={22} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.15, y: -3 }}>
                <Link
                  href="https://linkedin.com/company/buac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:border-accent hover:bg-accent hover:text-white"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin size={22} />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="flex flex-col items-center gap-8 text-center">
          <p className="text-xs tracking-wide text-zinc-500">
            © {currentYear} BRAC University Adventure Club. All rights reserved.
          </p>

          {/* Credits: Batch 21 gift team */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-zinc-500 italic">
              A gift with love from Batch 21{" "}
              <span className="text-accent">■</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-400">
              {giftTeam.map((name, i) => (
                <span key={name} className="flex items-center gap-4">
                  <span className="hover:text-accent transition-colors">
                    {name}
                  </span>
                  {i < giftTeam.length - 1 && (
                    <span className="text-zinc-700">·</span>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 w-full max-w-sm">
            <span className="h-px flex-1 bg-zinc-800" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">
              1st Upgrading Team
            </span>
            <span className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* 1st Upgrading Team */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-400">
            {upgradingTeam.map((name, i) => (
              <span key={name} className="flex items-center gap-4">
                <span className="hover:text-accent transition-colors">
                  {name}
                </span>
                {i < upgradingTeam.length - 1 && (
                  <span className="text-zinc-700">·</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;