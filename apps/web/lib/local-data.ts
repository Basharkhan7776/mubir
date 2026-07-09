import { DatabaseSchema } from "@mudir/types";
import { seedData } from "./seed";

export const STORAGE_KEY = "mudir-web-data";

export type AppData = DatabaseSchema;

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AppData;
    }
  } catch (e) {
    console.warn("Failed to load local data, using fallback", e);
  }
  // First time: seed as baseline (user can sync to replace)
  return { ...seedData };
}

export function hasLocalData(): boolean {
  try {
    return !!localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

export function saveData(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save local data", e);
  }
}

export function clearLocalData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear local data", e);
  }
}

/** @deprecated Prefer downloadAppData from @/lib/api/sync + useDownloadDataMutation */
export async function downloadData(serverUrl?: string): Promise<AppData> {
  const { downloadAppData } = await import("./api/sync");
  return downloadAppData(serverUrl);
}

export function getCurrentData(): AppData {
  return loadData();
}
