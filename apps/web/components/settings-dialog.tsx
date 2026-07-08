import { useTheme } from "next-themes";
import { LogOut, Moon, RefreshCcw, Settings, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { DialogContent, DialogTitle } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";

export function SettingsDialog() {
  const { theme, setTheme } = useTheme();

  return (
    <DialogContent>
      <DialogTitle className="flex items-center gap-2">
        <Settings className="size-4" />
        <span>Settings</span>
      </DialogTitle>
      <Separator />
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
      <Button
        variant="ghost"
        className="flex w-full items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <RefreshCcw />
          Sync
        </div>
      </Button>
      <Button
        variant="ghost"
        className="flex w-full items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <LogOut />
          Sign out
        </div>
      </Button>
    </DialogContent>
  );
}
