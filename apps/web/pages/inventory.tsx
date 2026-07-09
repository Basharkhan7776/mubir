import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAppSelector } from "@/lib/store/hooks";
import type { InventoryNavState } from "@/lib/navigation-state";
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
  const collections = useAppSelector((s) => s.inventory.collections);
  const location = useLocation();
  const navigate = useNavigate();

  // Capture search deep-link once on mount (before effects that default to 1st item)
  const pendingNav = useRef<InventoryNavState | null>(
    (location.state as InventoryNavState | null) ?? null,
  );
  /** While true, never auto-pick filteredItems[0] */
  const selectionLocked = useRef(
    !!(
      (location.state as InventoryNavState | null)?.itemId ||
      (location.state as InventoryNavState | null)?.collectionId
    ),
  );

  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    () => {
      const nav = location.state as InventoryNavState | null;
      if (nav?.collectionId) return nav.collectionId;
      return collections[0]?.id || "";
    },
  );
  const [collectionSearch, setCollectionSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedItemId, setSelectedItemId] = useState<string>(() => {
    const nav = location.state as InventoryNavState | null;
    return nav?.itemId || "";
  });

  // Apply / re-apply deep-link when collections load or location.state arrives
  useEffect(() => {
    const state =
      pendingNav.current || (location.state as InventoryNavState | null);
    if (!state?.collectionId && !state?.itemId) return;
    if (!collections.length) return;

    let applied = false;

    if (state.collectionId) {
      const col = collections.find((c) => c.id === state.collectionId);
      if (col) {
        setSelectedCollectionId(col.id);
        setCollectionSearch("");
        setSelectedCategory("ALL");
        setItemSearch("");
        applied = true;

        if (state.itemId) {
          const hasItem = col.data.some((i) => i.id === state.itemId);
          if (hasItem) {
            setSelectedItemId(state.itemId);
            selectionLocked.current = true;
          }
        } else {
          // Collection only: unlock so first item of that collection can be chosen
          selectionLocked.current = false;
          setSelectedItemId("");
        }
      }
    } else if (state.itemId) {
      // Find collection containing the item
      const col = collections.find((c) =>
        c.data.some((i) => i.id === state.itemId),
      );
      if (col) {
        setSelectedCollectionId(col.id);
        setCollectionSearch("");
        setSelectedCategory("ALL");
        setItemSearch("");
        setSelectedItemId(state.itemId!);
        selectionLocked.current = true;
        applied = true;
      }
    }

    if (applied) {
      pendingNav.current = null;
      // Clear router state without remounting / resetting local state
      if (location.state) {
        navigate(location.pathname, { replace: true, state: null });
      }
    }
  }, [collections, location.state, location.pathname, navigate]);

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
    // Prefer explicit selection (including deep-link) over "first in list"
    const byId = selectedItemId
      ? activeCollection.data.find((item) => item.id === selectedItemId)
      : undefined;
    if (byId) return byId;
    // Fall back to first filtered, then first in catalog
    return filteredItems[0] || activeCollection.data[0] || null;
  }, [activeCollection, selectedItemId, filteredItems]);

  // Default selection only when nothing locked and no valid selection
  useEffect(() => {
    if (selectionLocked.current) {
      // Unlock once the target item is visible in the active catalog
      if (
        selectedItemId &&
        activeCollection?.data.some((i) => i.id === selectedItemId)
      ) {
        // Keep lock until user changes selection manually? Unlock after settled
        // so list filters can work; selection already applied.
        selectionLocked.current = false;
      }
      return;
    }

    if (filteredItems.length === 0) {
      return;
    }

    const stillValid =
      selectedItemId && filteredItems.some((i) => i.id === selectedItemId);
    if (stillValid) return;

    // Only auto-select first when selection is empty or invalid for current filter
    setSelectedItemId(filteredItems[0].id);
  }, [filteredItems, selectedItemId, activeCollection]);

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
    <div className="flex h-screen w-full gap-1.5 overflow-hidden bg-background p-1.5 text-foreground xl:gap-2 xl:p-2">
      {/* Left Pane: Collections Catalog */}
      <div className="flex h-full w-52 shrink-0 flex-col gap-3 overflow-hidden rounded-lg border border-sidebar-border bg-sidebar p-3 shadow-sm lg:w-56 xl:w-64 xl:gap-4 xl:p-4">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5 xl:gap-2">
            <Layers className="size-4 text-foreground xl:size-5" />
            <h2 className="text-sm font-bold tracking-tight text-foreground xl:text-lg">
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
                    selectionLocked.current = false;
                    setSelectedCollectionId(c.id);
                    setSelectedCategory("ALL");
                    setItemSearch("");
                    // First item of the new catalog is chosen by the default-select effect
                    setSelectedItemId("");
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
      {/* Middle Pane: Collection items */}
      <div className="flex h-full w-52 shrink-0 flex-col gap-3 overflow-hidden rounded-lg border border-sidebar-border bg-sidebar p-3 shadow-sm lg:w-56 xl:w-64 xl:gap-4 xl:p-4">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex min-w-0 items-center gap-1.5 xl:gap-2">
            <Box className="size-4 shrink-0 text-foreground xl:size-5" />
            <h2 className="truncate text-sm font-bold tracking-tight text-foreground xl:text-lg">
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
                    selectionLocked.current = false;
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
      <div className="h-full min-w-0 flex-1 overflow-hidden rounded-lg border border-sidebar-border bg-background shadow-xs">
        <ScrollArea className="h-full p-4 sm:p-5 xl:p-6">
          {activeCollection && activeItem ? (
            <div className="w-full">
              {/* Header Title Section */}
              <div className="mb-4 xl:mb-6">
                <h2 className="mb-0.5 text-xl font-black text-foreground xl:mb-1 xl:text-3xl">
                  {getItemTitle(activeItem, activeCollection)}
                </h2>
                <p className="text-xs font-medium text-muted-foreground xl:text-sm">
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
              <div className="mb-4 h-px bg-sidebar-border xl:mb-6" />

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
