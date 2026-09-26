import type { ReactNode } from "react";

const DESIGN_WIDTH = 402;
const DESIGN_HEIGHT = 874;

/**
 * Fits the fixed 402:874 design onto any screen, filling it edge to edge where
 * that can be done without losing anything that matters.
 *
 * The frame hangs from below the status bar and is allowed to overrun the
 * bottom of the screen, which is clipped. That trade is deliberate: the top of
 * the canvas carries stage 4's pin and the summit flag — exactly where a phone
 * puts its clock — while the bottom 11% is empty ground below the walkers, so
 * losing some of it costs nothing.
 *
 * On a phone that is enough to fill the screen completely. On a tablet, where
 * the screen is far wider than 402:874, the frame stops growing once the crop
 * budget is spent and `backdrop` fills the sides with a blurred copy of the
 * screen's own artwork, so the margins read as part of the picture.
 */

/**
 * Share of the design's height that may be cropped off the bottom. The walkers
 * stand with their feet at y=773, so anything past ~11.5% would start clipping
 * them; 11% keeps a few pixels in hand.
 */
const BOTTOM_CROP_BUDGET = 0.11;

export function LetterboxViewport({
  children,
  backdrop,
}: {
  children: ReactNode;
  /** Image to bleed behind the frame — usually this screen's background. */
  backdrop?: string;
}) {
  const safeTop = "env(safe-area-inset-top, 0px)";
  const availableHeight = `calc(100dvh - ${safeTop})`;
  const frameWidth = `min(100dvw, calc(${availableHeight} * ${DESIGN_WIDTH} / ${DESIGN_HEIGHT} / ${1 - BOTTOM_CROP_BUDGET}))`;

  return (
    <div className="bg-letterbox relative h-dvh w-full overflow-hidden">
      {backdrop && (
        <div
          aria-hidden
          className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
          style={{ backgroundImage: `url('${backdrop}')` }}
        />
      )}

      <div
        className="absolute left-1/2 -translate-x-1/2 overflow-hidden bg-black"
        style={{
          top: safeTop,
          width: frameWidth,
          height: `calc(${frameWidth} * ${DESIGN_HEIGHT} / ${DESIGN_WIDTH})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
