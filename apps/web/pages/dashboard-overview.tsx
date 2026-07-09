import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "@/lib/store/hooks";
import {
  inventoryNav,
  ledgerNav,
  receiptsNav,
} from "@/lib/navigation-state";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Box,
  Building2,
  ReceiptText,
  FileText,
  ArrowRight,
  Cpu,
  Sparkles,
  Wallet,
  ArrowUpRight,
  BarChart3,
  Layers,
} from "lucide-react";

function getItemTitle(item: any, collection?: any): string {
  if (!item || !item.values) return "Untitled Item";
  if (collection?.schema?.[0]?.key && item.values[collection.schema[0].key]) {
    return item.values[collection.schema[0].key];
  }
  return (
    item.values.name ||
    item.values.itemName ||
    item.values.product ||
    item.values.title ||
    "Untitled Item"
  );
}

function getItemSubtitle(item: any, collection?: any): string {
  if (!item || !item.values) return "";
  if (collection?.schema?.[1]) {
    const field = collection.schema[1];
    const val = item.values[field.key];
    if (val !== undefined && val !== null && val !== "") {
      return `${field.label}: ${val}`;
    }
  }
  if (item.values.brand) return `Brand: ${item.values.brand}`;
  if (item.values.size) return `Size: ${item.values.size}`;
  if (item.values.category) return `Category: ${item.values.category}`;
  return "";
}

function getItemPrice(item: any): number {
  return Number(item.values?.price) || 0;
}

function getItemStock(item: any): number {
  return Number(item.values?.quantity || item.values?.stock) || 0;
}

export default function DashboardOverview() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const collections = useAppSelector((s) => s.inventory.collections);
  const ledger = useAppSelector((s) => s.ledger.entries);
  const receipts = useAppSelector((s) => s.receipts.list);
  const userCurrency = useAppSelector((s) => s.settings.userCurrency);
  const organizationName = useAppSelector((s) => s.settings.organizationName);

  const {
    totalCollections,
    totalItems,
    totalInventoryValue,
    totalParties,
    totalDebit,
    totalCredit,
    netBalance,
    totalReceipts,
    totalReceiptsRevenue,
  } = useMemo(() => {
    const cols = collections || [];
    const led = ledger || [];
    const rcpts = receipts || [];

    let itemsCount = 0;
    let invValue = 0;
    cols.forEach((c) => {
      itemsCount += c.data.length;
      c.data.forEach((i) => {
        invValue += getItemPrice(i) * getItemStock(i);
      });
    });

    let deb = 0;
    let cred = 0;
    led.forEach((item) => {
      item.transactions.forEach((t) => {
        if (t.type === "DEBIT") deb += Number(t.amount) || 0;
        else if (t.type === "CREDIT") cred += Number(t.amount) || 0;
      });
    });

    let rcptRev = 0;
    rcpts.forEach((r) => {
      r.items.forEach((i) => {
        rcptRev += (Number(i.price) || 0) * (Number(i.quantity) || 1);
      });
    });

    return {
      totalCollections: cols.length,
      totalItems: itemsCount,
      totalInventoryValue: invValue,
      totalParties: led.length,
      totalDebit: deb,
      totalCredit: cred,
      netBalance: deb - cred,
      totalReceipts: rcpts.length,
      totalReceiptsRevenue: rcptRev,
    };
  }, [collections, ledger, receipts]);

  const searchResults = useMemo(() => {
    const raw = searchQuery.trim();
    const query = raw.toLowerCase();
    if (!query) return { items: [], parties: [], txns: [], receipts: [], collections: [] };

    // Support path-like queries: "electronics > ipad" or "electronics/ipad"
    const pathParts = query
      .split(/[>/|]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    const tokens = pathParts.length > 1 ? pathParts : query.split(/\s+/).filter(Boolean);

    const textMatch = (haystack: string) => {
      const h = haystack.toLowerCase();
      if (h.includes(query)) return true;
      return tokens.every((t) => h.includes(t));
    };

    const matchedCollections: Array<{
      id: string;
      name: string;
      itemCount: number;
      description?: string;
    }> = [];

    collections.forEach((c) => {
      const bag = `${c.name} ${c.description || ""}`;
      if (textMatch(bag)) {
        matchedCollections.push({
          id: c.id,
          name: c.name,
          itemCount: c.data.length,
          description: c.description,
        });
      }
    });

    const matchedItems: Array<{
      collection: any;
      item: any;
      title: string;
      subtitle: string;
      path: string;
      price: number;
      stock: number;
    }> = [];

    collections.forEach((c) => {
      c.data.forEach((item) => {
        const title = getItemTitle(item, c);
        const subtitle = getItemSubtitle(item, c);
        const values = Object.values(item.values || {}).map(String).join(" ");
        const bag = `${c.name} ${title} ${subtitle} ${values} ${item.id}`;
        // Path-aware: if "electronics > ipad", require collection + item tokens
        const collectionOk =
          pathParts.length <= 1 || textMatch(`${c.name} ${c.description || ""}`) || tokens.some((t) => c.name.toLowerCase().includes(t));
        if (collectionOk && textMatch(bag)) {
          matchedItems.push({
            collection: c,
            item,
            title,
            subtitle,
            path: `${c.name} › ${title}`,
            price: getItemPrice(item),
            stock: getItemStock(item),
          });
        }
      });
    });

    // Rank: exact title start > includes query > rest
    matchedItems.sort((a, b) => {
      const at = a.title.toLowerCase();
      const bt = b.title.toLowerCase();
      const aExact = at === query || at.startsWith(query) ? 0 : at.includes(query) ? 1 : 2;
      const bExact = bt === query || bt.startsWith(query) ? 0 : bt.includes(query) ? 1 : 2;
      return aExact - bExact;
    });

    const matchedParties: Array<{
      id: string;
      name: string;
      phone?: string;
      email?: string;
    }> = [];
    const matchedTxns: Array<{
      organizationId: string;
      transactionId: string;
      partyName: string;
      type: string;
      amount: number;
      remark: string;
      date: string;
    }> = [];

    ledger.forEach((entry) => {
      const org = entry.organization;
      const partyBag = `${org.name} ${org.phone || ""} ${org.email || ""} ${org.id}`;
      if (textMatch(partyBag)) {
        matchedParties.push({
          id: org.id,
          name: org.name,
          phone: org.phone,
          email: org.email,
        });
      }
      entry.transactions.forEach((t) => {
        const txnBag = `${t.remark || ""} ${(t.tags || []).join(" ")} ${t.amount} ${t.type} ${org.name}`;
        if (textMatch(txnBag)) {
          matchedTxns.push({
            organizationId: org.id,
            transactionId: t.id,
            partyName: org.name,
            type: t.type,
            amount: Number(t.amount) || 0,
            remark: t.remark || "",
            date: t.date,
          });
        }
      });
    });

    const matchedReceipts = receipts
      .filter((r) => {
        const bag = `${r.customerName} ${r.phone || ""} ${r.id} ${r.description || ""} ${r.items.map((i) => i.name).join(" ")}`;
        return textMatch(bag);
      })
      .map((r) => r);

    return {
      items: matchedItems,
      parties: matchedParties,
      txns: matchedTxns,
      receipts: matchedReceipts,
      collections: matchedCollections,
    };
  }, [searchQuery, collections, ledger, receipts]);

  const hasSearchResults =
    searchResults.items.length > 0 ||
    searchResults.parties.length > 0 ||
    searchResults.txns.length > 0 ||
    searchResults.receipts.length > 0 ||
    searchResults.collections.length > 0;

  const matchCount =
    searchResults.items.length +
    searchResults.parties.length +
    searchResults.txns.length +
    searchResults.receipts.length +
    searchResults.collections.length;

  const goInventory = useCallback(
    (collectionId: string, itemId?: string, itemQuery?: string) => {
      navigate("/app/inventory", {
        state: inventoryNav(collectionId, itemId, itemQuery),
      });
    },
    [navigate],
  );

  const goLedger = useCallback(
    (organizationId: string, transactionId?: string, partyQuery?: string) => {
      navigate("/app/ledger", {
        state: ledgerNav(organizationId, transactionId, partyQuery),
      });
    },
    [navigate],
  );

  const goReceipt = useCallback(
    (receiptId: string, receiptQuery?: string) => {
      navigate("/app/receipts", {
        state: receiptsNav(receiptId, receiptQuery),
      });
    },
    [navigate],
  );

  const renderSearchHit = (
    key: string,
    onClick: () => void,
    title: string,
    subtitle: string,
    trailing?: React.ReactNode,
  ) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      className="w-full cursor-pointer rounded-lg border border-sidebar-border bg-background p-2 text-left transition-colors hover:bg-muted/50 xl:p-2.5"
    >
      <div className="flex min-w-0 items-center justify-between gap-1.5">
        <span className="truncate text-xs font-semibold text-foreground xl:text-sm">
          {title}
        </span>
        {trailing}
      </div>
      {subtitle ? (
        <div className="mt-0.5 truncate text-[10px] text-muted-foreground xl:text-xs">
          {subtitle}
        </div>
      ) : null}
    </button>
  );

  const sectionHeader = (
    icon: React.ReactNode,
    label: string,
    count: number,
    viewAll: () => void,
  ) => (
    <div className="flex items-center justify-between gap-1">
      <span className="flex min-w-0 items-center gap-1 text-[10px] font-bold text-foreground xl:gap-1.5 xl:text-xs">
        {icon}
        <span className="truncate">
          {label} ({count})
        </span>
      </span>
      <button
        type="button"
        onClick={viewAll}
        className="shrink-0 cursor-pointer text-[9px] font-semibold text-muted-foreground hover:text-foreground xl:text-[10px]"
      >
        View all
      </button>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-1.5 overflow-hidden bg-background p-1.5 text-foreground xl:flex-row xl:gap-2 xl:p-2">
      {/* Search pane — full width on lg, side column from xl */}
      <aside className="flex max-h-[38vh] min-h-0 w-full shrink-0 flex-col gap-2.5 overflow-hidden rounded-lg border border-sidebar-border bg-sidebar p-2.5 shadow-sm xl:max-h-none xl:h-full xl:w-[min(20rem,28%)] xl:gap-3 xl:p-3 2xl:w-80 2xl:gap-4 2xl:p-4">
        <div className="relative shrink-0">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground xl:size-4" />
          <Input
            placeholder="Search inventories, parties, receipts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 rounded-lg border-sidebar-border bg-background pl-8 pr-16 text-xs font-medium shadow-xs focus-visible:ring-1 xl:h-10 xl:pl-9 xl:text-sm 2xl:h-11 2xl:text-base"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] font-bold text-muted-foreground hover:text-foreground xl:text-[10px]"
            >
              CLEAR
            </button>
          ) : null}
        </div>

        <ScrollArea className="min-h-0 flex-1">
          {searchQuery.trim() ? (
            <div className="flex flex-col gap-2.5 pr-2 pb-3 xl:gap-3">
              <div className="flex items-center justify-between border-b border-sidebar-border pb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground xl:text-[11px]">
                  Results
                </span>
                <span className="font-mono text-[9px] text-muted-foreground xl:text-[10px]">
                  {matchCount} matches
                </span>
              </div>

              {!hasSearchResults ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-sidebar-border py-8 text-muted-foreground">
                  <Search className="size-7 stroke-1 opacity-40 xl:size-9" />
                  <p className="text-xs font-semibold">No results found</p>
                  <p className="text-[10px] xl:text-xs">Try different keywords.</p>
                </div>
              ) : null}

              {searchResults.collections.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {sectionHeader(
                    <Layers className="size-3 shrink-0 xl:size-3.5" />,
                    "Collections",
                    searchResults.collections.length,
                    () => navigate("/app/inventory"),
                  )}
                  {searchResults.collections.slice(0, 4).map((c) =>
                    renderSearchHit(
                      `col-${c.id}`,
                      () => goInventory(c.id),
                      c.name,
                      c.description || `${c.itemCount} items · Inventory › ${c.name}`,
                      <Badge
                        variant="outline"
                        className="shrink-0 border-sidebar-border bg-sidebar text-[8px] xl:text-[9px]"
                      >
                        Catalog
                      </Badge>,
                    ),
                  )}
                </div>
              ) : null}

              {searchResults.items.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {sectionHeader(
                    <Box className="size-3 shrink-0 xl:size-3.5" />,
                    "Items",
                    searchResults.items.length,
                    () => {
                      const first = searchResults.items[0];
                      if (first) goInventory(first.collection.id, first.item.id);
                      else navigate("/app/inventory");
                    },
                  )}
                  {searchResults.items.slice(0, 6).map((hit) =>
                    renderSearchHit(
                      `item-${hit.item.id}`,
                      () =>
                        goInventory(
                          hit.collection.id,
                          hit.item.id,
                          hit.title,
                        ),
                      hit.title,
                      `${hit.path}${hit.subtitle ? ` · ${hit.subtitle}` : ""} · ₹${hit.price.toLocaleString("en-IN")} (${hit.stock})`,
                      <Badge
                        variant="outline"
                        className="ml-1 shrink-0 border-sidebar-border bg-sidebar font-mono text-[8px] xl:text-[9px]"
                      >
                        {hit.collection.name}
                      </Badge>,
                    ),
                  )}
                </div>
              ) : null}

              {searchResults.parties.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {sectionHeader(
                    <Building2 className="size-3 shrink-0 xl:size-3.5" />,
                    "Parties",
                    searchResults.parties.length,
                    () => {
                      const first = searchResults.parties[0];
                      if (first) goLedger(first.id);
                      else navigate("/app/ledger");
                    },
                  )}
                  {searchResults.parties.slice(0, 5).map((party) =>
                    renderSearchHit(
                      `party-${party.id}`,
                      () => goLedger(party.id, undefined, party.name),
                      party.name,
                      `Ledger › ${party.name}${party.phone ? ` · ${party.phone}` : party.email ? ` · ${party.email}` : ""}`,
                      <Badge
                        variant="outline"
                        className="shrink-0 border-sidebar-border bg-sidebar text-[8px] xl:text-[9px]"
                      >
                        Party
                      </Badge>,
                    ),
                  )}
                </div>
              ) : null}

              {searchResults.txns.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {sectionHeader(
                    <FileText className="size-3 shrink-0 xl:size-3.5" />,
                    "Transactions",
                    searchResults.txns.length,
                    () => {
                      const first = searchResults.txns[0];
                      if (first)
                        goLedger(first.organizationId, first.transactionId);
                      else navigate("/app/ledger");
                    },
                  )}
                  {searchResults.txns.slice(0, 5).map((t) =>
                    renderSearchHit(
                      `txn-${t.transactionId}`,
                      () =>
                        goLedger(
                          t.organizationId,
                          t.transactionId,
                          t.partyName,
                        ),
                      t.remark || "No remark",
                      `Ledger › ${t.partyName} · ${new Date(t.date).toLocaleDateString("en-IN")}`,
                      <Badge
                        variant="outline"
                        className="shrink-0 border-sidebar-border bg-sidebar font-mono text-[9px] font-bold xl:text-[10px]"
                      >
                        {t.type === "DEBIT" ? "-" : "+"} ₹
                        {t.amount.toLocaleString("en-IN")}
                      </Badge>,
                    ),
                  )}
                </div>
              ) : null}

              {searchResults.receipts.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {sectionHeader(
                    <ReceiptText className="size-3 shrink-0 xl:size-3.5" />,
                    "Receipts",
                    searchResults.receipts.length,
                    () => {
                      const first = searchResults.receipts[0];
                      if (first) goReceipt(first.id);
                      else navigate("/app/receipts");
                    },
                  )}
                  {searchResults.receipts.slice(0, 5).map((r) =>
                    renderSearchHit(
                      `rcpt-${r.id}`,
                      () => goReceipt(r.id, r.customerName),
                      r.customerName,
                      `Receipts › ${r.customerName}${r.description ? ` · ${r.description}` : ` · ${r.items.length} items`}`,
                      <Badge
                        variant="outline"
                        className="shrink-0 border-sidebar-border bg-sidebar font-mono text-[8px] xl:text-[9px]"
                      >
                        #{r.id.slice(0, 8)}
                      </Badge>,
                    ),
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 px-2 py-6 text-muted-foreground xl:min-h-[220px] xl:gap-3">
              <div className="flex size-9 items-center justify-center rounded-full border-2 border-sidebar-border xl:size-12">
                <Search className="size-4 stroke-1 xl:size-5" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-foreground xl:text-sm">
                  Universal Search
                </p>
                <p className="mt-0.5 text-[10px] xl:text-xs">
                  Try &quot;Electronics &gt; iPad&quot; or a party name — click to open.
                </p>
              </div>
            </div>
          )}
        </ScrollArea>
      </aside>

      {/* Main command center */}
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-sidebar-border bg-background shadow-xs">
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 xl:gap-5 xl:p-5 2xl:p-6">
          {/* Header */}
          <header className="flex shrink-0 flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 xl:gap-2">
                <Sparkles className="size-3.5 shrink-0 text-foreground xl:size-5" />
                <h2 className="truncate text-sm font-extrabold tracking-tight text-foreground xl:text-lg 2xl:text-xl">
                  Mudir Store Intelligence
                </h2>
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground xl:text-xs">
                Overview of inventory, ledger & invoices
              </p>
            </div>
            <Badge
              variant="outline"
              className="shrink-0 gap-1 border-sidebar-border bg-sidebar px-2 py-0.5 font-mono text-[9px] xl:gap-1.5 xl:px-2.5 xl:text-[10px] 2xl:text-[11px]"
            >
              <Cpu className="size-3 animate-pulse text-emerald-600" />
              Live Local Store
            </Badge>
          </header>

          <ScrollArea className="min-h-0 flex-1">
            <div className="grid grid-cols-1 gap-2.5 pb-4 pr-1 md:grid-cols-2 xl:gap-4 2xl:gap-5">
              {/* Hero valuation */}
              <div className="relative flex flex-col gap-3 overflow-hidden rounded-xl border border-sidebar-border bg-gradient-to-br from-card via-card to-muted/40 p-3 shadow-xs md:col-span-2 xl:gap-5 xl:p-5 2xl:p-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground font-bold text-background xl:size-8">
                      <Wallet className="size-3.5 xl:size-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground xl:text-[10px] 2xl:text-[11px]">
                        Total Combined Store Valuation
                      </span>
                      <span className="block truncate font-mono text-xl font-black tracking-tight text-foreground xl:text-2xl 2xl:text-3xl">
                        ₹
                        {(
                          totalInventoryValue + totalReceiptsRevenue
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="w-fit shrink-0 border-sidebar-border bg-background px-2 py-0.5 font-mono text-[9px] xl:text-[10px] 2xl:text-xs"
                  >
                    {userCurrency || "INR (₹)"}
                  </Badge>
                </div>

                <Separator className="bg-sidebar-border/80" />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:gap-3 2xl:gap-4">
                  <button
                    type="button"
                    onClick={() => navigate("/app/inventory")}
                    className="group/item flex cursor-pointer flex-col gap-1 rounded-lg border border-sidebar-border/60 bg-background/80 p-2.5 text-left transition-all hover:border-foreground/30 hover:bg-muted/40 xl:gap-1.5 xl:p-3.5"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="flex min-w-0 items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground xl:gap-1.5 xl:text-[10px] 2xl:text-xs">
                        <Box className="size-3 shrink-0 xl:size-3.5" />
                        <span className="truncate">Inventory Value</span>
                      </span>
                      <ArrowUpRight className="size-3 shrink-0 text-muted-foreground transition-colors group-hover/item:text-foreground xl:size-3.5" />
                    </div>
                    <span className="truncate font-mono text-base font-extrabold text-foreground xl:text-lg 2xl:text-xl">
                      ₹{totalInventoryValue.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-muted-foreground xl:text-[11px]">
                      {totalItems} items · {totalCollections} catalogs
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/app/receipts")}
                    className="group/item flex cursor-pointer flex-col gap-1 rounded-lg border border-sidebar-border/60 bg-background/80 p-2.5 text-left transition-all hover:border-foreground/30 hover:bg-muted/40 xl:gap-1.5 xl:p-3.5"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="flex min-w-0 items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground xl:gap-1.5 xl:text-[10px] 2xl:text-xs">
                        <ReceiptText className="size-3 shrink-0 xl:size-3.5" />
                        <span className="truncate">Billed Revenue</span>
                      </span>
                      <ArrowUpRight className="size-3 shrink-0 text-muted-foreground transition-colors group-hover/item:text-foreground xl:size-3.5" />
                    </div>
                    <span className="truncate font-mono text-base font-extrabold text-foreground xl:text-lg 2xl:text-xl">
                      ₹{totalReceiptsRevenue.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-muted-foreground xl:text-[11px]">
                      {totalReceipts} settled invoices
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/app/ledger")}
                    className="group/item flex cursor-pointer flex-col gap-1 rounded-lg border border-sidebar-border/60 bg-background/80 p-2.5 text-left transition-all hover:border-foreground/30 hover:bg-muted/40 xl:gap-1.5 xl:p-3.5"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="flex min-w-0 items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground xl:gap-1.5 xl:text-[10px] 2xl:text-xs">
                        <Building2 className="size-3 shrink-0 xl:size-3.5" />
                        <span className="truncate">Net Ledger</span>
                      </span>
                      <ArrowUpRight className="size-3 shrink-0 text-muted-foreground transition-colors group-hover/item:text-foreground xl:size-3.5" />
                    </div>
                    <div className="flex min-w-0 flex-wrap items-baseline gap-1.5">
                      <span className="truncate font-mono text-base font-extrabold text-foreground xl:text-lg 2xl:text-xl">
                        ₹{Math.abs(netBalance).toLocaleString("en-IN")}
                      </span>
                      <Badge
                        variant="outline"
                        className="border-sidebar-border bg-sidebar px-1.5 py-0 text-[9px] xl:text-[10px]"
                      >
                        {netBalance > 0
                          ? "You Give"
                          : netBalance < 0
                            ? "You Get"
                            : "Settled"}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground xl:text-[11px]">
                      {totalParties} parties
                    </span>
                  </button>
                </div>
              </div>

              {/* Catalog & Stock */}
              <button
                type="button"
                onClick={() => navigate("/app/inventory")}
                className="group flex min-w-0 cursor-pointer flex-col justify-between rounded-xl border border-sidebar-border bg-card p-3 text-left transition-all hover:border-foreground/30 hover:shadow-sm xl:p-4 2xl:p-5"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2 xl:mb-3">
                    <span className="flex min-w-0 items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground xl:gap-1.5 xl:text-[11px]">
                      <Box className="size-3.5 shrink-0 text-foreground xl:size-4" />
                      <span className="truncate">Catalog & Stock</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-semibold text-muted-foreground transition-colors group-hover:text-foreground xl:text-xs">
                      Manage <ArrowRight className="size-3" />
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
                    <span className="font-mono text-2xl font-black tracking-tight text-foreground xl:text-3xl">
                      {totalItems}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground xl:text-xs">
                      total SKU items
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-sidebar-border pt-2.5 text-[10px] text-muted-foreground xl:mt-5 xl:pt-3 xl:text-xs">
                  <span>Active Catalogs</span>
                  <span className="font-mono font-bold text-foreground">
                    {totalCollections} Collections
                  </span>
                </div>
              </button>

              {/* Parties */}
              <button
                type="button"
                onClick={() => navigate("/app/ledger")}
                className="group flex min-w-0 cursor-pointer flex-col justify-between rounded-xl border border-sidebar-border bg-card p-3 text-left transition-all hover:border-foreground/30 hover:shadow-sm xl:p-4 2xl:p-5"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2 xl:mb-3">
                    <span className="flex min-w-0 items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground xl:gap-1.5 xl:text-[11px]">
                      <Building2 className="size-3.5 shrink-0 text-foreground xl:size-4" />
                      <span className="truncate">Parties & Accounts</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-semibold text-muted-foreground transition-colors group-hover:text-foreground xl:text-xs">
                      Ledger <ArrowRight className="size-3" />
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
                    <span className="font-mono text-2xl font-black tracking-tight text-foreground xl:text-3xl">
                      {totalParties}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground xl:text-xs">
                      registered parties
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-sidebar-border pt-2.5 text-[10px] text-muted-foreground xl:mt-5 xl:pt-3 xl:text-xs">
                  <span>Ledger Status</span>
                  <span className="font-mono font-bold text-foreground">
                    Active Records
                  </span>
                </div>
              </button>

              {/* Cashflow */}
              <div className="flex min-w-0 flex-col justify-between rounded-xl border border-sidebar-border bg-card p-3 xl:p-4 2xl:p-5">
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 xl:mb-3">
                    <span className="flex min-w-0 items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground xl:gap-1.5 xl:text-[11px]">
                      <BarChart3 className="size-3.5 shrink-0 text-foreground xl:size-4" />
                      <span className="truncate">Cashflow Breakdown</span>
                    </span>
                    <Badge
                      variant="outline"
                      className="shrink-0 border-sidebar-border bg-sidebar font-mono text-[9px] xl:text-[10px]"
                    >
                      Ledger Ratio
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-col gap-2 font-mono text-[10px] xl:text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-muted-foreground">
                        Debit (Given Out)
                      </span>
                      <span className="shrink-0 font-bold text-foreground">
                        ₹{totalDebit.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-muted-foreground">
                        Credit (Received)
                      </span>
                      <span className="shrink-0 font-bold text-foreground">
                        ₹{totalCredit.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-1 border-t border-sidebar-border pt-2.5 text-[10px] xl:mt-5 xl:pt-3 xl:text-xs">
                  <span className="text-muted-foreground">Net Position</span>
                  <span className="font-mono font-bold text-foreground">
                    {netBalance > 0
                      ? "Payable"
                      : netBalance < 0
                        ? "Receivable"
                        : "Settled"}
                  </span>
                </div>
              </div>

              {/* Receipts */}
              <button
                type="button"
                onClick={() => navigate("/app/receipts")}
                className="group flex min-w-0 cursor-pointer flex-col justify-between rounded-xl border border-sidebar-border bg-card p-3 text-left transition-all hover:border-foreground/30 hover:shadow-sm xl:p-4 2xl:p-5"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2 xl:mb-3">
                    <span className="flex min-w-0 items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground xl:gap-1.5 xl:text-[11px]">
                      <ReceiptText className="size-3.5 shrink-0 text-foreground xl:size-4" />
                      <span className="truncate">Settled Receipts</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-semibold text-muted-foreground transition-colors group-hover:text-foreground xl:text-xs">
                      Invoices <ArrowRight className="size-3" />
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
                    <span className="font-mono text-2xl font-black tracking-tight text-foreground xl:text-3xl">
                      {totalReceipts}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground xl:text-xs">
                      issued invoices
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-sidebar-border pt-2.5 text-[10px] text-muted-foreground xl:mt-5 xl:pt-3 xl:text-xs">
                  <span>Gross Invoice Total</span>
                  <span className="font-mono font-bold text-foreground">
                    ₹{totalReceiptsRevenue.toLocaleString("en-IN")}
                  </span>
                </div>
              </button>

              {/* System strip */}
              <div className="flex flex-col justify-between gap-3 rounded-xl border border-sidebar-border bg-sidebar/50 p-3 md:col-span-2 md:flex-row md:items-center xl:gap-4 xl:p-4 2xl:p-5">
                <div className="flex min-w-0 items-center gap-2.5 xl:gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-sm font-black text-background xl:size-9">
                    M
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate text-xs font-bold text-foreground xl:text-sm">
                      {organizationName || "Mudir Enterprise Store"}
                    </span>
                    <span className="block truncate text-[10px] text-muted-foreground xl:text-xs">
                      System Status: Operating & Healthy
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-4 font-mono text-[10px] text-muted-foreground xl:gap-6 xl:text-xs">
                  <div className="flex flex-col md:items-end">
                    <span>Currency</span>
                    <span className="font-bold text-foreground">
                      {userCurrency || "INR (₹)"}
                    </span>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <span>Mode</span>
                    <span className="font-bold text-foreground">Local</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </section>
    </div>
  );
}
