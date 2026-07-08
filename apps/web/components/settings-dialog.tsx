import { useTheme } from "next-themes";
import { LogOut, Moon, RefreshCcw, Settings, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { DialogContent, DialogTitle } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { authClient, signInWithGoogle, signOut, GOOGLE_CLIENT_ID } from "@/lib/auth-client";
import { downloadData, loadData, saveData, STORAGE_KEY } from "@/lib/local-data";
import { DatabaseSchema } from "@mudir/types";

export function SettingsDialog() {
  const { theme, setTheme } = useTheme();
  const [session, setSession] = useState<any>(null);
  const [data, setData] = useState<DatabaseSchema | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Load session + local data on mount
  useEffect(() => {
    const load = async () => {
      try {
        const sess = await authClient.getSession();
        setSession(sess?.data ?? null);
      } catch {
        setSession(null);
      }
      setData(loadData());
    };
    load();
  }, []);

  const handleSync = async () => {
    if (!session) {
      alert("Please sign in first to download data from server.");
      return;
    }
    setIsSyncing(true);
    try {
      const fresh = await downloadData();
      setData(fresh);
      alert("Data downloaded from server!");
    } catch (err: any) {
      console.error(err);
      alert("Download failed: " + (err?.message || "Please sign in again"));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignIn = () => {
    console.log("Using Google OAuth client for web:", GOOGLE_CLIENT_ID || "server config");
    // Redirects to server auth handler, then back to /app
    signInWithGoogle("/app");
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      // Clear local app data on logout (optional but clean)
      localStorage.removeItem(STORAGE_KEY);
      setSession(null);
      setData(null);
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const meta = data?.meta;

  return (
    <DialogContent>
      <DialogTitle className="flex items-center gap-2">
        <Settings className="size-4" />
        <span>Settings</span>
      </DialogTitle>
      <Separator />

      {/* Theme */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-sm">
          {theme === "dark" ? (
            <Moon className="size-4" />
          ) : (
            <Sun className="size-4" />
          )}
          <span>Dark mode</span>
        </div>
        <Switch
          checked={theme === "dark"}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
      </div>

      <Separator />

      {/* User / Meta info */}
      {session?.user ? (
        <div className="px-1 text-sm space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="size-4" />
            <span className="font-medium text-foreground">{session.user.name || session.user.email}</span>
          </div>
          {meta?.organizationName && (
            <div>Organization: <span className="font-medium">{meta.organizationName}</span></div>
          )}
          {meta?.userCurrency && (
            <div>Currency: <span className="font-medium">{meta.userCurrency}</span></div>
          )}
          {meta?.exportDate && (
            <div className="text-xs text-muted-foreground">
              Local data: {new Date(meta.exportDate).toLocaleString()}
            </div>
          )}
        </div>
      ) : (
        <div className="px-1 text-sm text-muted-foreground">Not signed in</div>
      )}

      <Separator />

      {/* Sync (Download) */}
      <Button
        variant="ghost"
        className="flex w-full items-center justify-between gap-2"
        onClick={handleSync}
        disabled={isSyncing}
      >
        <div className="flex items-center gap-2">
          <RefreshCcw className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Syncing..." : "Sync (Download from server)"}
        </div>
      </Button>

      {/* Logout */}
      <Button
        variant="ghost"
        className="flex w-full items-center justify-between gap-2"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        <div className="flex items-center gap-2">
          <LogOut />
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </div>
      </Button>

      {/* Sign in (when not logged in) */}
      {!session?.user && (
        <Button
          variant="default"
          className="w-full"
          onClick={handleSignIn}
        >
          Sign in with Google
        </Button>
      )}

      {/* OAuth Client ID (for reference / Google Console setup) */}
      {GOOGLE_CLIENT_ID && (
        <div className="text-[10px] text-muted-foreground px-1 mt-2">
          Using Google OAuth client: {GOOGLE_CLIENT_ID.substring(0, 20)}...
        </div>
      )}
    </DialogContent>
  );
}
