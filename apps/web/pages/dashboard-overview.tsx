import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { seedData } from "@/lib/seed";
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
  TrendingDown,
  DollarSign,
  Package,
  Layers,
  FileText,
  ArrowRight,
  Info,
  Database,
  Calendar,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardOverview() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate high-level numbers
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
    const cols = seedData.collections || [];
    const led = seedData.ledger || [];
    const rcpts = seedData.receipts || [];

    let itemsCount = 0;
    let invValue = 0;
    cols.forEach((c) => {
      itemsCount += c.data.length;
      c.data.forEach((i) => {
        invValue += (Number(i.price) || 0) * (Number(i.quantity) || 0);
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

  // Universal search logic
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return { items: [], parties: [], txns: [], receipts: [] };

    // Search Inventory Items
    const matchedItems: Array<{ collectionName: string; name: string; sku: string; price: number; stock: number }> = [];
    seedData.collections.forEach((c) => {
      if (c.name.toLowerCase().includes(query) || (c.description && c.description.toLowerCase().includes(query))) {
        c.data.forEach((i) => {
          matchedItems.push({
            collectionName: c.name,
            name: i.name,
            sku: i.sku || "N/A",
            price: Number(i.price) || 0,
            stock: Number(i.quantity) || 0,
          });
        });
      } else {
        c.data.forEach((i) => {
          if (
            i.name.toLowerCase().includes(query) ||
            (i.sku && i.sku.toLowerCase().includes(query)) ||
            (i.category && i.category.toLowerCase().includes(query))
          ) {
            matchedItems.push({
              collectionName: c.name,
              name: i.name,
              sku: i.sku || "N/A",
              price: Number(i.price) || 0,
              stock: Number(i.quantity) || 0,
            });
          }
        });
      }
    });

    // Search Parties & Transactions
    const matchedParties: Array<{ id: string; name: string; phone?: string; email?: string }> = [];
    const matchedTxns: Array<{ partyName: string; type: string; amount: number; remark: string; date: string }> = [];
    seedData.ledger.forEach((item) => {
      const org = item.organization;
      if (
        org.name.toLowerCase().includes(query) ||
        (org.phone && org.phone.toLowerCase().includes(query)) ||
        (org.email && org.email.toLowerCase().includes(query))
      ) {
        matchedParties.push({ id: org.id, name: org.name, phone: org.phone, email: org.email });
      }
      item.transactions.forEach((t) => {
        if (
          t.remark.toLowerCase().includes(query) ||
          (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(query)))
        ) {
          matchedTxns.push({
            partyName: org.name,
            type: t.type,
            amount: Number(t.amount) || 0,
            remark: t.remark,
            date: t.date,
          });
        }
      });
    });

    // Search Receipts
    const matchedReceipts = seedData.receipts.filter((r) => {
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
    <div className="flex h-screen w-full flex-col gap-6 p-6 overflow-hidden bg-background text-foreground">
      {/* Universal Search Engine Header */}
      <div className="flex flex-col gap-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-md bg-foreground text-background flex items-center justify-center font-black">
              M
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                Universal Search & Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Search anything across catalogs, ledger accounts, and invoices instantly.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-xs border-sidebar-border bg-muted text-foreground self-start sm:self-center gap-1.5 px-2.5 py-1">
            <Cpu className="size-3" /> Universal Index Active
          </Badge>
        </div>

        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3.5 size-5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search across inventories, parties, ledger entries, SKUs, customer receipts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 text-base font-medium bg-sidebar border-sidebar-border rounded-lg shadow-xs focus-visible:ring-1"
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
      </div>

      {/* Main Content Area */}
      <ScrollArea className="flex-1 -mx-6 px-6 overflow-auto">
        {searchQuery.trim() ? (
          /* Universal Search Results View */
          <div className="flex flex-col gap-6 pb-8">
            <div className="flex items-center justify-between border-b border-sidebar-border pb-3">
              <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Search Results for "{searchQuery}"
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Found {searchResults.items.length + searchResults.parties.length + searchResults.txns.length + searchResults.receipts.length} total matches
              </span>
            </div>

            {!hasSearchResults && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground border border-sidebar-border border-dashed rounded-lg">
                <Search className="size-10 stroke-1 opacity-40" />
                <p className="font-semibold text-base">No results found across any module</p>
                <p className="text-xs">Try searching for item names, SKUs, party names, remarks, or receipt numbers.</p>
              </div>
            )}

            {/* Matching Inventory Items */}
            {searchResults.items.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                    <Box className="size-4" /> Matching Inventory Items ({searchResults.items.length})
                  </div>
                  <span
                    onClick={() => navigate("/app/inventory")}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                  >
                    Go to Inventory <ArrowRight className="size-3" />
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {searchResults.items.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate("/app/inventory")}
                      className="p-3.5 rounded-lg border border-sidebar-border bg-sidebar hover:bg-muted/50 cursor-pointer transition-colors flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground truncate">{item.name}</span>
                        <Badge variant="outline" className="text-[10px] font-mono border-sidebar-border bg-background">
                          SKU: {item.sku}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Catalog: {item.collectionName}</span>
                        <span className="font-mono font-bold text-foreground">₹{item.price.toLocaleString("en-IN")} ({item.stock} in stock)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Ledger Parties */}
            {searchResults.parties.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                    <Building2 className="size-4" /> Matching Parties ({searchResults.parties.length})
                  </div>
                  <span
                    onClick={() => navigate("/app/ledger")}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                  >
                    Go to Ledger <ArrowRight className="size-3" />
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {searchResults.parties.map((party, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate("/app/ledger")}
                      className="p-3.5 rounded-lg border border-sidebar-border bg-sidebar hover:bg-muted/50 cursor-pointer transition-colors flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">{party.name}</span>
                        <Badge variant="outline" className="text-[10px] border-sidebar-border bg-background">
                          Party
                        </Badge>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{party.phone || party.email || "No contact info"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Ledger Transactions */}
            {searchResults.txns.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                    <FileText className="size-4" /> Matching Ledger Transactions ({searchResults.txns.length})
                  </div>
                  <span
                    onClick={() => navigate("/app/ledger")}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                  >
                    Go to Ledger <ArrowRight className="size-3" />
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchResults.txns.map((t, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate("/app/ledger")}
                      className="p-3.5 rounded-lg border border-sidebar-border bg-sidebar hover:bg-muted/50 cursor-pointer transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-bold text-sm text-foreground truncate">{t.remark || "No remark"}</span>
                        <span className="text-xs text-muted-foreground">Party: {t.partyName} • {new Date(t.date).toLocaleDateString("en-IN")}</span>
                      </div>
                      <Badge variant="outline" className="font-mono font-bold text-xs shrink-0 border-sidebar-border bg-background">
                        {t.type === "DEBIT" ? "-" : "+"} ₹{t.amount.toLocaleString("en-IN")} ({t.type})
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Receipts */}
            {searchResults.receipts.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                    <ReceiptText className="size-4" /> Matching Receipts / Invoices ({searchResults.receipts.length})
                  </div>
                  <span
                    onClick={() => navigate("/app/receipts")}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                  >
                    Go to Receipts <ArrowRight className="size-3" />
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {searchResults.receipts.map((r, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate("/app/receipts")}
                      className="p-3.5 rounded-lg border border-sidebar-border bg-sidebar hover:bg-muted/50 cursor-pointer transition-colors flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground truncate">{r.customerName}</span>
                        <Badge variant="outline" className="text-[10px] font-mono border-sidebar-border bg-background">
                          #{r.id}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground truncate">{r.description || `${r.items.length} items included`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Normal Dashboard Numbers & Metadata View */
          <div className="flex flex-col gap-8 pb-10">
            {/* System Numbers & Key Metrics */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <TrendingUp className="size-4" /> Core System Numbers & Metrics
                </h2>
                <span className="text-xs text-muted-foreground font-mono">
                  Live Sync • Aggregated from local storage
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card
                  onClick={() => navigate("/app/inventory")}
                  className="rounded-lg border border-sidebar-border bg-sidebar hover:bg-muted/50 cursor-pointer transition-all shadow-xs"
                >
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-bold uppercase tracking-wider">Inventory Items</span>
                      <Box className="size-4" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-mono font-extrabold text-foreground">{totalItems}</span>
                      <span className="text-xs text-muted-foreground">{totalCollections} catalogs</span>
                    </div>
                    <Separator className="bg-sidebar-border" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Est. Total Value</span>
                      <span className="font-mono font-bold text-foreground">₹{totalInventoryValue.toLocaleString("en-IN")}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  onClick={() => navigate("/app/ledger")}
                  className="rounded-lg border border-sidebar-border bg-sidebar hover:bg-muted/50 cursor-pointer transition-all shadow-xs"
                >
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-bold uppercase tracking-wider">Ledger Accounts</span>
                      <Building2 className="size-4" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-mono font-extrabold text-foreground">{totalParties}</span>
                      <span className="text-xs text-muted-foreground">parties registered</span>
                    </div>
                    <Separator className="bg-sidebar-border" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Net Ledger Balance</span>
                      <span className="font-mono font-bold text-foreground">₹{Math.abs(netBalance).toLocaleString("en-IN")}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  onClick={() => navigate("/app/ledger")}
                  className="rounded-lg border border-sidebar-border bg-sidebar hover:bg-muted/50 cursor-pointer transition-all shadow-xs"
                >
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-bold uppercase tracking-wider">Cash Flow Breakdown</span>
                      <DollarSign className="size-4" />
                    </div>
                    <div className="flex flex-col gap-1 py-0.5 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Debit (Given):</span>
                        <span className="font-bold text-foreground">₹{totalDebit.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Credit (Rcvd):</span>
                        <span className="font-bold text-foreground">₹{totalCredit.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <Separator className="bg-sidebar-border" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-sidebar-border bg-background">
                        {netBalance > 0 ? "You Give" : netBalance < 0 ? "You Get" : "Settled"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  onClick={() => navigate("/app/receipts")}
                  className="rounded-lg border border-sidebar-border bg-sidebar hover:bg-muted/50 cursor-pointer transition-all shadow-xs"
                >
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-bold uppercase tracking-wider">Invoices & Receipts</span>
                      <ReceiptText className="size-4" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-mono font-extrabold text-foreground">{totalReceipts}</span>
                      <span className="text-xs text-muted-foreground">generated</span>
                    </div>
                    <Separator className="bg-sidebar-border" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Total Billed Revenue</span>
                      <span className="font-mono font-bold text-foreground">₹{totalReceiptsRevenue.toLocaleString("en-IN")}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* System Metadata Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Database className="size-4" /> Organization & System Metadata
                </h2>
                <span className="text-xs text-muted-foreground font-mono">
                  Engine: v1.0.0-agentic
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-sidebar-border bg-sidebar flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Info className="size-3.5" /> Organization Name
                  </span>
                  <span className="text-base font-extrabold text-foreground truncate">
                    {seedData.meta?.organizationName || "Mudir Store Suite"}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">ID: ORG_MUDIR_001</span>
                </div>

                <div className="p-4 rounded-lg border border-sidebar-border bg-sidebar flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <DollarSign className="size-3.5" /> Base Currency
                  </span>
                  <span className="text-base font-extrabold font-mono text-foreground">
                    {seedData.meta?.userCurrency || "INR (₹)"}
                  </span>
                  <span className="text-xs text-muted-foreground">Default billing & ledger currency</span>
                </div>

                <div className="p-4 rounded-lg border border-sidebar-border bg-sidebar flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="size-3.5" /> Export Timestamp
                  </span>
                  <span className="text-base font-bold font-mono text-foreground truncate">
                    {seedData.meta?.exportDate ? new Date(seedData.meta.exportDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Live Local Store"}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">Sync Status: Active</span>
                </div>

                <div className="p-4 rounded-lg border border-sidebar-border bg-sidebar flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5" /> Agentic Engine State
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-foreground animate-pulse" />
                    <span className="text-base font-extrabold text-foreground">Online & Ready</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">Read-Only Safety Mode</span>
                </div>
              </div>
            </div>

            {/* Quick Navigation Footer */}
            <div className="p-6 rounded-lg border border-sidebar-border bg-sidebar flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-extrabold text-base text-foreground">Need to inspect detailed records?</span>
                <span className="text-xs text-muted-foreground">Use the sidebar or quick links to navigate directly to specialized modules.</span>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => navigate("/app/inventory")} variant="outline" size="sm" className="rounded-lg border-sidebar-border text-xs font-bold gap-1.5 cursor-pointer">
                  <Box className="size-3.5" /> Inventories
                </Button>
                <Button onClick={() => navigate("/app/ledger")} variant="outline" size="sm" className="rounded-lg border-sidebar-border text-xs font-bold gap-1.5 cursor-pointer">
                  <Building2 className="size-3.5" /> Ledger
                </Button>
                <Button onClick={() => navigate("/app/receipts")} variant="outline" size="sm" className="rounded-lg border-sidebar-border text-xs font-bold gap-1.5 cursor-pointer">
                  <ReceiptText className="size-3.5" /> Receipts
                </Button>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
