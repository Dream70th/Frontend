import type { CSSProperties, ReactNode } from "react";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "@/lib/design-coordinates";

/** Height over width of the 402x874 design canvas. */
const NATURAL = DESIGN_HEIGHT / DESIGN_WIDTH;

/**
 * Lays a piece of fixed-ratio artwork over the whole screen and gives its
 * children the 402x874 design coordinate system to sit in.
 *
 * Screens are never 402:874, so something has to give. In order of preference:
 *
 *  1. **Crop.** Every frame has some slack — sky above the topmost pin, ground
 *     below the walkers — that can run off the screen unnoticed. `topSlack` and
 *     `bottomSlack` say how many design pixels are expendable at each end, and
 *     the crop is spent from the bottom first, because there is far more to
 *     spare down there.
 *  2. **Stretch.** Once the slack is gone, the art is allowed to go up to
 *     `maxStretch` off its true proportions. At 9% nobody can tell without the
 *     original beside it, and it buys the last few percent of fit.
 *  3. **Bleed.** Only a screen far wider than a phone (a tablet, a desktop)
 *     gets past both, and there the artwork's own edge column is stretched
 *     outward to meet the screen — no bars, no blur, just more of the same
 *     scenery. On every phone this is zero pixels wide.
 */
export function ArtStage({
  topSlack,
  bottomSlack,
  maxStretch = 0.09,
  bleed,
  children,
}: {
  /** Design pixels at the top of the canvas that may be cropped away. */
  topSlack: number;
  /** Design pixels at the bottom of the canvas that may be cropped away. */
  bottomSlack: number;
  /** How far the art may depart from its true proportions, as a fraction. */
  maxStretch?: number;
  /** Image whose edge columns fill the sides on screens too wide to cover. */
  bleed?: string;
  children: ReactNode;
}) {
  // The tallest the art may be drawn: any taller and the crop would eat past
  // the slack. Never shorter than the screen, or a gap would open at the foot.
  const capFactor = DESIGN_HEIGHT / (DESIGN_HEIGHT - topSlack - bottomSlack);
  const height = `max(var(--app-height), min(calc(100dvw * ${NATURAL}), calc(var(--app-height) * ${capFactor})))`;

  // Full screen width, unless that would distort the art past the limit.
  const minRatio = NATURAL * (1 - maxStretch);
  const maxRatio = NATURAL * (1 + maxStretch);
  const width = `clamp(calc(var(--art-h) / ${maxRatio}), 100dvw, calc(var(--art-h) / ${minRatio}))`;

  // Slide the art up only once the bottom slack has been used up, so the top —
  // where the summit and stage 4 live — is the last thing to go.
  const keep = 1 - bottomSlack / DESIGN_HEIGHT;
  const top = `min(0px, calc(var(--app-height) - var(--art-h) * ${keep}))`;

  const bleedStyle: CSSProperties = {
    backgroundImage: `url('${bleed}')`,
    // 200x the panel's own width, so what gets stretched outward is a single
    // column of the artwork. Mirrored, so it meets the frame seamlessly.
    backgroundSize: "20000% 100%",
    backgroundRepeat: "no-repeat",
  };

  return (
    <div
      className="absolute left-1/2"
      style={
        {
          "--art-h": height,
          // 0 또는 음수. 화면 위쪽이 그림의 어디에 걸려 있는지를 뜻하므로,
          // 자식이 화면 바닥까지의 거리를 재려면 이 값이 필요하다
          // (화면 바닥 = --app-height - --art-top, 이 상자 기준).
          "--art-top": top,
          width,
          height: "var(--art-h)",
          top: "var(--art-top)",
          transform: "translateX(-50%)",
        } as CSSProperties
      }
    >
      {bleed && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-full w-screen -scale-x-100"
            style={{ ...bleedStyle, backgroundPosition: "left top" }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-full w-screen -scale-x-100"
            style={{ ...bleedStyle, backgroundPosition: "right top" }}
          />
        </>
      )}
      {children}
    </div>
  );
}
