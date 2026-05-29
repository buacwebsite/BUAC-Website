import Link from "next/link";
import "./globals.css";
import { GiTrail } from "react-icons/gi";

const NotFound = () => {
  return (
    <div>
      <div className="h-screen w-full flex flex-col justify-center items-center text-zinc-400 bg-zinc-900 gradient relative font-[Poppins] ">
        {/* <div aria-hidden className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-radial from-white/20 via-white/10 to-transparent opacity-30 blur-3xl mix-blend-screen animate-pulse" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white opacity-10 blur-xl mix-blend-screen" />
        </div> */}
        <h1 className="text-4xl font-bold text-center text-balance w-120 relative z-10 bg-clip-text text-transparent bg-radial from-white/80 via-white/50 to-white/5">
          Are you lost wanderer? It&apos;s quite dark here...
        </h1>
        <Link
          href="/"
          className="mt-6 px-6 py-3 bg-linear-to-b from-zinc-900/90 to-zinc-800/80 text-zinc-200 font-medium rounded-lg border border-zinc-700 hover:from-zinc-800/90 hover:to-zinc-700/80 transition-colors duration-200 relative z-10 shadow-[0_8px_30px_rgba(2,6,23,0.7)] backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
        >
          <GiTrail className="inline mr-2 mb-1 text-xl" />
          Get back on trail
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
