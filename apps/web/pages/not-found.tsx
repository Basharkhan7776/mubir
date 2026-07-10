import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Compass, Box, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "404 — Page Not Found | Mudir";
  }, []);

  return (
    <main
      id="not-found-page"
      className="relative min-h-screen w-full flex flex-col items-center justify-between overflow-hidden bg-white text-black selection:bg-black selection:text-white px-6 py-8"
    >
      {/* Top Brand Header */}
      <header className="relative z-20 w-full max-w-5xl mx-auto flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-xl font-bold tracking-tighter hover:opacity-80 transition-opacity flex items-center gap-1"
        >
          <span>Mudir</span>
          <span className="text-black">.</span>
        </button>
      </header>

      {/* Subtle Ambient Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-zinc-100 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-zinc-100 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl w-full mx-auto flex flex-col items-center text-center my-auto py-12">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/10 bg-zinc-50/90 backdrop-blur-md text-xs font-medium tracking-wide uppercase text-zinc-600 mb-8 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span>Error 404 &bull; Resource Missing</span>
        </motion.div>

        {/* Oversized 404 Visual Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-8"
        >
          <div className="text-[7rem] sm:text-[9.5rem] font-bold tracking-tighter leading-none select-none text-transparent bg-clip-text bg-gradient-to-b from-black via-zinc-800 to-zinc-400 font-mono">
            404
          </div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-3 -right-6 hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-black/10 shadow-xl"
          >
            <Box className="w-6 h-6 text-zinc-700 stroke-[1.75]" />
          </motion.div>
        </motion.div>

        {/* Heading & Description */}
        <motion.h1
          id="not-found-heading"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-black"
        >
          Ledger Entry Out of Stock<span className="text-zinc-400">.</span>
        </motion.h1>

        <motion.p
          id="not-found-description"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg font-light text-zinc-600 max-w-md mb-10 leading-relaxed"
        >
          The page or inventory path you are looking for has been moved, deleted, or never existed in your workspace.
        </motion.p>

        {/* Interactive Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
        >
          <button
            id="not-found-home-btn"
            onClick={() => navigate("/")}
            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-black text-white font-medium text-sm hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-md"
          >
            <Home className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            <span>Return to Landing</span>
          </button>

          <button
            id="not-found-app-btn"
            onClick={() => navigate("/app")}
            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full border border-black/15 bg-white hover:bg-zinc-100 font-medium text-sm text-black transition-all"
          >
            <Compass className="w-4 h-4 text-zinc-500 transition-transform group-hover:rotate-45" />
            <span>Open Dashboard</span>
          </button>

          <button
            id="not-found-back-btn"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-zinc-600 hover:text-black text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </motion.div>
      </div>

      {/* Footer info */}
      <footer className="relative z-20 w-full max-w-5xl mx-auto flex items-center justify-between text-xs text-zinc-400 font-mono">
        <span>MUDIR &bull; ERROR 404 ROUTE</span>
        <span>OFFLINE-FIRST INVENTORY</span>
      </footer>
    </main>
  );
}
