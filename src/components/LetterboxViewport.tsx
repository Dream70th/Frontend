import type { ReactNode } from "react";

const DESIGN_WIDTH = 402;
const DESIGN_HEIGHT = 874;

/**
 * Centers a fixed 402:874 (design) frame on any viewport. The layout is never
 * cropped or stretched — the leftover space is filled instead.
 *
 * Two kinds of leftover exist and they are handled differently:
 *
 *  - The device's safe areas (iOS status bar, home indicator). The page is
 *    served with `viewport-fit: cover`, so artwork reaches the very edges of
 *    the screen, but the frame itself is inset by the insets so no pin or
 *    control ever sits under the clock.
 *  - Whatever remains when the screen's aspect differs from the design's.
 *
 * `backdrop` fills both with a blurred, over-scaled copy of the screen's own
 * artwork, so the margins read as part of the picture rather than as bars.
 */
export function LetterboxViewport({
  children,
  backdrop,
}: {
  children: ReactNode;
  /** Image to bleed behind the frame — usually this screen's background. */
  backdrop?: string;
}) {
  // The height the frame may actually use, once the system chrome is excluded.
  const safeHeight =
    "calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))";

  return (
    <div
      className="bg-letterbox relative flex min-h-dvh w-full items-center justify-center overflow-hidden"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {backdrop && (
        <div
          aria-hidden
          className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
          style={{ backgroundImage: `url('${backdrop}')` }}
        />
      )}

      <div
        className="relative overflow-hidden bg-black shadow-2xl"
        style={{
          aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}`,
          width: `min(100dvw, calc(${safeHeight} * ${DESIGN_WIDTH} / ${DESIGN_HEIGHT}))`,
          height: `min(${safeHeight}, calc(100dvw * ${DESIGN_HEIGHT} / ${DESIGN_WIDTH}))`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
