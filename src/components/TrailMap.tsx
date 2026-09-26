"use client";

import { ArtStage } from "@/components/ArtStage";
import { TrailBackdrop } from "@/components/TrailBackdrop";
import { TrailPath } from "@/components/TrailPath";
import { TrailWalker } from "@/components/TrailWalker";
import { xPct, yPct } from "@/lib/design-coordinates";

// What the map can afford to lose off each end when a screen is the wrong
// shape. Above stage 4's pin (top y=95 at the peak of its float) there is only
// sky; below the walkers' feet (y=756) only forest. Both stop well short of
// the content: the top has to leave room for the status bar as well, since the
// artwork now runs underneath it.
const TOP_SLACK = 40;
const BOTTOM_SLACK = 874 - 774;

// Pin tips sit on these points (402x874 design canvas): the forest ledge,
// the campsite tent, the castle gate, and the summit flag.
//
// `claimMethod` mirrors the zones table and only decides which sheet to show.
// The server re-checks it before writing a stamp, so this copy can never grant
// anything on its own.
export const ZONES = [
  { slug: "goods", name: "굿즈", stage: 1, x: 172, y: 676, claimMethod: "game" },
  { slug: "church", name: "교회", stage: 2, x: 287, y: 527, claimMethod: "code" },
  { slug: "clothing", name: "의류", stage: 3, x: 215, y: 352, claimMethod: "game" },
  // Hangs just under the summit flag (pole y 75~103) rather than in the sky
  // above it. That sky is where the phone puts its clock and its notch, and
  // with the artwork now running to the top of the screen the pin was landing
  // behind the Dynamic Island.
  { slug: "experience", name: "체험", stage: 4, x: 288, y: 145, claimMethod: "code" },
] as const;

export type Zone = (typeof ZONES)[number];

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
  zone: Zone;
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
  characterZone,
}: {
  selectedZone: ZoneSlug | null;
  onSelectZone: (slug: ZoneSlug | null) => void;
  /** Zone the pair is standing at, or null for the trailhead. */
  characterZone: ZoneSlug | null;
  /** Zones the visitor has already stamped. Server-owned — comes from the
   *  `get_my_progress` RPC; never computed on the client. */
  clearedZones: readonly ZoneSlug[];
}) {
  const characterAt =
    ZONES.find((candidate) => candidate.slug === characterZone) ?? null;

  return (
    <ArtStage
      topSlack={TOP_SLACK}
      bottomSlack={BOTTOM_SLACK}
      bleed="/images/trail-map-bg.png"
    >
      <span className="sr-only">
        굿즈, 교회, 의류, 체험 4개 구역을 지나는 트레일 지도
      </span>
      <TrailBackdrop />

      <TrailPath />

      <TrailWalker target={characterAt} />

      {ZONES.map((zone, index) => (
        <StagePin
          key={zone.slug}
          zone={zone}
          index={index}
          isCleared={clearedZones.includes(zone.slug)}
          isSelected={selectedZone === zone.slug}
          onSelect={() => onSelectZone(zone.slug)}
        />
      ))}
    </ArtStage>
  );
}
