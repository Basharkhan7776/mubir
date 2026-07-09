import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import AppLayout from "./app-layout";
import { authClient, signOut } from "@/lib/auth-client";
import { clearLocalData, hasLocalData } from "@/lib/local-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setUser,
  setServerDataVerified,
  setIsBootstrapping,
  logout as logoutAction,
} from "@/lib/store/slices/authSlice";
import { applyAppData, hydrateStoreFromLocal } from "@/lib/store";
import { downloadAppData, fetchSyncStatus } from "@/lib/api/sync";

/**
 * Protected shell for /app/*.
 *
 * - Checks session only (cheap cookie session).
 * - Does NOT call /api/sync/status on every page switch.
 * - Status is checked on landing Login/Open (Hero).
 * - Exception: first visit after OAuth with no local data and status not yet
 *   verified in this SPA session — one-time bootstrap status + download.
 */
export default function ProtectedApp() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const serverDataVerified = useAppSelector((s) => s.auth.serverDataVerified);
  const bootstrappedRef = useRef(false);

  // Instant UI when localStorage already has data
  const [isLoading, setIsLoading] = useState(() => !hasLocalData());

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    const protectRoute = async () => {
      dispatch(setIsBootstrapping(true));
      try {
        const { data: session } = await authClient.getSession();

        if (!session?.user) {
          navigate("/");
          return;
        }

        dispatch(
          setUser({
            id: session.user.id,
            email: session.user.email ?? null,
            name: session.user.name ?? null,
            image: session.user.image ?? null,
          }),
        );

        // Always hydrate Redux from local data when available (no network)
        if (hasLocalData()) {
          hydrateStoreFromLocal();
          setIsLoading(false);
          return;
        }

        // No local data: only happens after fresh OAuth or cleared storage.
        // Run status once for this case (not on subsequent page switches —
        // bootstrappedRef + serverDataVerified prevent repeats).
        if (!serverDataVerified) {
          let hasDataOnServer = false;
          try {
            const status = await fetchSyncStatus();
            hasDataOnServer = status.hasData;
            if (hasDataOnServer) {
              dispatch(setServerDataVerified(true));
            }
          } catch (e) {
            console.warn("Could not check server status (OAuth bootstrap)", e);
          }

          if (!hasDataOnServer) {
            try {
              await signOut();
            } catch {
              /* ignore */
            }
            clearLocalData();
            dispatch(logoutAction());
            alert(
              "You don't have any data on the server yet.\n\n" +
                "Please download the Mudir mobile app, log in there, " +
                "upload your data from the app, and then return here to fetch/sync it.",
            );
            navigate("/");
            return;
          }
        }

        try {
          const data = await downloadAppData();
          applyAppData(data);
        } catch (fetchErr) {
          console.warn("Could not download data from server", fetchErr);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Protection check failed", err);
        navigate("/");
      } finally {
        dispatch(setIsBootstrapping(false));
      }
    };

    protectRoute();
    // Intentionally run once per mount of the /app layout (not on child route changes).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen bg-background">
        <div className="hidden w-64 border-r border-border p-4 md:block">
          <Skeleton className="mb-6 h-8 w-3/4" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
            <Skeleton className="h-[320px]" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
