import React, { useState, useMemo } from "react";
import { seedData } from "@/lib/seed";
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
  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    seedData.ledger[0]?.organization.id || "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "DEBIT" | "CREDIT">(
    "ALL",
  );

  const ledger = seedData.ledger;

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
      ledger.find((item) => item.organization.id === selectedOrgId) || ledger[0]
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
    <div className="flex h-screen w-full gap-2 p-2 pl-0 overflow-hidden bg-background text-foreground">
      {/* Left Pane: Parties & Organizations */}
      <div className="w-80 h-full flex flex-col gap-4 border border-sidebar-border rounded-lg bg-sidebar p-4 shadow-sm shrink-0 overflow-hidden">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-foreground" />
            <h2 className="font-bold text-lg tracking-tight text-foreground">
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

        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="flex flex-col gap-2.5 pr-3">
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
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={cn(
                        "size-9 rounded-md flex items-center justify-center shrink-0 border border-sidebar-border transition-colors font-bold text-sm",
                        isSelected
                          ? "bg-background text-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      {org.name.charAt(0).toUpperCase()}
                    </div>
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
      <div className="flex-1 h-full flex flex-col gap-6 border border-sidebar-border rounded-lg bg-sidebar p-6 shadow-sm overflow-hidden min-w-0">
        {activeEntry ? (
          <>
            {/* Top Party Profile Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sidebar-border">
              <div className="flex justify-between w-full items-center gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
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
                        netBalance
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
                        netBalance
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
                    <span className="text-2xl font-mono font-extrabold text-foreground">
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
                    <span className="text-2xl font-mono font-extrabold text-foreground">
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
                      <span className="text-2xl font-mono font-extrabold text-foreground">
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

                    return (
                      <TableRow
                        key={t.id}
                        className="group border-sidebar-border hover:bg-muted/50"
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
