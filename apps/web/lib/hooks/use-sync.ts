import { useMutation } from "@tanstack/react-query";
import {
  downloadAppData,
  fetchSyncStatus,
  type SyncStatus,
} from "@/lib/api/sync";
import { applyAppData } from "@/lib/store";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  setIsSyncing,
  setLastSync,
  setServerDataVerified,
} from "@/lib/store/slices/authSlice";
import type { AppData } from "@/lib/local-data";

/**
 * Manual status check — used from landing Login/Open only.
 * Does NOT auto-run on mount or route changes.
 */
export function useSyncStatusMutation() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationKey: ["sync", "status"],
    mutationFn: fetchSyncStatus,
    onSuccess: (status: SyncStatus) => {
      if (status.hasData) {
        dispatch(setServerDataVerified(true));
        if (status.lastSync) {
          dispatch(setLastSync(status.lastSync));
        }
      }
    },
  });
}

/** Download remote data into localStorage + Redux (Settings sync button). */
export function useDownloadDataMutation() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationKey: ["sync", "download"],
    mutationFn: async (): Promise<AppData> => {
      dispatch(setIsSyncing(true));
      try {
        return await downloadAppData();
      } finally {
        dispatch(setIsSyncing(false));
      }
    },
    onSuccess: (data) => {
      applyAppData(data);
      dispatch(setServerDataVerified(true));
      dispatch(setLastSync(data.meta?.exportDate ?? new Date().toISOString()));
    },
  });
}
