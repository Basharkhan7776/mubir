/**
 * Router location.state payloads for deep-linking from dashboard search
 * into Inventory / Ledger / Receipts with the target entity selected.
 */

export type InventoryNavState = {
  source?: "search";
  collectionId?: string;
  itemId?: string;
  /** Optional: pre-fill item list search */
  itemQuery?: string;
};

export type LedgerNavState = {
  source?: "search";
  organizationId?: string;
  transactionId?: string;
  /** Optional: pre-fill party search */
  partyQuery?: string;
};

export type ReceiptsNavState = {
  source?: "search";
  receiptId?: string;
  /** Optional: pre-fill receipts search */
  receiptQuery?: string;
};

export function inventoryNav(
  collectionId: string,
  itemId?: string,
  itemQuery?: string,
): InventoryNavState {
  return { source: "search", collectionId, itemId, itemQuery };
}

export function ledgerNav(
  organizationId: string,
  transactionId?: string,
  partyQuery?: string,
): LedgerNavState {
  return { source: "search", organizationId, transactionId, partyQuery };
}

export function receiptsNav(
  receiptId: string,
  receiptQuery?: string,
): ReceiptsNavState {
  return { source: "search", receiptId, receiptQuery };
}
