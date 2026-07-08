import React, { useState, useMemo, useEffect } from "react";
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

  const activeItem = useMemo(() => {
    if (!activeCollection) return null;
    return (
      activeCollection.data.find((item) => item.id === selectedItemId) ||
      activeCollection.data[0] ||
      null
    );
  }, [activeCollection, selectedItemId]);

  useEffect(() => {
    if (filteredItems.length > 0) {
      if (
        !selectedItemId ||
        !filteredItems.some((i) => i.id === selectedItemId)
      ) {
        setSelectedItemId(filteredItems[0].id);
      }
    } else {
      setSelectedItemId("");
    }
  }, [filteredItems, selectedItemId]);

  const getItemSubtitle = (item: any, collection?: any) => {
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
  };

  const formatValue = (value: any, fieldType: string) => {
    if (value === null || value === undefined || value === "") return "N/A";
    switch (fieldType) {
      case "boolean":
        return value ? "Yes" : "No";
      case "date": {
        const d = new Date(value);
        return !isNaN(d.getTime())
          ? d.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : String(value);
      }
      case "currency":
        return `₹${Number(value).toLocaleString("en-IN")}`;
      case "number":
        return Number(value).toLocaleString("en-IN");
      default:
        return String(value);
    }
  };

  const getItemTitle = (item: any, collection?: any) => {
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
  };

  return (
    <div className="flex h-screen w-full gap-2 p-2 overflow-hidden bg-background text-foreground">
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

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2.5 pr-1">
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

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2.5 pr-1">
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
                        {getItemTitle(c, activeCollection)}
                      </span>
                      {getItemSubtitle(c, activeCollection) ? (
                        <span
                          className={cn(
                            "text-xs truncate mt-0.5",
                            isSelected
                              ? "text-background/80"
                              : "text-muted-foreground",
                          )}
                        >
                          {getItemSubtitle(c, activeCollection)}
                        </span>
                      ) : null}
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

      {/* Right Pane: Item Details matching mobile itemId.tsx */}
      <div className="flex-1 h-full border border-sidebar-border rounded-lg bg-background shadow-xs overflow-hidden min-w-0">
        <ScrollArea className="h-full p-6 sm:p-8">
          {activeCollection && activeItem ? (
            <div className="w-full">
              {/* Header Title Section */}
              <div className="mb-6">
                <h2 className="mb-1 text-3xl font-black text-foreground">
                  {getItemTitle(activeItem, activeCollection)}
                </h2>
                <p className="text-sm font-medium text-muted-foreground">
                  Added:{" "}
                  {(() => {
                    const d = new Date(activeItem.createdAt);
                    return !isNaN(d.getTime())
                      ? d.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : activeItem.createdAt;
                  })()}{" "}
                  by Admin
                </p>
              </div>

              {/* Divider */}
              <div className="mb-6 h-[1px] bg-sidebar-border" />

              {/* Content Area / List UI */}
              <div className="flex flex-col">
                {activeCollection.schema.map((field) => {
                  let rawVal = activeItem.values[field.key];
                  if (
                    rawVal === undefined ||
                    rawVal === null ||
                    rawVal === ""
                  ) {
                    if (
                      field.key === "quantity" &&
                      activeItem.values.stock !== undefined
                    ) {
                      rawVal = activeItem.values.stock;
                    } else if (
                      field.key === "stock" &&
                      activeItem.values.quantity !== undefined
                    ) {
                      rawVal = activeItem.values.quantity;
                    } else if (
                      field.key === "name" ||
                      field.key === "itemName" ||
                      field.key === "product"
                    ) {
                      rawVal =
                        activeItem.values.name ||
                        activeItem.values.itemName ||
                        activeItem.values.product;
                    }
                  }
                  const displayValue = formatValue(rawVal, field.type);
                  const isCurrency = field.type === "currency";

                  return (
                    <div
                      key={field.key}
                      className="flex items-center justify-between py-4 border-b border-sidebar-border last:border-b-0"
                    >
                      <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        {field.label}
                      </span>
                      <span
                        className={cn(
                          "text-right text-base font-semibold",
                          isCurrency
                            ? "font-mono font-extrabold text-foreground"
                            : "text-foreground",
                        )}
                      >
                        {displayValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeCollection ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Package className="size-10 stroke-1 opacity-50" />
              <p className="font-semibold">No item selected</p>
              <p className="text-xs">
                Select an item from the middle list to view its details.
              </p>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Box className="size-12 stroke-1 opacity-50" />
              <p className="font-semibold text-base">No catalog selected</p>
              <p className="text-xs">
                Select a catalog from the left pane to view its items.
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
