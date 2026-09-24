"use client";

import { TrailPath } from "@/components/TrailPath";
import { xPct, yPct } from "@/lib/design-coordinates";

// Pin tips sit on these points (402x874 design canvas): the forest ledge,
// the campsite tent, the castle gate, and the summit flag.
export const ZONES = [
  { slug: "goods", name: "굿즈", stage: 1, x: 172, y: 676 },
  { slug: "church", name: "교회", stage: 2, x: 287, y: 527 },
  { slug: "clothing", name: "의류", stage: 3, x: 215, y: 352 },
  // Tip sits above the summit flag (pole y 75~103) so the pin doesn't cover it.
  { slug: "experience", name: "체험", stage: 4, x: 288, y: 70 },
] as const;

export type ZoneSlug = (typeof ZONES)[number]["slug"];

const PIN_WIDTH = 30;
const PIN_HEIGHT = 40;

function StagePin({
  zone,
  index,
  isCleared,
  isSelected,
  onSelect,
}: {
  zone: (typeof ZONES)[number];
  index: number;
  isCleared: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${zone.stage}번 구역 ${zone.name}${isCleared ? " (완료)" : ""}`}
      aria-pressed={isSelected}
      className="absolute -translate-x-1/2 -translate-y-full"
      style={{
        left: xPct(zone.x),
        top: yPct(zone.y),
        width: xPct(PIN_WIDTH),
        height: yPct(PIN_HEIGHT),
      }}
    >
      <span
        className="animate-pin-float block h-full w-full"
        style={{ animationDelay: `${index * 0.35}s` }}
      >
        <svg
          viewBox="0 0 30 40"
          className={`h-full w-full origin-bottom drop-shadow-md transition-transform ${
            isSelected ? "scale-110" : ""
          }`}
          style={{ opacity: isCleared ? 1 : 0.75 }}
        >
          <path
            d="M15 39C15 39 28 23.5 28 14A13 13 0 1 0 2 14C2 23.5 15 39 15 39Z"
            fill={isCleared ? "#FF5E00" : "#8C877C"}
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <text
            x="15"
            y="19"
            textAnchor="middle"
            fontSize="14"
            fontWeight="700"
            fill="#FFFFFF"
            fontFamily="var(--font-inter, sans-serif)"
          >
            {zone.stage}
          </text>
        </svg>
      </span>
    </button>
  );
}

export function TrailMap({
  selectedZone,
  onSelectZone,
  clearedZones,
}: {
  selectedZone: ZoneSlug | null;
  onSelectZone: (slug: ZoneSlug | null) => void;
  /** Zones the visitor has already stamped. Server-owned — comes from the
   *  `get_my_progress` RPC; never computed on the client. */
  clearedZones: readonly ZoneSlug[];
}) {
  return (
    <div className="relative h-full w-full">
      <span className="sr-only">
        굿즈, 교회, 의류, 체험 4개 구역을 지나는 트레일 지도
      </span>
      <video
        className="absolute inset-0 h-full w-full object-cover"
        style={{ imageRendering: "pixelated" }}
        poster="/images/trail-map-bg.png"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
      >
        <source src="/images/trail-map-bg.webm" type="video/webm" />
        <source src="/images/trail-map-bg.mp4" type="video/mp4" />
      </video>

      <TrailPath />

      {ZONES.map((zone, index) => (
        <StagePin
          key={zone.slug}
          zone={zone}
          index={index}
          isCleared={clearedZones.includes(zone.slug)}
          isSelected={selectedZone === zone.slug}
          onSelect={() =>
            onSelectZone(selectedZone === zone.slug ? null : zone.slug)
          }
        />
      ))}
    </div>
  );
}
