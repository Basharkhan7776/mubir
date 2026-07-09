import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneScreenContent } from "./phone-screens";

interface PhoneMockupProps {
  feature: string;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({ feature }) => {
  return (
    <motion.div
      className="relative mx-auto h-[520px] w-[260px] overflow-hidden rounded-[35px] border-[6px] border-black bg-black shadow-2xl sm:h-[600px] sm:w-[300px] md:h-[700px] md:w-[350px] md:rounded-[50px] md:border-[8px]"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      whileHover={{
        rotateY: 5,
        rotateX: -5,
        scale: 1.02,
        transition: { duration: 0.4 },
      }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Dynamic Island */}
      <div className="absolute left-1/2 top-0 z-40 h-6 w-24 -translate-x-1/2 rounded-b-xl bg-black md:h-7 md:w-28 md:rounded-b-2xl" />

      {/* Screen Area — app-like HTML screens (not abstract UI) */}
      <div className="absolute inset-0.5 z-10 overflow-hidden rounded-[29px] bg-[#f2f2f2] no-scrollbar md:rounded-[42px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={feature}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="h-full w-full overflow-hidden no-scrollbar"
          >
            <PhoneScreenContent feature={feature} />
          </motion.div>
        </AnimatePresence>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 z-30 h-1 w-24 -translate-x-1/2 rounded-full bg-black/80 md:w-32" />
      </div>

      {/* Reflections/Gloss */}
      <div className="pointer-events-none absolute inset-0 z-40 rounded-[35px] ring-1 ring-inset ring-white/10 md:rounded-[50px]" />
    </motion.div>
  );
};
