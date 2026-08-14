"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa6";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const giftTeam = [
    "Mehedi Hasan Nabil",
    "Farhan Labib Jahin",
    "Nafisa Rahman",
    "Mohammad Omar Raihan Shafin",
  ];

  const upgradingLead = "Md. Tawfiq Islam";

  const upgradingTeam = [
    "Mahmuda Aktar Mridula",
    "Md. Sadab Zahin Apurbo",
    "Ahnaf Atif Prapon",
    "Tahir Kawser Provat",
    "Sadman Sakib Saad",
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="site-footer relative w-full overflow-hidden border-t border-border bg-background font-poppins text-text-secondary"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-[80vw] -translate-x-1/2 rounded-full bg-accent/8 blur-3xl sm:w-[60vw]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <Link
            href="/"
            className="group flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start"
          >
            <Image
              src="/assets/logos/buac.webp"
              alt="BUAC Logo"
              width={44}
              height={44}
              className="object-contain transition-transform duration-300 group-hover:scale-110 sm:h-[48px] sm:w-[48px]"
            />

            <div>
              <h2 className="font-bebasNeue text-lg leading-none tracking-wider text-text-secondary sm:text-xl">
                BRAC UNIVERSITY
              </h2>

              <h3 className="mt-1 font-bebasNeue text-base leading-none tracking-wider text-accent sm:text-lg">
                ADVENTURE CLUB
              </h3>
            </div>
          </Link>

          <div className="flex flex-col items-center gap-3 md:items-end">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-text-muted">
              Connect With Us
            </h3>

            <div className="flex gap-3">
              <motion.div whileHover={{ y: -3, scale: 1.1 }}>
                <Link
                  href="https://facebook.com/buacofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-muted transition-colors hover:border-accent hover:bg-accent hover:text-white"
                >
                  <FaFacebook size={18} />
                </Link>
              </motion.div>

              <motion.div whileHover={{ y: -3, scale: 1.1 }}>
                <Link
                  href="https://instagram.com/brac_university_adventure_club"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-muted transition-colors hover:border-accent hover:bg-accent hover:text-white"
                >
                  <FaInstagram size={18} />
                </Link>
              </motion.div>

              <motion.div whileHover={{ y: -3, scale: 1.1 }}>
                <Link
                  href="https://linkedin.com/company/buac"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-muted transition-colors hover:border-accent hover:bg-accent hover:text-white"
                >
                  <FaLinkedin size={18} />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="flex flex-col items-center gap-5 px-2 text-center">
          <p className="text-[11px] tracking-wide text-text-muted">
            © {currentYear} BRAC University Adventure Club. All rights reserved.
          </p>

          <div className="flex flex-col items-center gap-1.5">
            <p className="text-[11px] italic text-text-muted">
              A gift with love from Batch 21{" "}
              <span className="text-accent">■</span>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[11px] text-text-muted sm:gap-x-3">
              {giftTeam.map((name, index) => (
                <span key={name} className="flex items-center gap-2.5 sm:gap-3">
                  <span className="transition-colors hover:text-accent">
                    {name}
                  </span>

                  {index < giftTeam.length - 1 && (
                    <span className="text-border">·</span>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-2">
            <div className="flex w-full max-w-xs items-center gap-3">
              <span className="h-px flex-1 bg-border" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-accent">
                1st Upgrading Team
              </span>

              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="text-[11px] text-text-muted">
              {upgradingLead}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[11px] text-text-muted sm:gap-x-3">
              {upgradingTeam.map((name, index) => (
                <span key={name} className="flex items-center gap-2.5 sm:gap-3">
                  <span className="transition-colors hover:text-accent">
                    {name}
                  </span>

                  {index < upgradingTeam.length - 1 && (
                    <span className="text-border">·</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;