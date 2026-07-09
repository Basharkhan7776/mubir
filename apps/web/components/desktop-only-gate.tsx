import { Info, Laptop, Smartphone } from "lucide-react";
import Logo from "@/assets/logo.png";

/**
 * Full-screen notice when viewport is below `lg` (1024px).
 * Web app is desktop-only; mobile users should use the native app.
 */
export function DesktopOnlyGate() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <img
          src={Logo}
          alt="Mudir"
          className="size-14 rounded-xl border border-border p-1.5"
        />

        <div className="flex size-12 items-center justify-center rounded-full border border-border bg-muted/50">
          <Info className="size-6 text-foreground" strokeWidth={2} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Desktop experience only
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            This web app is designed for larger screens. Please open Mudir on a{" "}
            <span className="font-medium text-foreground">laptop or desktop</span>{" "}
            (1024px or wider), or install the{" "}
            <span className="font-medium text-foreground">mobile application</span>{" "}
            for your device.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left">
            <Laptop className="size-5 shrink-0 text-foreground" />
            <div>
              <div className="text-sm font-semibold">Use a laptop</div>
              <div className="text-xs text-muted-foreground">
                Open mudir.basharkhan.com on desktop
              </div>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left">
            <Smartphone className="size-5 shrink-0 text-foreground" />
            <div>
              <div className="text-sm font-semibold">Mobile app</div>
              <div className="text-xs text-muted-foreground">
                Install Mudir on your phone
              </div>
            </div>
          </div>
        </div>

        <a
          href="/"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to home
        </a>
      </div>
    </div>
  );
}
