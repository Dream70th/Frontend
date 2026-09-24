"use client";

import { useState } from "react";
import { LetterboxViewport } from "@/components/LetterboxViewport";
import { TrailMap, type ZoneSlug } from "@/components/TrailMap";
import { SideMenu } from "@/components/SideMenu";

/**
 * Interactive shell for the main map. Zone selection is local UI state;
 * `clearedZones` is fetched on the server and passed down, never derived here.
 */
export function MapScreen({
  clearedZones,
}: {
  clearedZones: readonly ZoneSlug[];
}) {
  const [selectedZone, setSelectedZone] = useState<ZoneSlug | null>(null);

  return (
    <LetterboxViewport>
      <TrailMap
        selectedZone={selectedZone}
        onSelectZone={setSelectedZone}
        clearedZones={clearedZones}
      />
      <SideMenu />
    </LetterboxViewport>
  );
}
