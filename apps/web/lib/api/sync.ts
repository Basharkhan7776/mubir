import { DatabaseSchema } from "@mudir/types";
import { loadData, saveData, type AppData } from "@/lib/local-data";

function getServerBase(): string {
  const base =
    (import.meta.env.VITE_SERVER_URL as string) || "http://localhost:3001";
  return base.replace(/\/$/, "");
}

export type SyncStatus = {
  hasData: boolean;
  lastSync?: string | null;
};

/** GET /api/sync/status — call only from Login/Open bootstrap, not on page switches. */
export async function fetchSyncStatus(): Promise<SyncStatus> {
  const res = await fetch(`${getServerBase()}/api/sync/status`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to check sync status: ${res.status} ${text}`);
  }

  const json = await res.json();
  return {
    hasData: !!json.hasData,
    lastSync: json.lastSync ?? null,
  };
}

/** GET /api/sync/download — pull remote data into localStorage and return it. */
export async function downloadAppData(serverUrl?: string): Promise<AppData> {
  const base = (serverUrl || getServerBase()).replace(/\/$/, "");
  const res = await fetch(`${base}/api/sync/download`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to download data: ${res.status} ${text}`);
  }

  const json = await res.json();
  const remoteData: DatabaseSchema | null = json.data ?? null;

  if (!remoteData) {
    return loadData();
  }

  saveData(remoteData);
  window.dispatchEvent(new CustomEvent("mudir-data-updated"));
  return remoteData;
}

export const syncQueryKeys = {
  all: ["sync"] as const,
  status: ["sync", "status"] as const,
  download: ["sync", "download"] as const,
};
