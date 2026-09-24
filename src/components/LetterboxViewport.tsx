import type { ReactNode } from "react";

const DESIGN_WIDTH = 402;
const DESIGN_HEIGHT = 874;

/**
 * Centers a fixed 402:874 (design) frame on any viewport, letterboxing the
 * leftover space instead of cropping or stretching the Figma layout.
 */
export function LetterboxViewport({ children }: { children: ReactNode }) {
  return (
    <div className="bg-letterbox flex min-h-dvh w-full items-center justify-center">
      <div
        className="relative overflow-hidden bg-black shadow-2xl"
        style={{
          aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}`,
          width: `min(100dvw, calc(100dvh * ${DESIGN_WIDTH} / ${DESIGN_HEIGHT}))`,
          height: `min(100dvh, calc(100dvw * ${DESIGN_HEIGHT} / ${DESIGN_WIDTH}))`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
