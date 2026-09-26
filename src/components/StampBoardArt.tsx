import { ZONES, type ZoneSlug } from "@/lib/zones";

/**
 * The board artwork from Figma (56:31), with a stamp per zone.
 *
 * The design ships five finished boards — empty, then one more stamp at each
 * step — but a visitor does not necessarily collect them in that order, so
 * picking a board by how many stamps they have would show the wrong slots
 * filled. The four stamps were pulled out of those images instead, by diffing
 * each one against the step before it, and they go on individually. Composing
 * all four back over the empty board reproduces the finished artwork exactly.
 */
const STAMPS: Record<ZoneSlug, string> = {
  goods: "/images/board/stamp-goods.png",
  church: "/images/board/stamp-church.png",
  clothing: "/images/board/stamp-clothing.png",
  experience: "/images/board/stamp-experience.png",
};

/** Natural size of the board art, so the frame keeps its proportions. */
const BOARD_RATIO = "824 / 804";

export function StampBoardArt({
  clearedZones,
  className,
  animate = false,
}: {
  clearedZones: readonly ZoneSlug[];
  className?: string;
  /** Press the stamps on one after another — for the completion screen. */
  animate?: boolean;
}) {
  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{ aspectRatio: BOARD_RATIO }}
    >
      <span
        aria-hidden
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/board/board.png')",
          imageRendering: "pixelated",
        }}
      />
      {ZONES.map((zone, index) =>
        clearedZones.includes(zone.slug) ? (
          <span
            key={zone.slug}
            aria-hidden
            className={`absolute inset-0 bg-contain bg-center bg-no-repeat ${
              animate ? "animate-stamp-in" : ""
            }`}
            style={{
              backgroundImage: `url('${STAMPS[zone.slug]}')`,
              imageRendering: "pixelated",
              animationDelay: animate ? `${0.25 + index * 0.22}s` : undefined,
            }}
          />
        ) : null,
      )}
    </div>
  );
}
