import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAppData } from "@/lib/use-app-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Box,
  Building2,
  ReceiptText,
  TrendingUp,
  DollarSign,
  Layers,
  FileText,
  ArrowRight,
  Info,
  Cpu,
  Sparkles,
  Plus,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  BarChart3,
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

  const { data } = useAppData();

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
    const cols = data.collections || [];
    const led = data.ledger || [];
    const rcpts = data.receipts || [];

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
  }, []);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return { items: [], parties: [], txns: [], receipts: [] };

    const matchedItems: Array<{
      collection: any;
      item: any;
      title: string;
      subtitle: string;
      price: number;
      stock: number;
    }> = [];

    data.collections.forEach((c) => {
      c.data.forEach((item) => {
        const values = Object.values(item.values).map(String);
        const matches = values.some((v) => v.toLowerCase().includes(query));
        if (matches) {
          matchedItems.push({
            collection: c,
            item,
            title: getItemTitle(item, c),
            subtitle: getItemSubtitle(item, c),
            price: getItemPrice(item),
            stock: getItemStock(item),
          });
        }
      });
    });

    const matchedParties: Array<{ id: string; name: string; phone?: string; email?: string }> = [];
    const matchedTxns: Array<{ partyName: string; type: string; amount: number; remark: string; date: string }> = [];
    data.ledger.forEach((entry) => {
      const org = entry.organization;
      if (
        org.name.toLowerCase().includes(query) ||
        (org.phone && org.phone.toLowerCase().includes(query)) ||
        (org.email && org.email.toLowerCase().includes(query))
      ) {
        matchedParties.push({ id: org.id, name: org.name, phone: org.phone, email: org.email });
      }
      entry.transactions.forEach((t) => {
        if (
          (t.remark && t.remark.toLowerCase().includes(query)) ||
          (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(query)))
        ) {
          matchedTxns.push({
            partyName: org.name,
            type: t.type,
            amount: Number(t.amount) || 0,
            remark: t.remark || "",
            date: t.date,
          });
        }
      });
    });

    const matchedReceipts = data.receipts.filter((r) => {
      return (
        r.customerName.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query) ||
        (r.description && r.description.toLowerCase().includes(query)) ||
        r.items.some((i) => i.name.toLowerCase().includes(query))
      );
    });

    return {
      items: matchedItems,
      parties: matchedParties,
      txns: matchedTxns,
      receipts: matchedReceipts,
    };
  }, [searchQuery]);

  const hasSearchResults =
    searchResults.items.length > 0 ||
    searchResults.parties.length > 0 ||
    searchResults.txns.length > 0 ||
    searchResults.receipts.length > 0;

  return (
    <div className="flex h-screen w-full gap-2 p-2 overflow-hidden bg-background text-foreground">
      {/* Left Pane: Search + Results */}
      <div className="w-[420px] h-full flex flex-col gap-4 border border-sidebar-border rounded-lg bg-sidebar p-4 shadow-sm shrink-0 overflow-hidden">
        <div className="relative shrink-0">
          <Search className="absolute left-3.5 top-3.5 size-5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search across inventories, parties, ledger entries, receipts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 text-base font-medium bg-background border-sidebar-border rounded-lg shadow-xs focus-visible:ring-1"
          />
          {searchQuery && (
            <span
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-3.5 text-xs font-bold font-mono px-2 py-1 bg-muted rounded cursor-pointer text-muted-foreground hover:text-foreground"
            >
              CLEAR
            </span>
          )}
        </div>

        <ScrollArea className="flex-1 -mx-2 px-2">
          {searchQuery.trim() ? (
            <div className="flex flex-col gap-3 pr-3 pb-4">
              <div className="flex items-center justify-between border-b border-sidebar-border pb-2">
                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Results
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {searchResults.items.length + searchResults.parties.length + searchResults.txns.length + searchResults.receipts.length} matches
                </span>
              </div>

              {!hasSearchResults && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground border border-sidebar-border border-dashed rounded-lg">
                  <Search className="size-10 stroke-1 opacity-40" />
                  <p className="font-semibold text-sm">No results found</p>
                  <p className="text-xs">Try different keywords.</p>
                </div>
              )}

              {searchResults.items.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Box className="size-3.5" /> Items ({searchResults.items.length})
                    </span>
                    <span
                      onClick={() => navigate("/app/inventory")}
                      className="text-[10px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      View all
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {searchResults.items.slice(0, 5).map((hit, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate("/app/inventory")}
                        className="p-2.5 rounded-lg border border-sidebar-border bg-background hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-foreground truncate">{hit.title}</span>
                          <Badge variant="outline" className="text-[9px] font-mono border-sidebar-border bg-sidebar ml-1 shrink-0">{hit.collection.name}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-0.5">
                          <span>{hit.subtitle}</span>
                          <span className="font-mono font-semibold text-foreground">₹{hit.price.toLocaleString("en-IN")} ({hit.stock})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.parties.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Building2 className="size-3.5" /> Parties ({searchResults.parties.length})
                    </span>
                    <span
                      onClick={() => navigate("/app/ledger")}
                      className="text-[10px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      View all
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {searchResults.parties.slice(0, 5).map((party, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate("/app/ledger")}
                        className="p-2.5 rounded-lg border border-sidebar-border bg-background hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-foreground">{party.name}</span>
                          <Badge variant="outline" className="text-[9px] border-sidebar-border bg-sidebar">Party</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{party.phone || party.email || "No contact info"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.txns.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <FileText className="size-3.5" /> Transactions ({searchResults.txns.length})
                    </span>
                    <span
                      onClick={() => navigate("/app/ledger")}
                      className="text-[10px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      View all
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {searchResults.txns.slice(0, 4).map((t, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate("/app/ledger")}
                        className="p-2.5 rounded-lg border border-sidebar-border bg-background hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm text-foreground truncate">{t.remark || "No remark"}</span>
                          <Badge variant="outline" className="font-mono font-bold text-[10px] shrink-0 border-sidebar-border bg-sidebar">
                            {t.type === "DEBIT" ? "-" : "+"} ₹{t.amount.toLocaleString("en-IN")}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{t.partyName} • {new Date(t.date).toLocaleDateString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.receipts.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <ReceiptText className="size-3.5" /> Receipts ({searchResults.receipts.length})
                    </span>
                    <span
                      onClick={() => navigate("/app/receipts")}
                      className="text-[10px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      View all
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {searchResults.receipts.slice(0, 5).map((r, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate("/app/receipts")}
                        className="p-2.5 rounded-lg border border-sidebar-border bg-background hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-foreground truncate">{r.customerName}</span>
                          <Badge variant="outline" className="text-[9px] font-mono border-sidebar-border bg-sidebar">#{r.id}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground truncate">{r.description || `${r.items.length} items`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 text-muted-foreground px-2">
              <div className="size-12 rounded-full border-2 border-sidebar-border flex items-center justify-center">
                <Search className="size-5 stroke-1" />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm text-foreground">Universal Search</p>
                <p className="text-xs mt-0.5">Search across everything instantly.</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Pane: Premium Command Center Bento Grid */}
      <div className="flex-1 h-full border border-sidebar-border rounded-lg bg-background shadow-xs overflow-hidden min-w-0">
        <div className="flex flex-col h-full p-6 gap-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="size-5 text-foreground" />
                <h2 className="font-extrabold text-xl tracking-tight text-foreground">
                  Mudir Store Intelligence
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time agentic oversight across inventory, ledger settlements & invoices.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="font-mono text-[11px] border-sidebar-border bg-sidebar gap-1.5 px-3 py-1"
              >
                <Cpu className="size-3.5 text-emerald-600 animate-pulse" /> Live Local Store
              </Badge>
            </div>
          </div>

          {/* Bento Grid Content */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pr-1 pb-6">
              {/* Hero Bento Card: Total Store & Cashflow Valuation */}
              <div className="sm:col-span-2 p-6 rounded-xl border border-sidebar-border bg-gradient-to-br from-card via-card to-muted/40 shadow-xs flex flex-col gap-6 relative overflow-hidden group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold">
                      <Wallet className="size-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground block">
                        Total Combined Store Valuation
                      </span>
                      <span className="text-3xl font-black font-mono tracking-tight text-foreground">
                        ₹{(totalInventoryValue + totalReceiptsRevenue).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <Badge variant="outline" className="w-fit font-mono text-xs border-sidebar-border bg-background px-2.5 py-1">
                    Currency: {data.meta?.userCurrency || "INR (₹)"}
                  </Badge>
                </div>

                <Separator className="bg-sidebar-border/80" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div
                    onClick={() => navigate("/app/inventory")}
                    className="flex flex-col gap-1.5 p-3.5 rounded-lg border border-sidebar-border/60 bg-background/80 hover:border-foreground/30 hover:bg-muted/40 transition-all cursor-pointer group/item"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Box className="size-3.5" /> Inventory Value
                      </span>
                      <ArrowUpRight className="size-3.5 text-muted-foreground group-hover/item:text-foreground transition-colors" />
                    </div>
                    <span className="font-mono font-extrabold text-xl text-foreground">
                      ₹{totalInventoryValue.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {totalItems} items across {totalCollections} catalogs
                    </span>
                  </div>

                  <div
                    onClick={() => navigate("/app/receipts")}
                    className="flex flex-col gap-1.5 p-3.5 rounded-lg border border-sidebar-border/60 bg-background/80 hover:border-foreground/30 hover:bg-muted/40 transition-all cursor-pointer group/item"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <ReceiptText className="size-3.5" /> Billed Revenue
                      </span>
                      <ArrowUpRight className="size-3.5 text-muted-foreground group-hover/item:text-foreground transition-colors" />
                    </div>
                    <span className="font-mono font-extrabold text-xl text-foreground">
                      ₹{totalReceiptsRevenue.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {totalReceipts} settled invoices archived
                    </span>
                  </div>

                  <div
                    onClick={() => navigate("/app/ledger")}
                    className="flex flex-col gap-1.5 p-3.5 rounded-lg border border-sidebar-border/60 bg-background/80 hover:border-foreground/30 hover:bg-muted/40 transition-all cursor-pointer group/item"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="size-3.5" /> Net Ledger Balance
                      </span>
                      <ArrowUpRight className="size-3.5 text-muted-foreground group-hover/item:text-foreground transition-colors" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono font-extrabold text-xl text-foreground">
                        ₹{Math.abs(netBalance).toLocaleString("en-IN")}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-sidebar-border bg-sidebar"
                      >
                        {netBalance > 0 ? "You Give" : netBalance < 0 ? "You Get" : "Settled"}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Across {totalParties} registered parties
                    </span>
                  </div>
                </div>
              </div>

              {/* Bento Card 1: Inventory Management */}
              <div
                onClick={() => navigate("/app/inventory")}
                className="group flex flex-col justify-between p-5 rounded-xl border border-sidebar-border bg-card hover:border-foreground/30 hover:shadow-sm transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Box className="size-4 text-foreground" /> Catalog & Stock
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground flex items-center gap-1 transition-colors">
                      Manage <ArrowRight className="size-3" />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-mono font-black tracking-tight text-foreground">
                      {totalItems}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      total SKU items
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-sidebar-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>Active Catalogs</span>
                  <span className="font-mono font-bold text-foreground">
                    {totalCollections} Collections
                  </span>
                </div>
              </div>

              {/* Bento Card 2: Party Ledger & Books */}
              <div
                onClick={() => navigate("/app/ledger")}
                className="group flex flex-col justify-between p-5 rounded-xl border border-sidebar-border bg-card hover:border-foreground/30 hover:shadow-sm transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="size-4 text-foreground" /> Parties & Accounts
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground flex items-center gap-1 transition-colors">
                      Ledger <ArrowRight className="size-3" />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-mono font-black tracking-tight text-foreground">
                      {totalParties}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      registered parties
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-sidebar-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>Ledger Status</span>
                  <span className="font-mono font-bold text-foreground">
                    Active Ledger Records
                  </span>
                </div>
              </div>

              {/* Bento Card 3: Store Cash Flow Analysis */}
              <div className="flex flex-col justify-between p-5 rounded-xl border border-sidebar-border bg-card">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <BarChart3 className="size-4 text-foreground" /> Cashflow Breakdown
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono border-sidebar-border bg-sidebar">
                      Ledger Ratio
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-2 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Debit (Given Out)</span>
                      <span className="font-bold text-foreground">₹{totalDebit.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Credit (Received)</span>
                      <span className="font-bold text-foreground">₹{totalCredit.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-sidebar-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Net Ledger Position</span>
                  <span className="font-mono font-bold text-foreground">
                    {netBalance > 0 ? "Payable Balance" : netBalance < 0 ? "Receivable Balance" : "Fully Settled"}
                  </span>
                </div>
              </div>

              {/* Bento Card 4: Settled Receipt Archive */}
              <div
                onClick={() => navigate("/app/receipts")}
                className="group flex flex-col justify-between p-5 rounded-xl border border-sidebar-border bg-card hover:border-foreground/30 hover:shadow-sm transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ReceiptText className="size-4 text-foreground" /> Settled Receipts
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground flex items-center gap-1 transition-colors">
                      Invoices <ArrowRight className="size-3" />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-mono font-black tracking-tight text-foreground">
                      {totalReceipts}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      issued invoices
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-sidebar-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>Gross Invoice Total</span>
                  <span className="font-mono font-bold text-foreground">
                    ₹{totalReceiptsRevenue.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* System Info Strip */}
              <div className="sm:col-span-2 p-5 rounded-xl border border-sidebar-border bg-sidebar/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-foreground text-background flex items-center justify-center font-black">
                    M
                  </div>
                  <div>
                    <span className="font-bold text-sm text-foreground block">
                      {data.meta?.organizationName || "Mudir Enterprise Store"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Agentic Store Suite • System Status: Operating & Healthy
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-muted-foreground font-mono">
                  <div className="flex flex-col sm:items-end">
                    <span>Active Currency</span>
                    <span className="font-bold text-foreground">INR (₹)</span>
                  </div>
                  <div className="flex flex-col sm:items-end">
                    <span>Security & Mode</span>
                    <span className="font-bold text-foreground">Local Sandboxed</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
