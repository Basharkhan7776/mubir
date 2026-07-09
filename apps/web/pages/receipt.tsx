import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAppSelector } from "@/lib/store/hooks";
import type { ReceiptsNavState } from "@/lib/navigation-state";
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
import { Separator } from "@/components/ui/separator";
import {
  Search,
  ReceiptText,
  Printer,
  Download,
  Share2,
  Phone,
  CheckCircle2,
  FileText,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { printReceipt } from "@/lib/pdf";

export default function Receipt() {
  const receipts = useAppSelector((s) => s.receipts.list);
  const location = useLocation();
  const navigate = useNavigate();

  const pendingNav = useRef<ReceiptsNavState | null>(
    (location.state as ReceiptsNavState | null) ?? null,
  );

  const [selectedReceiptId, setSelectedReceiptId] = useState<string>(() => {
    const nav = location.state as ReceiptsNavState | null;
    return nav?.receiptId || receipts[0]?.id || "";
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Deep-link from dashboard search: select receipt
  useEffect(() => {
    const state =
      pendingNav.current || (location.state as ReceiptsNavState | null);
    if (!state?.receiptId) return;
    if (!receipts.length) return;

    const exists = receipts.some((r) => r.id === state.receiptId);
    if (exists) {
      setSelectedReceiptId(state.receiptId);
      setSearchQuery("");
      pendingNav.current = null;
      if (location.state) {
        navigate(location.pathname, { replace: true, state: null });
      }
    }
  }, [receipts, location.state, location.pathname, navigate]);

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const query = searchQuery.toLowerCase();
      return (
        r.customerName.toLowerCase().includes(query) ||
        (r.phone && r.phone.toLowerCase().includes(query)) ||
        (r.description && r.description.toLowerCase().includes(query)) ||
        r.id.toLowerCase().includes(query)
      );
    });
  }, [receipts, searchQuery]);

  const activeReceipt = useMemo(() => {
    return (
      receipts.find((r) => r.id === selectedReceiptId) || receipts[0] || null
    );
  }, [receipts, selectedReceiptId]);

  const { subtotal, tax, grandTotal } = useMemo(() => {
    if (!activeReceipt) return { subtotal: 0, tax: 0, grandTotal: 0 };
    const sub = activeReceipt.items.reduce(
      (acc, i) => acc + (Number(i.price) || 0) * (Number(i.quantity) || 1),
      0,
    );
    const t = sub * 0.05; // 5% mock GST
    return {
      subtotal: sub,
      tax: t,
      grandTotal: sub + t,
    };
  }, [activeReceipt]);

  const getReceiptTotal = (r: (typeof receipts)[0]) => {
    return r.items.reduce(
      (acc, i) => acc + (Number(i.price) || 0) * (Number(i.quantity) || 1),
      0,
    );
  };

  return (
    <div className="flex h-screen w-full gap-1.5 overflow-hidden bg-background p-1.5 text-foreground xl:gap-2 xl:p-2">
      {/* Left Pane: Receipts List */}
      <div className="flex h-full w-52 shrink-0 flex-col gap-3 overflow-hidden rounded-lg border border-sidebar-border bg-sidebar p-3 shadow-sm lg:w-56 xl:w-64 xl:gap-4 xl:p-4">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5 xl:gap-2">
            <ReceiptText className="size-4 text-foreground xl:size-5" />
            <h2 className="text-sm font-bold tracking-tight text-foreground xl:text-lg">
              Receipts
            </h2>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-sidebar-border"
          />
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2.5 pr-1">
            {filteredReceipts.map((r) => {
              const isSelected = selectedReceiptId === r.id;
              const total = getReceiptTotal(r);
              const dateStr = new Date(r.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              });

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReceiptId(r.id)}
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
                        {r.customerName}
                      </span>
                      <div className="text-xs">{r.phone}</div>
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
            {filteredReceipts.length === 0 && (
              <div className="text-center py-8 px-4 text-sm text-muted-foreground border border-sidebar-border rounded-lg border-dashed">
                No receipts matching "{searchQuery}"
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Pane: Full-Width Enterprise Invoice View */}
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-sidebar-border bg-background shadow-xs">
        {activeReceipt ? (
          <>
            {/* Top Header Bar */}
            <div className="flex shrink-0 flex-col justify-between gap-3 border-b border-sidebar-border bg-sidebar px-4 py-3 sm:flex-row sm:items-center sm:px-5 xl:gap-4 xl:px-6 xl:py-4">
              <div className="flex flex-col">
                <h1 className="text-lg font-extrabold tracking-tight text-foreground xl:text-2xl">
                  {activeReceipt.customerName}
                </h1>
                <span className="mt-0.5 font-mono text-[11px] text-muted-foreground xl:text-xs">
                  Invoice Date:{" "}
                  {new Date(activeReceipt.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => printReceipt(activeReceipt)}
                  className="gap-2 rounded-lg cursor-pointer border-sidebar-border"
                >
                  <Printer className="size-4" /> Print
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => printReceipt(activeReceipt)}
                  className="gap-2 rounded-lg cursor-pointer shadow-xs"
                >
                  <Download className="size-4" /> PDF
                </Button>
              </div>
            </div>

            {/* Full-Width Document View Area */}
            <ScrollArea className="flex-1 p-4 sm:p-5 xl:p-6">
              <div className="flex w-full max-w-none flex-col gap-5 text-foreground xl:gap-8">
                {/* Billed To & Dates */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground xl:text-[11px]">
                      Billed To Customer
                    </span>
                    <span className="text-base font-extrabold text-foreground xl:text-xl">
                      {activeReceipt.customerName}
                    </span>
                    {activeReceipt.phone && (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                        <Phone className="size-3 text-foreground" />{" "}
                        {activeReceipt.phone}
                      </span>
                    )}
                    {activeReceipt.description && (
                      <span className="text-xs text-muted-foreground mt-1.5 bg-muted/40 p-2.5 rounded-md border border-sidebar-border">
                        "{activeReceipt.description}"
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:items-end justify-between gap-4">
                    <div className="flex flex-col sm:items-end">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Date of Issue
                      </span>
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {new Date(activeReceipt.date).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Full-Width Line Items Table */}
                <div className="w-full border border-sidebar-border rounded-lg overflow-hidden">
                  <Table className="w-full">
                    <TableHeader className="bg-muted">
                      <TableRow className="border-sidebar-border">
                        <TableHead className="w-14 font-bold text-foreground">
                          #
                        </TableHead>
                        <TableHead className="font-bold text-foreground">
                          Item Description
                        </TableHead>
                        <TableHead className="text-right font-bold text-foreground">
                          Price
                        </TableHead>
                        <TableHead className="text-right font-bold text-foreground">
                          Qty
                        </TableHead>
                        <TableHead className="text-right font-bold text-foreground">
                          Subtotal
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeReceipt.items.map((item, index) => {
                        const price = Number(item.price) || 0;
                        const qty = Number(item.quantity) || 1;
                        const lineTotal = price * qty;

                        return (
                          <TableRow
                            key={item.id}
                            className="border-sidebar-border hover:bg-muted/50"
                          >
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-semibold text-foreground">
                              {item.name}
                            </TableCell>
                            <TableCell className="text-right font-mono text-foreground">
                              ₹{price.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell className="text-right font-mono text-foreground">
                              {qty}
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold text-foreground">
                              ₹{lineTotal.toLocaleString("en-IN")}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Full-Width Summary & Footer */}
                <div className="w-full flex flex-col sm:flex-row justify-between items-start gap-8 pt-2">
                  <div className="flex flex-col gap-1.5 max-w-sm text-xs text-muted-foreground">
                    <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                      Payment Terms & Notes
                    </span>
                    <p className="leading-relaxed">
                      All goods sold are non-returnable without original
                      invoice. This is an enterprise computer-generated record.
                    </p>
                  </div>

                  <div className="w-full sm:w-72 flex flex-col gap-3 bg-muted/40 p-5 rounded-lg border border-sidebar-border">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-mono font-bold text-foreground">
                        ₹{subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        GST (Est. 5%)
                      </span>
                      <span className="font-mono font-semibold text-foreground">
                        ₹{tax.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <Separator className="bg-sidebar-border" />
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-base text-foreground">
                        Grand Total
                      </span>
                      <span className="font-mono font-black text-xl text-foreground">
                        ₹{grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <ReceiptText className="size-12 stroke-1 opacity-50" />
            <p className="font-semibold text-base">No receipt selected</p>
            <p className="text-xs">
              Select a receipt from the middle pane to view or print the invoice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
