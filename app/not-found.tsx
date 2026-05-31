"use client";

import Link from "next/link";
import "./globals.css";
import { GiTrail } from "react-icons/gi";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div>
      <div className="h-screen w-full flex flex-col justify-center items-center text-zinc-400 bg-zinc-900 gradient relative font-[Poppins]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-bold text-center text-balance w-120 relative z-10 bg-clip-text text-transparent bg-radial from-white/80 via-white/50 to-white/5"
          >
            Are you lost wanderer? It&apos;s quite dark here...
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex justify-center"
          >
            <Link
              href="/"
              className="mt-6 px-6 py-3 bg-linear-to-b from-zinc-900/90 to-zinc-800/80 text-zinc-200 font-medium rounded-lg border border-zinc-700 hover:from-zinc-800/90 hover:to-zinc-700/80 transition-colors duration-200 relative z-10 shadow-[0_8px_30px_rgba(2,6,23,0.7)] backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 inline-flex items-center"
            >
              <GiTrail className="inline mr-2 mb-1 text-xl" />
              Get back on trail
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;