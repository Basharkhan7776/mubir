import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  ChevronRight,
  CreditCard,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Settings,
  Share2,
  WifiOff,
  ShieldCheck,
  HardDrive,
  FileJson,
  Download,
  Upload,
} from "lucide-react";

/** Shared shell styles matching Mudir mobile app screenshots */
const shell = "flex h-full w-full flex-col bg-[#f2f2f2] text-black";
const headerPad = "px-4 pt-11 pb-2";
const bodyPad = "flex-1 overflow-hidden px-3.5 pb-14 no-scrollbar";
const card =
  "rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]";
const listCard =
  "flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]";
const fab =
  "absolute bottom-5 right-4 z-20 flex size-12 items-center justify-center rounded-full bg-black text-white shadow-lg";
const muted = "text-[10px] text-black/40";
const label = "text-[10px] font-medium uppercase tracking-wider text-black/35";

function StatusBar() {
  return (
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex h-9 items-end justify-between px-5 pb-0.5 text-[10px] font-semibold text-black/80">
      <span>9:41</span>
      <div className="flex items-center gap-1 opacity-70">
        <span className="text-[9px]">5G</span>
        <div className="h-2 w-4 rounded-[2px] border border-black/70">
          <div className="m-[1px] h-full w-3/4 rounded-[1px] bg-black/70" />
        </div>
      </div>
    </div>
  );
}

function BackHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className={`${headerPad} flex items-center justify-between`}>
      <div className="flex size-8 items-center justify-center">
        <ArrowLeft className="size-5" strokeWidth={2} />
      </div>
      <h1 className="text-[15px] font-bold tracking-tight">{title}</h1>
      <div className="flex size-8 items-center justify-center">{right}</div>
    </div>
  );
}

function SearchPlaceholder({ text }: { text: string }) {
  return (
    <div className="mb-3 px-0.5">
      <div className="flex items-center gap-2 rounded-xl bg-black/[0.04] px-3 py-2.5">
        <Search className="size-3.5 text-black/30" strokeWidth={2} />
        <span className="text-[12px] text-black/30">{text}</span>
      </div>
    </div>
  );
}

function ListRow({
  title,
  subtitle,
  trailing,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={listCard}
    >
      <div className="size-1.5 shrink-0 rounded-full bg-black" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold leading-tight">
          {title}
        </div>
        {subtitle && (
          <div className={`mt-0.5 truncate ${muted}`}>{subtitle}</div>
        )}
      </div>
      {trailing ?? (
        <ChevronRight className="size-4 shrink-0 text-black/25" strokeWidth={2} />
      )}
    </motion.div>
  );
}

function Fab({ icon = "plus" }: { icon?: "plus" | "pencil" }) {
  return (
    <div className={fab}>
      {icon === "pencil" ? (
        <Pencil className="size-5" strokeWidth={2} />
      ) : (
        <Plus className="size-5" strokeWidth={2} />
      )}
    </div>
  );
}

/** Home dashboard — screens 1 & 2 */
export function HomeScreen({ offlineBadge = false }: { offlineBadge?: boolean }) {
  const cards = [
    {
      icon: Box,
      label: "INVENTORY",
      value: "11",
      action: "Manage Collections",
      solid: true,
    },
    {
      icon: CreditCard,
      label: "LEDGER",
      value: "₹63.0k",
      action: "Track Organizations",
      solid: true,
    },
    {
      icon: ReceiptText,
      label: "RECEIPTS",
      value: "3",
      action: "View Receipts",
      solid: true,
    },
    {
      icon: Settings,
      label: "SYSTEM",
      value: "Settings",
      action: "App Config & Data",
      solid: false,
    },
  ];

  return (
    <div className={shell}>
      <StatusBar />
      <div className={`${headerPad} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold tracking-tight">Mudir</h1>
          {offlineBadge && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black px-2 py-0.5 text-[9px] font-semibold text-white">
              <WifiOff className="size-2.5" /> Offline
            </span>
          )}
        </div>
        <Search className="size-5 text-black/70" strokeWidth={2} />
      </div>
      <div className={`${bodyPad} space-y-3 overflow-y-auto no-scrollbar`}>
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`${card} p-4`}
            >
              <div className="mb-3 flex items-center gap-1.5 text-black/40">
                <Icon className="size-3.5" strokeWidth={1.75} />
                <span className="text-[10px] font-semibold tracking-widest">
                  {c.label}
                </span>
              </div>
              <div
                className={`mb-3 font-extrabold tracking-tight ${
                  c.value.length > 6 ? "text-2xl" : "text-3xl"
                }`}
              >
                {c.value}
              </div>
              <div className="flex items-center justify-between border-t border-black/5 pt-3">
                <span className="text-[12px] font-medium text-black/70">
                  {c.action}
                </span>
                <div
                  className={`flex size-7 items-center justify-center rounded-full ${
                    c.solid ? "bg-black text-white" : "bg-black/5 text-black/50"
                  }`}
                >
                  <ArrowRight className="size-3.5" strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>
          );
        })}
        <p className="pt-1 text-center text-[10px] text-black/30">
          Build by Bashar Khan
        </p>
      </div>
    </div>
  );
}

/** Collections list — screen 3 */
export function CollectionsScreen() {
  const items = [
    { name: "Electronics", count: "5 items" },
    { name: "Clothing", count: "3 items" },
    { name: "Groceries", count: "3 items" },
  ];
  return (
    <div className={`${shell} relative`}>
      <StatusBar />
      <BackHeader title="Collections" />
      <div className={bodyPad}>
        <SearchPlaceholder text="Search collections..." />
        <div className="space-y-2.5">
          {items.map((item, i) => (
            <ListRow
              key={item.name}
              title={item.name}
              subtitle={item.count}
              delay={i * 0.08}
            />
          ))}
        </div>
      </div>
      <Fab />
    </div>
  );
}

/** Electronics items — screen 4 */
export function ItemsScreen() {
  const items = [
    { name: "iPhone 15 Pro", brand: "BRAND: APPLE" },
    { name: "MacBook Air M2", brand: "BRAND: APPLE" },
    { name: "Samsung Galaxy S24", brand: "BRAND: SAMSUNG" },
    { name: 'iPad Pro 11"', brand: "BRAND: APPLE" },
    { name: "AirPods Pro", brand: "BRAND: APPLE" },
  ];
  return (
    <div className={`${shell} relative`}>
      <StatusBar />
      <BackHeader title="Electronics" />
      <div className={bodyPad}>
        <SearchPlaceholder text="Search model or SKU" />
        <div className="space-y-2.5">
          {items.map((item, i) => (
            <ListRow
              key={item.name}
              title={item.name}
              subtitle={item.brand}
              delay={i * 0.06}
            />
          ))}
        </div>
      </div>
      <Fab />
    </div>
  );
}

/** Item details — screen 5 */
export function ItemDetailsScreen() {
  const fields = [
    ["PRODUCT NAME", "iPhone 15 Pro"],
    ["BRAND", "Apple"],
    ["PRICE", "₹129900"],
    ["QUANTITY", "5"],
    ["CATEGORY", "Mobile"],
    ["IN STOCK", "Yes"],
  ];
  return (
    <div className={`${shell} relative`}>
      <StatusBar />
      <BackHeader title="ITEM DETAILS" />
      <div className={`${bodyPad} overflow-y-auto no-scrollbar`}>
        <div className="mb-4 px-1">
          <h2 className="text-lg font-extrabold tracking-tight">
            iPhone 15 Pro
          </h2>
          <p className={`${muted} mt-0.5`}>Added: 01-12-2024 by Admin</p>
        </div>
        <div className="mx-1 border-t border-black/10" />
        <div className="mt-1 space-y-0">
          {fields.map(([k, v], i) => (
            <motion.div
              key={k}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 * i }}
              className="flex items-center justify-between border-b border-black/5 px-1 py-3.5"
            >
              <span className={label}>{k}</span>
              <span className="text-[13px] font-semibold">{v}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <Fab icon="pencil" />
    </div>
  );
}

/** Organizations / parties — screen 6 */
export function OrganizationsScreen() {
  const orgs = [
    { name: "Rajesh Electronics", phone: "+91 98765 43210" },
    { name: "Sharma Textiles", phone: "+91 99887 76655" },
    { name: "Kumar Groceries", phone: "+91 98123 45678" },
    { name: "Patel Traders", phone: "+91 97654 32109" },
    { name: "Singh Electronics Pvt Ltd", phone: "+91 96543 21098" },
  ];
  return (
    <div className={`${shell} relative`}>
      <StatusBar />
      <BackHeader title="Organizations" />
      <div className={bodyPad}>
        <SearchPlaceholder text="Search organizations..." />
        <div className="space-y-2.5">
          {orgs.map((org, i) => (
            <ListRow
              key={org.name}
              title={org.name}
              subtitle={org.phone}
              delay={i * 0.06}
            />
          ))}
        </div>
      </div>
      <Fab />
    </div>
  );
}

/** Party ledger chat — screen 7 */
export function PartyLedgerScreen() {
  const entries = [
    {
      date: "15-11-2024",
      side: "left" as const,
      label: "PURCHASE OF 5 IPHONES",
      amount: "- ₹50,000.00",
      credit: false,
    },
    {
      date: "20-11-2024",
      side: "right" as const,
      label: "PARTIAL PAYMENT RECEIVED",
      amount: "+ ₹20,000.00",
      credit: true,
    },
    {
      date: "01-12-2024",
      side: "left" as const,
      label: "ADDITIONAL PURCHASE - ACCESSORIES",
      amount: "- ₹15,000.00",
      credit: false,
    },
  ];

  return (
    <div className={`${shell} relative`}>
      <StatusBar />
      <div className={`${headerPad} relative flex items-start justify-between`}>
        <div className="flex size-8 items-center justify-center pt-1">
          <ArrowLeft className="size-5" strokeWidth={2} />
        </div>
        <div className="flex flex-col items-center pt-0.5">
          <span className="text-[13px] font-bold">Rajesh Electronics</span>
          <span className={`${label} mt-1`}>NET BALANCE</span>
          <span className="mt-0.5 text-xl font-extrabold tracking-tight">
            ₹ 45,000.00
          </span>
          <span className="mt-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
            You will get
          </span>
        </div>
        <div className="flex size-8 items-center justify-center pt-1">
          <Share2 className="size-4 text-black/70" strokeWidth={2} />
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar px-3.5 pb-20 pt-2">
        {entries.map((e, i) => (
          <motion.div
            key={e.date + e.label}
            initial={{ opacity: 0, x: e.side === "left" ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 * i }}
            className="flex flex-col"
          >
            <span className="mb-1.5 text-center text-[10px] text-black/35">
              {e.date}
            </span>
            <div
              className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
                e.side === "left"
                  ? "self-start rounded-tl-md bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
                  : "self-end rounded-tr-md bg-black text-white"
              }`}
            >
              <div
                className={`text-[9px] font-semibold uppercase tracking-wide ${
                  e.credit ? "text-white/70" : "text-black/40"
                }`}
              >
                {e.label}
              </div>
              <div className="mt-0.5 text-[14px] font-bold">{e.amount}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="absolute bottom-4 left-3.5 right-3.5 z-20">
        <div className="flex items-center justify-center gap-1.5 rounded-full bg-black py-3.5 text-white shadow-lg">
          <Plus className="size-4" strokeWidth={2.5} />
          <span className="text-[13px] font-semibold">Add Entry</span>
        </div>
      </div>
    </div>
  );
}

/** Receipts list — screen 8 */
export function ReceiptsScreen() {
  const receipts = [
    { name: "John Doe", phone: "PHNO: +91 98765 12345", items: "2" },
    { name: "Sarah Smith", phone: "PHNO: +91 99887 76655", items: "1" },
    { name: "Amit Kumar", phone: "PHNO: +91 91234 56789", items: "2" },
  ];
  return (
    <div className={`${shell} relative`}>
      <StatusBar />
      <BackHeader title="Receipts" />
      <div className={bodyPad}>
        <SearchPlaceholder text="Search receipts..." />
        <div className="space-y-2.5">
          {receipts.map((r, i) => (
            <ListRow
              key={r.name}
              title={r.name}
              subtitle={r.phone}
              delay={i * 0.08}
              trailing={
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-bold">{r.items}</span>
                  <ChevronRight
                    className="size-4 text-black/25"
                    strokeWidth={2}
                  />
                </div>
              }
            />
          ))}
        </div>
      </div>
      <Fab />
    </div>
  );
}

/** Receipt detail — screen 9 */
export function ReceiptDetailScreen() {
  const items = [
    { name: "Rice 5kg", qty: "2 × ₹350", total: "₹700" },
    { name: "Cooking Oil 1L", qty: "3 × ₹180", total: "₹540" },
  ];
  return (
    <div className={`${shell} relative`}>
      <StatusBar />
      <BackHeader
        title="John Doe"
        right={<Share2 className="size-4 text-black/70" strokeWidth={2} />}
      />
      <div className={`${bodyPad} overflow-y-auto no-scrollbar`}>
        <div className={`${card} mb-4 p-4`}>
          <span className={label}>Total amount</span>
          <div className="mt-1 text-3xl font-extrabold tracking-tight">
            ₹1,240
          </div>
          <div className="mt-4 flex items-end justify-between border-t border-black/5 pt-3">
            <div>
              <div className={label}>Date</div>
              <div className="mt-0.5 text-[12px] font-semibold">9/7/2026</div>
            </div>
            <div className="text-right">
              <div className={label}>Items</div>
              <div className="mt-0.5 text-[12px] font-semibold">2</div>
            </div>
          </div>
        </div>
        <h3 className="mb-2 px-1 text-[14px] font-bold">Items</h3>
        <div className="space-y-2.5">
          {items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className={`${listCard} justify-between`}
            >
              <div>
                <div className="text-[13px] font-semibold">{item.name}</div>
                <div className={`mt-0.5 ${muted}`}>{item.qty}</div>
              </div>
              <div className="text-[13px] font-bold">{item.total}</div>
            </motion.div>
          ))}
        </div>
      </div>
      <Fab />
    </div>
  );
}

/** Settings / data ownership */
export function SettingsScreen({
  mode = "data",
}: {
  mode?: "data" | "security";
}) {
  return (
    <div className={shell}>
      <StatusBar />
      <BackHeader title="Settings" />
      <div className={`${bodyPad} space-y-3 overflow-y-auto no-scrollbar`}>
        <div className={`${card} p-4`}>
          <div className="mb-1 flex items-center gap-1.5 text-black/40">
            <Settings className="size-3.5" strokeWidth={1.75} />
            <span className="text-[10px] font-semibold tracking-widest">
              SYSTEM
            </span>
          </div>
          <div className="text-2xl font-extrabold tracking-tight">
            {mode === "security" ? "Secured" : "Your Data"}
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-black/45">
            {mode === "security"
              ? "Local encryption on device. No cloud risk by default."
              : "Export and import your entire Mudir database anytime."}
          </p>
        </div>

        {mode === "security" ? (
          <>
            <div className={`${card} flex items-center gap-3 p-4`}>
              <ShieldCheck className="size-6" strokeWidth={1.5} />
              <div>
                <div className="text-[13px] font-semibold">Local first</div>
                <div className={muted}>Data stays on your device</div>
              </div>
            </div>
            <div className={`${card} flex items-center gap-3 p-4`}>
              <HardDrive className="size-6" strokeWidth={1.5} />
              <div>
                <div className="text-[13px] font-semibold">AES-ready storage</div>
                <div className={muted}>Hardware-backed protection</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${card} flex items-center justify-between p-4`}
            >
              <div className="flex items-center gap-3">
                <Upload className="size-5" strokeWidth={1.75} />
                <div>
                  <div className="text-[13px] font-semibold">Export JSON</div>
                  <div className={muted}>Full backup file</div>
                </div>
              </div>
              <FileJson className="size-4 text-black/30" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="flex items-center justify-between rounded-2xl bg-black p-4 text-white shadow-md"
            >
              <div className="flex items-center gap-3">
                <Download className="size-5" strokeWidth={1.75} />
                <div>
                  <div className="text-[13px] font-semibold">Import Backup</div>
                  <div className="text-[10px] text-white/50">
                    Restore from JSON
                  </div>
                </div>
              </div>
              <FileJson className="size-4 text-white/40" />
            </motion.div>
          </>
        )}

        <div className={`${card} space-y-3 p-4`}>
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium">Organization</span>
            <span className="text-[12px] font-semibold">Demo Store</span>
          </div>
          <div className="border-t border-black/5" />
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium">Currency</span>
            <span className="text-[12px] font-semibold">₹ INR</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export type PhoneScreenId =
  | "hero"
  | "collections"
  | "items"
  | "item-details"
  | "ledger"
  | "orgs"
  | "receipts"
  | "receipt-detail"
  | "offline"
  | "data"
  | "security";

export function PhoneScreenContent({ feature }: { feature: string }) {
  switch (feature as PhoneScreenId) {
    case "hero":
      return <HomeScreen />;
    case "collections":
      return <CollectionsScreen />;
    case "items":
      return <ItemsScreen />;
    case "item-details":
      return <ItemDetailsScreen />;
    case "ledger":
      return <PartyLedgerScreen />;
    case "orgs":
      return <OrganizationsScreen />;
    case "receipts":
      return <ReceiptsScreen />;
    case "receipt-detail":
      return <ReceiptDetailScreen />;
    case "offline":
      return <HomeScreen offlineBadge />;
    case "data":
      return <SettingsScreen mode="data" />;
    case "security":
      return <SettingsScreen mode="security" />;
    default:
      return <HomeScreen />;
  }
}
