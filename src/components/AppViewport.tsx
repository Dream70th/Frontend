import type { ReactNode } from "react";

/**
 * The app's outermost box: exactly the screen, edge to edge, always. Nothing
 * here preserves the design's aspect ratio — overlays (menus, sheets, games)
 * lay themselves out in percentages and simply fill whatever shape the device
 * hands them, so there are never bars around the app.
 *
 * Artwork that *does* have a fixed ratio goes inside an `ArtStage`, which fits
 * it into this box on its own terms.
 *
 * Fixed rather than `h-dvh`: on iOS the viewport units and `height: 100%`
 * disagree by the height of the translucent status bar, and a box measured in
 * either could come up short of the screen. A fixed box pinned to all four
 * edges is the screen by definition.
 */
export function AppViewport({ children }: { children: ReactNode }) {
  return (
    <div className="bg-letterbox fixed inset-0 overflow-hidden">{children}</div>
  );
}
