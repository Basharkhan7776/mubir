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
  Box,
  Package,
  Filter,
  CheckCircle2,
  AlertCircle,
  Layers,
  ShoppingBag,
  ChevronRight,
  Dot,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Inventory() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    seedData.collections[0]?.id || "",
  );
  const [collectionSearch, setCollectionSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  const collections = seedData.collections;
  const filteredCollections = useMemo(() => {
    return collections.filter(
      (c) =>
        c.name.toLowerCase().includes(collectionSearch.toLowerCase()) ||
        (c.description &&
          c.description.toLowerCase().includes(collectionSearch.toLowerCase())),
    );
  }, [collections, collectionSearch]);

  const activeCollection = useMemo(() => {
    return (
      collections.find((c) => c.id === selectedCollectionId) || collections[0]
    );
  }, [collections, selectedCollectionId]);

  const categories = useMemo(() => {
    if (!activeCollection) return ["ALL"];
    const cats = new Set<string>();
    activeCollection.data.forEach((item) => {
      if (item.values.category) cats.add(String(item.values.category));
    });
    return ["ALL", ...Array.from(cats)];
  }, [activeCollection]);

  const filteredItems = useMemo(() => {
    if (!activeCollection) return [];
    return activeCollection.data.filter((item) => {
      const values = item.values;
      const matchSearch =
        !itemSearch ||
        Object.values(values).some((val) =>
          String(val).toLowerCase().includes(itemSearch.toLowerCase()),
        );
      const matchCategory =
        selectedCategory === "ALL" || values.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [activeCollection, itemSearch, selectedCategory]);

  const totalItemsCount = useMemo(() => {
    if (!activeCollection) return 0;
    return activeCollection.data.reduce(
      (acc, item) =>
        acc + (Number(item.values.quantity || item.values.stock) || 0),
      0,
    );
  }, [activeCollection]);

  const totalInventoryValue = useMemo(() => {
    if (!activeCollection) return 0;
    return activeCollection.data.reduce((acc, item) => {
      const price = Number(item.values.price) || 0;
      const qty = Number(item.values.quantity || item.values.stock) || 0;
      return acc + price * qty;
    }, 0);
  }, [activeCollection]);

  return (
    <div className="flex h-screen w-full gap-2 p-2 pl-0 overflow-hidden bg-background text-foreground">
      {/* Left Pane: Collections Catalog */}
      <div className="w-80 h-full flex flex-col gap-4 border border-sidebar-border rounded-lg bg-sidebar p-4 shadow-sm shrink-0 overflow-hidden">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-foreground" />
            <h2 className="font-bold text-lg tracking-tight text-foreground">
              Catalogs
            </h2>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search catalogs..."
            value={collectionSearch}
            onChange={(e) => setCollectionSearch(e.target.value)}
            className="pl-9 bg-background border-sidebar-border"
          />
        </div>

        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="flex flex-col gap-2.5 pr-3">
            {filteredCollections.map((c) => {
              const isSelected = selectedCollectionId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCollectionId(c.id);
                    setSelectedCategory("ALL");
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
                        {c.name}
                      </span>
                      <span className="text-xs ">{c.data.length} items</span>
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
            {filteredCollections.length === 0 && (
              <div className="text-center py-8 px-4 text-sm text-muted-foreground border border-sidebar-border rounded-lg border-dashed">
                No catalogs matching "{collectionSearch}"
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      {/*Left Pane: Collection List */}
      <div className="w-80 h-full flex flex-col gap-4 border border-sidebar-border rounded-lg bg-sidebar p-4 shadow-sm shrink-0 overflow-hidden">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Box className="size-5 text-foreground" />
            <h2 className="font-bold text-lg tracking-tight text-foreground">
              {activeCollection?.name || "Select a catalog"}
            </h2>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search items..."
            value={itemSearch}
            onChange={(e) => setItemSearch(e.target.value)}
            className="pl-9 bg-background border-sidebar-border"
          />
        </div>

        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="flex flex-col gap-2.5 pr-3">
            {filteredItems.map((c) => {
              const isSelected = selectedItemId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedItemId(c.id);
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
                        {c.values.name || "Untitled Item"}
                      </span>
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
            {filteredCollections.length === 0 && (
              <div className="text-center py-8 px-4 text-sm text-muted-foreground border border-sidebar-border rounded-lg border-dashed">
                No catalogs matching "{collectionSearch}"
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Pane: Catalog Items & Management */}
      <div className="flex-1 h-full flex flex-col gap-6 border border-sidebar-border rounded-lg bg-sidebar p-6 shadow-sm overflow-hidden min-w-0">
        {activeCollection ? (
          <>
            {/* Top Banner & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sidebar-border">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                    {activeCollection.name}
                  </h1>
                  <Badge
                    variant="outline"
                    className="font-mono text-xs border-sidebar-border bg-muted text-foreground"
                  >
                    ID: {activeCollection.id}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activeCollection.description ||
                    "Manage inventory items, pricing, and stock levels."}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-3 bg-background px-3.5 py-2 rounded-lg border border-sidebar-border">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Total Units
                    </span>
                    <span className="text-base font-bold font-mono text-foreground">
                      {totalItemsCount}
                    </span>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="h-7 bg-sidebar-border"
                  />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Est. Value
                    </span>
                    <span className="text-base font-bold font-mono text-foreground">
                      ₹{totalInventoryValue.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search products by name, brand..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="pl-9 bg-background border-sidebar-border"
                />
              </div>

              {categories.length > 1 && (
                <ScrollArea className="max-w-md pb-1 sm:pb-0">
                  <div className="flex items-center gap-1.5">
                    <Filter className="size-3.5 text-muted-foreground mr-1 shrink-0" />
                    {categories.map((cat) => (
                      <Button
                        key={cat}
                        size="xs"
                        variant={
                          selectedCategory === cat ? "default" : "outline"
                        }
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "rounded-full text-xs shrink-0 cursor-pointer border-sidebar-border",
                          selectedCategory === cat
                            ? "bg-foreground text-background hover:bg-foreground/90"
                            : "bg-background text-foreground hover:bg-muted",
                        )}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Items Table inside ScrollArea */}
            <ScrollArea className="flex-1 border border-sidebar-border rounded-lg bg-background shadow-xs">
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  <TableRow className="border-sidebar-border">
                    <TableHead className="w-[35%] text-foreground font-bold">
                      Product Details
                    </TableHead>
                    <TableHead className="text-foreground font-bold">
                      Category
                    </TableHead>
                    <TableHead className="text-foreground font-bold">
                      Price
                    </TableHead>
                    <TableHead className="text-foreground font-bold">
                      Status
                    </TableHead>
                    <TableHead className="text-right text-foreground font-bold">
                      Quantity
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const val = item.values;
                    const name =
                      val.name ||
                      val.itemName ||
                      val.product ||
                      "Untitled Item";
                    const brand = val.brand || val.size || val.weight || "";
                    const price = Number(val.price) || 0;
                    const qty =
                      Number(
                        val.quantity !== undefined ? val.quantity : val.stock,
                      ) || 0;
                    const inStock =
                      val.inStock !== undefined
                        ? Boolean(val.inStock)
                        : qty > 0;
                    const cat = val.category || val.color || "General";

                    return (
                      <TableRow
                        key={item.id}
                        className="group border-sidebar-border hover:bg-muted/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-md border border-sidebar-border bg-muted flex items-center justify-center shrink-0 text-foreground">
                              <ShoppingBag className="size-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm text-foreground">
                                {name}
                              </span>
                              {brand && (
                                <span className="text-xs text-muted-foreground">
                                  {brand}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-normal border-sidebar-border bg-muted text-foreground"
                          >
                            {cat}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-bold text-sm text-foreground">
                            ₹{price.toLocaleString("en-IN")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "gap-1 select-none text-[11px] border-sidebar-border",
                              inStock
                                ? "bg-foreground text-background"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {inStock ? (
                              <>
                                <CheckCircle2 className="size-3" /> In Stock
                              </>
                            ) : (
                              <>
                                <AlertCircle className="size-3" /> Out of Stock
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-sm text-foreground">
                          {qty}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredItems.length === 0 && (
                    <TableRow className="border-sidebar-border">
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <Package className="size-10 stroke-1 opacity-50" />
                          <p className="font-semibold">
                            No items found in this catalog
                          </p>
                          <p className="text-xs">
                            Try adjusting your search query.
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
            <Box className="size-12 stroke-1 opacity-50" />
            <p className="font-semibold text-base">No catalog selected</p>
            <p className="text-xs">
              Select a catalog from the left pane to view its items.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
