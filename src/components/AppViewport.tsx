import type { ReactNode } from "react";

/**
 * The app's outermost box: exactly the screen, edge to edge, always. Nothing
 * here preserves the design's aspect ratio — overlays (menus, sheets, games)
 * lay themselves out in percentages and simply fill whatever shape the device
 * hands them, so there are never bars around the app.
 *
 * Artwork that *does* have a fixed ratio goes inside an `ArtStage`, which fits
 * it into this box on its own terms.
 */
export function AppViewport({ children }: { children: ReactNode }) {
  return (
    <div className="bg-letterbox relative h-dvh w-full overflow-hidden">
      {children}
    </div>
  );
}
