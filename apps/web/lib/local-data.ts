import { DatabaseSchema } from "@mudir/types";
import { seedData } from "./seed"; // only for initial fallback

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

export async function downloadData(serverUrl?: string): Promise<AppData> {
  const base = serverUrl || (import.meta.env.VITE_SERVER_URL as string) || "http://localhost:3001";
  const url = `${base.replace(/\/$/, "")}/api/sync/download`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include", // important for better-auth cookies
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to download data: ${res.status} ${text}`);
  }

  const json = await res.json();

  // Server returns { data: DatabaseSchema, lastSync, ... } or { data: null, message }
  const remoteData: AppData | null = json.data ?? null;

  if (!remoteData) {
    // No remote data yet — keep local or return empty
    const current = loadData();
    return current;
  }

  saveData(remoteData);

  // Notify listeners (other components using the hook)
  window.dispatchEvent(new CustomEvent("mudir-data-updated"));

  return remoteData;
}

// Optional helper to get fresh copy without side effects
export function getCurrentData(): AppData {
  return loadData();
}
