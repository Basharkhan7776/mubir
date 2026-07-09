import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, Loader2, LogIn } from "lucide-react";
import { PhoneMockup } from "./PhoneMockup";
import { useNavigate } from "react-router";
import { signInWithGoogle, getSession, signOut } from "@/lib/auth-client";
import { useSyncStatusMutation, useDownloadDataMutation } from "@/lib/hooks/use-sync";
import { hasLocalData, clearLocalData } from "@/lib/local-data";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  setServerDataVerified,
  setUser,
  logout as logoutAction,
} from "@/lib/store/slices/authSlice";
import { hydrateStoreFromLocal } from "@/lib/store";

export const Hero: React.FC = () => {
  const router = useNavigate();
  const dispatch = useAppDispatch();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const statusMutation = useSyncStatusMutation();
  const downloadMutation = useDownloadDataMutation();

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await getSession();
        setIsLoggedIn(!!data?.user);
        if (data?.user) {
          dispatch(
            setUser({
              id: data.user.id,
              email: data.user.email ?? null,
              name: data.user.name ?? null,
              image: data.user.image ?? null,
            }),
          );
        }
      } catch {
        setIsLoggedIn(false);
      }
    };
    check();
  }, [dispatch]);

  /**
   * Login / Open — the ONLY place that intentionally hits /api/sync/status
   * for returning users. OAuth first-time users bootstrap once in ProtectedApp
   * when there is no local data and status has not been verified yet.
   */
  const handleLogin = async () => {
    if (!isLoggedIn) {
      try {
        // OAuth redirect; after callback, ProtectedApp hydrates session.
        // Status is checked once there only if there is no local data yet.
        signInWithGoogle("/app");
      } catch (err) {
        console.error("Failed to start OAuth login", err);
        router("/app");
      }
      return;
    }

    // Already logged in → Open: verify server has data, then enter app.
    setIsChecking(true);
    try {
      const status = await statusMutation.mutateAsync();

      if (!status.hasData) {
        try {
          await signOut();
        } catch {
          /* ignore */
        }
        clearLocalData();
        dispatch(logoutAction());
        setIsLoggedIn(false);
        alert(
          "You don't have any data on the server yet.\n\n" +
            "Please download the Mudir mobile app, log in there, " +
            "upload your data from the app, and then return here to fetch/sync it.",
        );
        return;
      }

      dispatch(setServerDataVerified(true));

      // Ensure Redux has data: hydrate local, or download once if empty
      if (hasLocalData()) {
        hydrateStoreFromLocal();
      } else {
        await downloadMutation.mutateAsync();
      }

      router("/app");
    } catch (err) {
      console.error("Status check failed", err);
      alert(
        "Could not verify your server data. Please check your connection and try again.",
      );
    } finally {
      setIsChecking(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const busy = isChecking || statusMutation.isPending || downloadMutation.isPending;

  return (
    <section className="h-screen w-full snap-center flex flex-col md:flex-row items-center justify-center relative overflow-hidden bg-white px-6">
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center h-full pt-20 md:pt-0">
        {/* Left: Text Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center md:items-start text-center md:text-left z-10 order-2 md:order-1 pb-10 md:pb-0"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-8xl font-bold tracking-tighter leading-none mb-4 md:mb-6"
          >
            Mudir<span className="text-black">.</span>
            <br />
            <span className="text-3xl md:text-6xl font-normal block mt-2">
              Inventory Mastered.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base md:text-xl font-light max-w-md mb-8 md:mb-10 leading-relaxed"
          >
            Offline-first resource management for the modern professional.
            Minimalist. Secure. Yours.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-3 md:gap-4 justify-center md:justify-start"
          >
            <button
              className="group flex items-center gap-2 md:gap-3 px-5 py-2 md:px-6 md:py-3 border border-black rounded-full hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none"
              onClick={handleLogin}
              disabled={busy}
            >
              {busy ? (
                <Loader2
                  size={18}
                  className="md:w-5 md:h-5 animate-spin"
                />
              ) : (
                <LogIn
                  size={18}
                  className="md:w-5 md:h-5 group-hover:fill-white transition-colors"
                />
              )}
              <span className="font-medium text-sm md:text-base">
                {busy
                  ? "Checking..."
                  : isLoggedIn
                    ? "Open"
                    : "Login"}
              </span>
            </button>
            <a
              href="https://github.com/basharkhan7776/mudir"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="group flex items-center gap-2 md:gap-3 px-5 py-2 md:px-6 md:py-3 border border-black rounded-full hover:bg-black hover:text-white transition-all duration-300">
                <Github size={18} className="md:w-5 md:h-5" />
                <span className="font-medium text-sm md:text-base">GitHub</span>
              </button>
            </a>
          </motion.div>
        </motion.div>

        {/* Right: Phone Visual */}
        <div className="flex items-center justify-center order-1 md:order-2 w-full">
          <PhoneMockup feature="hero" />
        </div>
      </div>
    </section>
  );
};
