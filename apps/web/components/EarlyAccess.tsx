import React, { useState } from "react";
import { motion } from "framer-motion";

function getServerBase(): string {
  const base =
    (import.meta.env.VITE_SERVER_URL as string) || "http://localhost:3001";
  return base.replace(/\/$/, "");
}

export const EarlyAccess: React.FC = () => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "sent" | "exists" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch(`${getServerBase()}/api/early-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          data?.message || "Could not submit your request. Please try again.",
        );
        return;
      }

      if (data.alreadyRegistered) {
        setStatus("exists");
      } else {
        setStatus("sent");
      }
      setFormData({ fullName: "", email: "" });
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      console.error("Early access request failed", err);
      setStatus("error");
      setErrorMessage("Network error. Check your connection and try again.");
    }
  };

  const inputClasses =
    "w-full bg-transparent border-b border-black/20 py-4 text-lg md:text-xl outline-none transition-all duration-300 placeholder:text-black/30";

  const busy = status === "loading" || status === "sent" || status === "exists";

  return (
    <section className="flex h-screen w-full snap-center flex-col justify-between bg-white px-6 pb-6 pt-20 md:pt-24">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-10 md:mb-16"
        >
          <h2 className="mb-4 text-4xl font-bold tracking-tight md:text-7xl">
            Early Access.
          </h2>
          <p className="text-base font-light md:text-lg">
            Request access to the Mudir mobile app. We&apos;ll reach out when
            your invite is ready.
          </p>
        </motion.div>

        <form className="space-y-8 md:space-y-12" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              name="fullName"
              autoComplete="name"
              placeholder="Full name"
              className={inputClasses}
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              onFocus={() => setFocusedField("fullName")}
              onBlur={() => setFocusedField(null)}
              required
              minLength={2}
              maxLength={120}
              disabled={busy}
            />
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-black"
              initial={{ width: "0%" }}
              animate={{ width: focusedField === "fullName" ? "100%" : "0%" }}
            />
          </div>

          <div className="relative">
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email"
              className={inputClasses}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              required
              disabled={busy}
            />
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-black"
              initial={{ width: "0%" }}
              animate={{ width: focusedField === "email" ? "100%" : "0%" }}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full border border-black px-10 py-4 text-base font-medium transition-all duration-300 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:text-lg"
          >
            {status === "loading"
              ? "Submitting..."
              : status === "sent"
                ? "You're on the list"
                : status === "exists"
                  ? "Already registered"
                  : "Request early access"}
          </button>

          {status === "error" && (
            <p className="text-sm text-red-500">
              {errorMessage || "Failed to submit. Please try again."}
            </p>
          )}
          {(status === "sent" || status === "exists") && (
            <p className="text-sm text-black/60">
              {status === "exists"
                ? "This email is already on the early access list."
                : "Thanks — we'll be in touch soon."}
            </p>
          )}
        </form>
      </div>

      <div className="mx-auto mt-12 flex w-full max-w-7xl justify-between border-t border-black pt-6 text-xs md:text-sm">
        <span>© 2026 Mudir.</span>
        <span>
          Created by{" "}
          <a
            href="https://basharkhan.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="font-bold">basharkhan.com</span>
          </a>
        </span>
      </div>
    </section>
  );
};
