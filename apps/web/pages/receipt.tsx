import React, { useState, useMemo } from "react";
import { seedData } from "@/lib/seed";
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

export default function Receipt() {
  const [selectedReceiptId, setSelectedReceiptId] = useState<string>(
    seedData.receipts[0]?.id || "",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const receipts = seedData.receipts;

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
    return receipts.find((r) => r.id === selectedReceiptId) || receipts[0];
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
    <div className="flex h-screen w-full gap-2 p-2 pl-0 overflow-hidden bg-background text-foreground">
      {/* Left Pane: Receipts List */}
      <div className="w-80 h-full flex flex-col gap-4 border border-sidebar-border rounded-lg bg-sidebar p-4 shadow-sm shrink-0 overflow-hidden">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-5 text-foreground" />
            <h2 className="font-bold text-lg tracking-tight text-foreground">
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

        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="flex flex-col gap-2.5 pr-3">
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

      {/* Right Pane: Invoice Preview & Actions */}
      <div className="flex-1 h-full flex flex-col gap-6 border border-sidebar-border rounded-lg bg-sidebar p-6 shadow-sm overflow-hidden min-w-0">
        {activeReceipt ? (
          <>
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                    {activeReceipt.customerName}
                  </h1>
                  <span className="text-xs text-muted-foreground font-mono">
                    {new Date(activeReceipt.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 rounded-lg cursor-pointer border-sidebar-border"
                >
                  <Printer className="size-4" /> Print
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 rounded-lg cursor-pointer border-sidebar-border"
                >
                  <Download className="size-4" /> PDF
                </Button>
              </div>
            </div>

            {/* Document Preview Area */}
            <ScrollArea className="flex-1 bg-background border border-sidebar-border rounded-lg p-4 sm:p-8">
              <div className="max-w-3xl mx-auto bg-card border border-sidebar-border rounded-lg p-6 sm:p-10 shadow-sm flex flex-col gap-8 text-foreground">
                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row justify-between gap-6">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-md bg-foreground flex items-center justify-center text-background font-black text-lg">
                        M
                      </div>
                      <span className="font-black text-2xl tracking-tighter text-foreground">
                        {seedData.meta?.organizationName || "Mudir Store"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Smart Agentic Inventory, Ledger & Receipt Management
                      Suite.
                    </p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1">
                    <span className="text-3xl font-black tracking-tight text-muted-foreground/30">
                      INVOICE
                    </span>
                    <span className="font-mono font-bold text-sm text-foreground">
                      #{activeReceipt.id.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge
                        variant="outline"
                        className="bg-muted text-foreground border-sidebar-border text-[10px] uppercase font-bold gap-1 px-2"
                      >
                        <CheckCircle2 className="size-3" /> Paid & Settled
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="bg-sidebar-border" />

                {/* Billed To & Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Billed To
                    </span>
                    <span className="font-extrabold text-lg text-foreground">
                      {activeReceipt.customerName}
                    </span>
                    {activeReceipt.phone && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                        <Phone className="size-3 text-foreground" />{" "}
                        {activeReceipt.phone}
                      </span>
                    )}
                    {activeReceipt.description && (
                      <span className="text-xs text-muted-foreground mt-1 bg-muted/40 p-2 rounded-md border border-sidebar-border">
                        "{activeReceipt.description}"
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:items-end gap-1.5">
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
                    <div className="flex flex-col sm:items-end mt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Payment Currency
                      </span>
                      <span className="font-mono text-sm font-semibold text-foreground">
                        INR (₹)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border border-sidebar-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted">
                      <TableRow className="border-sidebar-border">
                        <TableHead className="w-12 font-bold text-foreground">
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

                {/* Summary & Footer */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
                  <div className="flex flex-col gap-1 max-w-xs text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">
                      Payment Terms & Notes
                    </span>
                    <p>
                      All goods sold are non-returnable without original
                      invoice. This is a computer-generated receipt.
                    </p>
                  </div>

                  <div className="w-full sm:w-64 flex flex-col gap-3 bg-muted/30 p-4 rounded-lg border border-sidebar-border">
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

                {/* Footer branding */}
                <div className="text-center pt-6 border-t border-sidebar-border border-dashed">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Thank you for your business! Powered by Mudir.
                  </span>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <ReceiptText className="size-12 stroke-1 opacity-50" />
            <p className="font-semibold text-base">No receipt selected</p>
            <p className="text-xs">
              Select a receipt from the left pane to view or print the invoice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
