import type { ReactNode } from "react";
import { ViewportProbe } from "@/components/ViewportProbe";

/**
 * The app's outermost box: exactly the screen, edge to edge, always. Nothing
 * here preserves the design's aspect ratio — overlays (menus, sheets, games)
 * lay themselves out in percentages and simply fill whatever shape the device
 * hands them, so there are never bars around the app.
 *
 * Artwork that *does* have a fixed ratio goes inside an `ArtStage`, which fits
 * it into this box on its own terms.
 *
 * Sized with --app-height rather than a viewport unit: on an iPhone home-screen
 * app, dvh comes back a status bar shorter than the screen. See globals.css.
 */
export function AppViewport({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-letterbox fixed inset-x-0 top-0 overflow-hidden"
      style={{ height: "var(--app-height)" }}
    >
      {children}
      <ViewportProbe />
    </div>
  );
}
