/**
 * Compatibility hook: read the full app dataset from Redux.
 * Prefer useAppSelector for slice-specific reads in new code.
 */
import { useAppSelector } from "@/lib/store/hooks";
import type { AppData } from "./local-data";

export function useAppData(): { data: AppData } {
  const collections = useAppSelector((s) => s.inventory.collections);
  const ledger = useAppSelector((s) => s.ledger.entries);
  const receipts = useAppSelector((s) => s.receipts.list);
  const settings = useAppSelector((s) => s.settings);

  const data: AppData = {
    meta: {
      appVersion: settings.appVersion,
      exportDate: settings.exportDate,
      userCurrency: settings.userCurrency,
      organizationName: settings.organizationName,
      isNewUser: settings.isNewUser,
    },
    collections,
    ledger,
    receipts,
  };

  return { data };
}
