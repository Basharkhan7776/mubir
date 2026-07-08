import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import AppLayout from "./app-layout";
import { authClient, signOut } from "@/lib/auth-client";
import { downloadData, hasLocalData, STORAGE_KEY } from "@/lib/local-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedApp() {
  const navigate = useNavigate();

  // IMPORTANT: If data is already in localStorage, render the app UI *immediately*
  // (no skeleton / no blocking "fetch"). We still validate session + server data
  // in the background. Only show loading skeleton on first bootstrap (no local data yet).
  // This avoids unnecessary reloads for returning users who already have localStorage data.
  const [isLoading, setIsLoading] = useState(() => !hasLocalData());

  useEffect(() => {
    const protectRoute = async () => {
      try {
        // 1. Check authentication (session cookie from better-auth)
        const { data: session } = await authClient.getSession();

        if (!session?.user) {
          navigate("/");
          return;
        }

        // 2. Check if server has data for this user (using status endpoint)
        // This enforces: web app is only for users who have uploaded from the mobile app.
        const base = (import.meta.env.VITE_SERVER_URL as string) || "http://localhost:3001";
        const statusUrl = `${base.replace(/\/$/, "")}/api/sync/status`;

        let hasDataOnServer = false;
        try {
          const statusRes = await fetch(statusUrl, {
            method: "GET",
            credentials: "include",
          });
          if (statusRes.ok) {
            const status = await statusRes.json();
            hasDataOnServer = !!status.hasData;
          }
        } catch (e) {
          console.warn("Could not check server status", e);
        }

        if (!hasDataOnServer) {
          // As requested: log out from web + clear local + alert + go home
          try {
            await signOut();
          } catch {}
          localStorage.removeItem(STORAGE_KEY);

          alert(
            "You don't have any data on the server yet.\n\n" +
              "Please download the Mudir mobile app, log in there, " +
              "upload your data from the app, and then return here to fetch/sync it."
          );
          navigate("/");
          return;
        }

        // 3. Only download from server if we had *no* local data at mount time.
        // Returning users with localStorage data get instant UI (no reload).
        // Use the explicit "Sync (Download from server)" button in Settings when you want fresh data.
        if (!hasLocalData()) {
          try {
            await downloadData();
          } catch (fetchErr) {
            console.warn("Could not download data from server", fetchErr);
          }
        }

        // If we were showing skeleton (first-time bootstrap), stop now.
        // If we had local data, isLoading was already false — this is a no-op.
        setIsLoading(false);
      } catch (err) {
        console.error("Protection check failed", err);
        navigate("/");
      }
    };

    protectRoute();
  }, [navigate]);

  if (isLoading) {
    // Show skeleton only while bootstrapping (no prior localStorage data)
    return (
      <div className="flex h-screen w-screen bg-background">
        {/* Fake sidebar skeleton */}
        <div className="hidden w-64 border-r border-border p-4 md:block">
          <Skeleton className="mb-6 h-8 w-3/4" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Main content skeleton */}
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
