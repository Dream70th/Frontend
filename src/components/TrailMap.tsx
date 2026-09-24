"use client";

import Image from "next/image";
import { xPct, yPct } from "@/lib/design-coordinates";

export const ZONES = [
  {
    slug: "goods",
    name: "굿즈",
    dot: { x: 219, y: 531 },
    label: { x: 115, y: 558, width: 108, height: 43 },
  },
  {
    slug: "church",
    name: "교회",
    dot: { x: 309, y: 462 },
    label: { x: 165, y: 437, width: 108, height: 43 },
  },
  {
    slug: "clothing",
    name: "의류",
    dot: { x: 201, y: 365 },
    label: { x: 210, y: 313, width: 108, height: 43 },
  },
  {
    slug: "experience",
    name: "체험",
    dot: { x: 179, y: 271 },
    label: { x: 62, y: 212, width: 108, height: 43 },
  },
] as const;

export type ZoneSlug = (typeof ZONES)[number]["slug"];

const START_POINT = { x: 115, y: 645 };
const PEAK_POINT = { x: 282, y: 103 };

function CheckpointDot({
  x,
  y,
  filled,
}: {
  x: number;
  y: number;
  filled: boolean;
}) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: xPct(x),
        top: yPct(y),
        width: xPct(18),
        height: yPct(18),
      }}
    >
      <Image
        src={
          filled
            ? "/images/checkpoint-dot-filled.svg"
            : "/images/checkpoint-dot-outline.svg"
        }
        alt=""
        fill
        aria-hidden
      />
    </div>
  );
}

function ZoneLabelButton({
  zone,
  onSelect,
}: {
  zone: (typeof ZONES)[number];
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="border-trail-orange absolute flex items-center justify-center rounded-[9px] border bg-white text-[12px] font-bold tracking-[1.44px] text-black"
      style={{
        left: xPct(zone.label.x),
        top: yPct(zone.label.y),
        width: xPct(zone.label.width),
        height: yPct(zone.label.height),
      }}
    >
      {zone.name}
    </button>
  );
}

export function TrailMap({
  selectedZone,
  onSelectZone,
}: {
  selectedZone: ZoneSlug | null;
  onSelectZone: (slug: ZoneSlug | null) => void;
}) {
  const visibleZones =
    selectedZone === null
      ? ZONES
      : ZONES.filter((zone) => zone.slug === selectedZone);

  return (
    <div className="relative h-full w-full">
      <Image
        src="/images/trail-map-bg.png"
        alt="굿즈, 교회, 의류, 체험 4개 구역을 지나는 트레일 지도"
        fill
        priority
        className="object-cover"
      />

      <div
        className="absolute"
        style={{
          left: xPct(72.94),
          top: yPct(109),
          width: xPct(237.063),
          height: yPct(531.5),
        }}
      >
        <div className="absolute -inset-x-[1.05%] -inset-y-[0.47%]">
          <Image src="/images/trail-path.svg" alt="" fill aria-hidden />
        </div>
      </div>

      <CheckpointDot x={START_POINT.x} y={START_POINT.y} filled />
      <CheckpointDot x={PEAK_POINT.x} y={PEAK_POINT.y} filled />

      {ZONES.map((zone) => (
        <CheckpointDot
          key={zone.slug}
          x={zone.dot.x}
          y={zone.dot.y}
          filled={selectedZone !== null && selectedZone !== zone.slug}
        />
      ))}

      {visibleZones.map((zone) => (
        <ZoneLabelButton
          key={zone.slug}
          zone={zone}
          onSelect={() =>
            onSelectZone(selectedZone === zone.slug ? null : zone.slug)
          }
        />
      ))}

      {selectedZone !== null && (
        <button
          type="button"
          onClick={() => onSelectZone(null)}
          className="absolute top-4 left-4 rounded-full bg-white/90 px-4 py-2 text-[12px] font-bold text-black shadow"
        >
          ← 지도로 돌아가기
        </button>
      )}
    </div>
  );
}
