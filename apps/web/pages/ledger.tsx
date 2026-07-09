import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAppSelector } from "@/lib/store/hooks";
import type { LedgerNavState } from "@/lib/navigation-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  CreditCard,
  Building2,
  Phone,
  Mail,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  ChevronRight,
  Download,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { printLedger } from "@/lib/pdf";

export default function Ledger() {
  const ledger = useAppSelector((s) => s.ledger.entries);
  const location = useLocation();
  const navigate = useNavigate();

  const pendingNav = useRef<LedgerNavState | null>(
    (location.state as LedgerNavState | null) ?? null,
  );

  const [selectedOrgId, setSelectedOrgId] = useState<string>(() => {
    const nav = location.state as LedgerNavState | null;
    return nav?.organizationId || ledger[0]?.organization.id || "";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "DEBIT" | "CREDIT">(
    "ALL",
  );
  const [highlightedTxnId, setHighlightedTxnId] = useState<string | null>(
    () => {
      const nav = location.state as LedgerNavState | null;
      return nav?.transactionId || null;
    },
  );

  // Deep-link from dashboard search: select party (+ optional transaction)
  useEffect(() => {
    const state =
      pendingNav.current || (location.state as LedgerNavState | null);
    if (!state?.organizationId && !state?.transactionId) return;
    if (!ledger.length) return;

    let orgId = state.organizationId;
    if (!orgId && state.transactionId) {
      const entry = ledger.find((e) =>
        e.transactions.some((t) => t.id === state.transactionId),
      );
      orgId = entry?.organization.id;
    }

    if (orgId && ledger.some((e) => e.organization.id === orgId)) {
      setSelectedOrgId(orgId);
      setSearchQuery("");
      setTypeFilter("ALL");
      if (state.transactionId) setHighlightedTxnId(state.transactionId);
      pendingNav.current = null;
      if (location.state) {
        navigate(location.pathname, { replace: true, state: null });
      }
    }
  }, [ledger, location.state, location.pathname, navigate]);

  // Clear transaction highlight after a short moment
  useEffect(() => {
    if (!highlightedTxnId) return;
    const t = window.setTimeout(() => setHighlightedTxnId(null), 3500);
    return () => window.clearTimeout(t);
  }, [highlightedTxnId]);

  const filteredOrgs = useMemo(() => {
    return ledger.filter((item) => {
      const org = item.organization;
      const query = searchQuery.toLowerCase();
      return (
        org.name.toLowerCase().includes(query) ||
        (org.phone && org.phone.toLowerCase().includes(query)) ||
        (org.email && org.email.toLowerCase().includes(query))
      );
    });
  }, [ledger, searchQuery]);

  const activeEntry = useMemo(() => {
    return (
      ledger.find((item) => item.organization.id === selectedOrgId) ||
      ledger[0] ||
      null
    );
  }, [ledger, selectedOrgId]);

  const { totalDebit, totalCredit, netBalance } = useMemo(() => {
    if (!activeEntry) return { totalDebit: 0, totalCredit: 0, netBalance: 0 };
    let debit = 0;
    let credit = 0;
    activeEntry.transactions.forEach((t) => {
      if (t.type === "DEBIT") debit += Number(t.amount) || 0;
      else if (t.type === "CREDIT") credit += Number(t.amount) || 0;
    });
    return {
      totalDebit: debit,
      totalCredit: credit,
      netBalance: debit - credit,
    };
  }, [activeEntry]);

  const filteredTransactions = useMemo(() => {
    if (!activeEntry) return [];
    return activeEntry.transactions.filter((t) => {
      if (typeFilter === "ALL") return true;
      return t.type === typeFilter;
    });
  }, [activeEntry, typeFilter]);

  const getOrgBalance = (item: (typeof ledger)[0]) => {
    let debit = 0;
    let credit = 0;
    item.transactions.forEach((t) => {
      if (t.type === "DEBIT") debit += Number(t.amount) || 0;
      else if (t.type === "CREDIT") credit += Number(t.amount) || 0;
    });
    return debit - credit;
  };

  return (
    <div className="flex h-screen w-full gap-1.5 overflow-hidden bg-background p-1.5 text-foreground xl:gap-2 xl:p-2">
      {/* Left Pane: Parties & Organizations */}
      <div className="flex h-full w-52 shrink-0 flex-col gap-3 overflow-hidden rounded-lg border border-sidebar-border bg-sidebar p-3 shadow-sm lg:w-56 xl:w-64 xl:gap-4 xl:p-4">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5 xl:gap-2">
            <Building2 className="size-4 text-foreground xl:size-5" />
            <h2 className="text-sm font-bold tracking-tight text-foreground xl:text-lg">
              Parties
            </h2>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search parties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-sidebar-border"
          />
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2.5 pr-1">
            {filteredOrgs.map((item) => {
              const org = item.organization;
              const isSelected = selectedOrgId === org.id;
              const bal = getOrgBalance(item);

              return (
                <div
                  key={org.id}
                  onClick={() => {
                    setSelectedOrgId(org.id);
                    setTypeFilter("ALL");
                  }}
                  className={cn(
                    "group relative flex items-center justify-between p-3.5 rounded-lg border transition-all cursor-pointer",
                    isSelected
                      ? "bg-foreground text-background border-foreground shadow-xs"
                      : "bg-background text-foreground border-sidebar-border hover:bg-muted",
                  )}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div
                      className={`size-3 rounded-full ${isSelected ? "bg-secondary" : "bg-primary"}`}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-semibold text-sm truncate">
                        {org.name}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{org.phone}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn(
                      "size-4 shrink-0 ml-2 transition-transform",
                      isSelected ? "text-background" : "text-muted-foreground",
                    )}
                  />
                </div>
              );
            })}
            {filteredOrgs.length === 0 && (
              <div className="text-center py-8 px-4 text-sm text-muted-foreground border border-sidebar-border rounded-lg border-dashed">
                No parties matching "{searchQuery}"
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Pane: Party Ledger & Transactions */}
      <div className="flex h-full min-w-0 flex-1 flex-col gap-4 overflow-hidden rounded-lg border border-sidebar-border bg-sidebar p-4 shadow-sm xl:gap-6 xl:p-6">
        {activeEntry ? (
          <>
            {/* Top Party Profile Banner */}
            <div className="flex flex-col justify-between gap-3 border-b border-sidebar-border pb-3 sm:flex-row sm:items-center xl:gap-4 xl:pb-4">
              <div className="flex w-full items-center justify-between gap-3 xl:gap-4">
                <div className="flex flex-col gap-0.5 xl:gap-1">
                  <div className="flex items-center gap-2 xl:gap-2.5">
                    <h1 className="text-lg font-extrabold tracking-tight text-foreground xl:text-2xl">
                      {activeEntry.organization.name}
                    </h1>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    {activeEntry.organization.phone && (
                      <span className="flex items-center gap-1 font-mono">
                        {activeEntry.organization.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      printLedger(
                        activeEntry.organization,
                        activeEntry.transactions,
                        netBalance,
                      )
                    }
                    className="gap-2 rounded-lg cursor-pointer border-sidebar-border"
                  >
                    <Printer className="size-4" />
                    <span>Print</span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      printLedger(
                        activeEntry.organization,
                        activeEntry.transactions,
                        netBalance,
                      )
                    }
                    className="gap-2 rounded-lg cursor-pointer shadow-xs"
                  >
                    <Download className="size-4" />
                    <span>PDF</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="rounded-lg border border-sidebar-border bg-background shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Total Debit (Given)
                    </span>
                    <span className="font-mono text-lg font-extrabold text-foreground xl:text-2xl">
                      ₹{totalDebit.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="size-10 rounded-md bg-muted border border-sidebar-border flex items-center justify-center text-foreground">
                    <TrendingUp className="size-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-lg border border-sidebar-border bg-background shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Total Credit (Received)
                    </span>
                    <span className="font-mono text-lg font-extrabold text-foreground xl:text-2xl">
                      ₹{totalCredit.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="size-10 rounded-md bg-muted border border-sidebar-border flex items-center justify-center text-foreground">
                    <TrendingDown className="size-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-lg border border-sidebar-border bg-background shadow-xs">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Net Balance
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-lg font-extrabold text-foreground xl:text-2xl">
                        ₹{Math.abs(netBalance).toLocaleString("en-IN")}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-bold px-1.5 border-sidebar-border bg-muted text-foreground"
                      >
                        {netBalance > 0
                          ? "You Give"
                          : netBalance < 0
                            ? "You Get"
                            : "Settled"}
                      </Badge>
                    </div>
                  </div>
                  <div className="size-10 rounded-md bg-muted border border-sidebar-border flex items-center justify-center text-foreground">
                    <DollarSign className="size-5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 bg-background p-1 rounded-lg border border-sidebar-border">
                {(["ALL", "DEBIT", "CREDIT"] as const).map((type) => (
                  <Button
                    key={type}
                    size="xs"
                    variant={typeFilter === type ? "default" : "outline"}
                    onClick={() => setTypeFilter(type)}
                    className={cn(
                      "rounded-md text-xs font-bold px-3.5 cursor-pointer border-sidebar-border",
                      typeFilter === type
                        ? "bg-foreground text-background"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {type === "ALL" ? "All Entries" : type}
                  </Button>
                ))}
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                Showing {filteredTransactions.length} of{" "}
                {activeEntry.transactions.length} entries
              </span>
            </div>

            {/* Transactions Table */}
            <ScrollArea className="flex-1 border border-sidebar-border rounded-lg bg-background shadow-xs">
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  <TableRow className="border-sidebar-border">
                    <TableHead className="w-[15%] text-foreground font-bold">
                      Date
                    </TableHead>
                    <TableHead className="w-[15%] text-foreground font-bold">
                      Type
                    </TableHead>
                    <TableHead className="w-[50%] text-foreground font-bold">
                      Remark / Description
                    </TableHead>
                    <TableHead className="w-[20%] text-right text-foreground font-bold">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((t) => {
                    const isDebit = t.type === "DEBIT";
                    const dateStr = new Date(t.date).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    );

                    const isHighlighted = highlightedTxnId === t.id;

                    return (
                      <TableRow
                        key={t.id}
                        data-highlighted={isHighlighted || undefined}
                        className={cn(
                          "group border-sidebar-border hover:bg-muted/50",
                          isHighlighted &&
                            "bg-foreground/5 ring-1 ring-inset ring-foreground/20",
                        )}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {dateStr}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-bold text-[11px] gap-1 px-2.5 border-sidebar-border",
                              isDebit
                                ? "bg-foreground text-background"
                                : "bg-muted text-foreground",
                            )}
                          >
                            {isDebit ? (
                              <ArrowUpRight className="size-3" />
                            ) : (
                              <ArrowDownRight className="size-3" />
                            )}
                            {t.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-sm text-foreground">
                            {t.remark || "No remark provided"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono font-extrabold text-base text-foreground">
                            {isDebit ? "-" : "+"} ₹
                            {Number(t.amount).toLocaleString("en-IN")}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredTransactions.length === 0 && (
                    <TableRow className="border-sidebar-border">
                      <TableCell colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <FileText className="size-10 stroke-1 opacity-50" />
                          <p className="font-semibold">
                            No transactions recorded
                          </p>
                          <p className="text-xs">
                            No entries match the selected filter.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <CreditCard className="size-12 stroke-1 opacity-50" />
            <p className="font-semibold text-base">No party selected</p>
            <p className="text-xs">
              Select a party from the left pane to view their ledger
              transactions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
