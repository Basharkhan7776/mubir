import React from "react";
import { motion } from "framer-motion";
import { PhoneMockup } from "./PhoneMockup";

interface FeatureFrameProps {
  title: string;
  description: string;
  featureId: string;
  index: number;
}

/**
 * Feature sections for the landing page.
 * Each featureId maps to a real Mudir mobile app screen mockup
 * (see components/phone-screens.tsx, based on apps/web/assets/screens).
 */
const features = [
  {
    id: "collections",
    title: "Dynamic Collections",
    description:
      "Build custom inventory catalogs like Electronics, Clothing, and Groceries. Search, open, and grow collections without rigid schemas.",
  },
  {
    id: "items",
    title: "Item Inventory",
    description:
      "Browse SKUs by brand and model—iPhone, MacBook, Galaxy—then drill into full product details with stock, price, and category.",
  },
  {
    id: "ledger",
    title: "Chat-Style Ledger",
    description:
      "Credits and debits as clear conversation bubbles. Track net balance with every party and add entries in one tap.",
  },
  {
    id: "orgs",
    title: "Organizations",
    description:
      "Manage suppliers and clients in one place. Search parties, open their books, and keep contact details at hand.",
  },
  {
    id: "receipts",
    title: "Receipts & Bills",
    description:
      "Issue and archive customer receipts with line items, quantities, and totals—ready to share from the device.",
  },
  {
    id: "offline",
    title: "Offline-First Core",
    description:
      "No internet? No problem. Mudir keeps working on-device so inventory, ledger, and receipts stay available at speed.",
  },
  {
    id: "data",
    title: "Total Data Ownership",
    description:
      "Your data is yours. Export and import the full Mudir database as JSON whenever you need a backup or migrate.",
  },
  {
    id: "security",
    title: "Zero Cloud Risk",
    description:
      "Local-first security on your hardware. Optional sync when you choose—never forced into a black-box cloud.",
  },
];

const FeatureFrame: React.FC<FeatureFrameProps> = ({
  title,
  description,
  featureId,
  index,
}) => {
  const isEven = index % 2 !== 0;

  return (
    <section className="relative flex h-screen w-full snap-center items-center justify-center overflow-hidden bg-white px-6">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-24">
        <motion.div
          initial={{ opacity: 0, x: isEven ? 50 : -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false, amount: 0.5 }}
          className={`z-10 flex flex-col space-y-4 md:space-y-6 ${
            isEven ? "md:order-2" : "md:order-1"
          }`}
        >
          <div className="w-fit border-b border-black pb-1 text-xs font-bold uppercase tracking-widest md:text-sm">
            {String(index + 1).padStart(2, "0")}
          </div>
          <h2 className="text-4xl font-bold tracking-tight md:text-7xl">
            {title}
          </h2>
          <p className="max-w-lg text-base font-light leading-relaxed md:text-xl">
            {description}
          </p>
        </motion.div>

        <motion.div
          className={`flex items-center justify-center ${
            isEven ? "md:order-1" : "md:order-2"
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.5 }}
        >
          <PhoneMockup feature={featureId} />
        </motion.div>
      </div>
    </section>
  );
};

export const FeatureShowcase: React.FC = () => {
  return (
    <>
      {features.map((feature, idx) => (
        <FeatureFrame
          key={feature.id}
          index={idx}
          featureId={feature.id}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </>
  );
};
