"use client";

import { useEffect, useRef, useState } from "react";
import { ROUTE } from "@/components/TrailPath";
import { xPct, yPct } from "@/lib/design-coordinates";

/** How long the pair takes to walk to a stop, however far it is. */
export const WALK_MS = 900;

const SIZE = { width: 90, height: 81 };

/**
 * The route the pair walks. It is the dotted trail, with a short approach
 * curve prepended: the trail itself starts at 굿즈, but the pair begins below
 * it at the trailhead, where the original artwork had them standing.
 */
const WALK_PATH =
  "M 100 773 C 120 750, 152 714, 172 676 " +
  ROUTE.replace(/^M\s+172\s+676\s*/, "");

/** Walk beside the dotted line rather than on top of it, so the pin stays readable. */
const LATERAL_OFFSET = 20;

/** Length along the path whose point sits closest to (x, y). */
function nearestLength(path: SVGPathElement, x: number, y: number) {
  const total = path.getTotalLength();
  const steps = 500;
  let best = 0;
  let bestDistance = Infinity;

  for (let step = 0; step <= steps; step++) {
    const length = (step / steps) * total;
    const point = path.getPointAtLength(length);
    const distance = (point.x - x) ** 2 + (point.y - y) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = length;
    }
  }

  return best;
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/**
 * The two walkers, moving along the trail itself rather than cutting across it.
 * `target` is a point in design coordinates (a zone's pin); null is the
 * trailhead.
 */
export function TrailWalker({
  target,
}: {
  target: { x: number; y: number } | null;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const lengthRef = useRef<number | null>(null);
  const frameRef = useRef(0);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);

  const targetX = target?.x ?? null;
  const targetY = target?.y ?? null;

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const to =
      targetX === null || targetY === null
        ? 0
        : nearestLength(path, targetX, targetY);

    // First placement lands instantly; later ones walk.
    const from = lengthRef.current ?? to;
    const duration = lengthRef.current === null ? 0 : WALK_MS;
    const started = performance.now();

    cancelAnimationFrame(frameRef.current);

    function step(now: number) {
      const progress =
        duration === 0 ? 1 : Math.min((now - started) / duration, 1);
      const length = from + (to - from) * easeInOut(progress);
      lengthRef.current = length;

      const at = path!.getPointAtLength(length);
      setPoint({ x: at.x, y: at.y });

      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    }

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [targetX, targetY]);

  return (
    <>
      {/* Geometry source only — getPointAtLength works regardless of how the
          SVG is laid out, so it is kept out of the way. */}
      <svg viewBox="0 0 402 874" className="absolute h-0 w-0 overflow-hidden" aria-hidden>
        <path ref={pathRef} d={WALK_PATH} fill="none" />
      </svg>

      {point && (
        <span
          aria-hidden
          className="absolute bg-contain bg-bottom bg-no-repeat"
          style={{
            left: xPct(point.x - LATERAL_OFFSET - SIZE.width / 2),
            top: yPct(point.y - SIZE.height),
            width: xPct(SIZE.width),
            height: yPct(SIZE.height),
            backgroundImage: "url('/images/character.png')",
            imageRendering: "pixelated",
          }}
        />
      )}
    </>
  );
}
