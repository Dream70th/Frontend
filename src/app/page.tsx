"use client";

import { useState } from "react";
import { LetterboxViewport } from "@/components/LetterboxViewport";
import { TrailMap, type ZoneSlug } from "@/components/TrailMap";
import { SideMenu } from "@/components/SideMenu";

export default function MainMapPage() {
  const [selectedZone, setSelectedZone] = useState<ZoneSlug | null>(null);

  return (
    <LetterboxViewport>
      <TrailMap
        selectedZone={selectedZone}
        onSelectZone={setSelectedZone}
        // Stays empty until Phase 2 exposes `get_my_progress`; stamps are
        // server-owned and must never be decided on the client.
        clearedZones={[]}
      />
      <SideMenu />
    </LetterboxViewport>
  );
}
