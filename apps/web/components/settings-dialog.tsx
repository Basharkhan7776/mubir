import { useTheme } from "next-themes";
import { LogOut, Moon, RefreshCcw, Settings, Sun, User } from "lucide-react";
import { Button } from "./ui/button";
import { DialogContent, DialogTitle } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import {
  signInWithGoogle,
  signOut,
  GOOGLE_CLIENT_ID,
} from "@/lib/auth-client";
import { clearLocalData } from "@/lib/local-data";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { logout as logoutAction } from "@/lib/store/slices/authSlice";
import { useDownloadDataMutation } from "@/lib/hooks/use-sync";
import { useState } from "react";

export function SettingsDialog() {
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isLoggedIn = useAppSelector((s) => s.auth.isLoggedIn);
  const isSyncing = useAppSelector((s) => s.auth.isSyncing);
  const lastSync = useAppSelector((s) => s.auth.lastSync);
  const organizationName = useAppSelector((s) => s.settings.organizationName);
  const userCurrency = useAppSelector((s) => s.settings.userCurrency);
  const exportDate = useAppSelector((s) => s.settings.exportDate);

  const downloadMutation = useDownloadDataMutation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSync = async () => {
    if (!isLoggedIn) {
      alert("Please sign in first to download data from server.");
      return;
    }
    try {
      await downloadMutation.mutateAsync();
      alert("Data downloaded from server!");
    } catch (err: any) {
      console.error(err);
      alert("Download failed: " + (err?.message || "Please sign in again"));
    }
  };

  const handleSignIn = () => {
    console.log(
      "Using Google OAuth client for web:",
      GOOGLE_CLIENT_ID || "server config",
    );
    signInWithGoogle("/app");
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      clearLocalData();
      dispatch(logoutAction());
      window.location.href = "/";
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const syncing = isSyncing || downloadMutation.isPending;

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

      {/* User / Meta info from Redux */}
      {user ? (
        <div className="px-1 text-sm space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="size-4" />
            <span className="font-medium text-foreground">
              {user.name || user.email}
            </span>
          </div>
          {organizationName && (
            <div>
              Organization:{" "}
              <span className="font-medium">{organizationName}</span>
            </div>
          )}
          {userCurrency && (
            <div>
              Currency: <span className="font-medium">{userCurrency}</span>
            </div>
          )}
          {(exportDate || lastSync) && (
            <div className="text-xs text-muted-foreground">
              Local data:{" "}
              {new Date(exportDate || lastSync || "").toLocaleString()}
            </div>
          )}
        </div>
      ) : (
        <div className="px-1 text-sm text-muted-foreground">Not signed in</div>
      )}

      <Separator />

      {/* Sync (Download) via TanStack Query mutation */}
      <Button
        variant="ghost"
        className="flex w-full items-center justify-between gap-2"
        onClick={handleSync}
        disabled={syncing}
      >
        <div className="flex items-center gap-2">
          <RefreshCcw className={syncing ? "animate-spin" : ""} />
          {syncing ? "Syncing..." : "Sync (Download from server)"}
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

      {!user && (
        <Button variant="default" className="w-full" onClick={handleSignIn}>
          Sign in with Google
        </Button>
      )}

      {GOOGLE_CLIENT_ID && (
        <div className="text-[10px] text-muted-foreground px-1 mt-2">
          Using Google OAuth client: {GOOGLE_CLIENT_ID.substring(0, 20)}...
        </div>
      )}
    </DialogContent>
  );
}
