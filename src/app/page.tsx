"use client";

import { useState } from "react";
import { LetterboxViewport } from "@/components/LetterboxViewport";
import { TrailMap, type ZoneSlug } from "@/components/TrailMap";

export default function MainMapPage() {
  const [selectedZone, setSelectedZone] = useState<ZoneSlug | null>(null);

  return (
    <LetterboxViewport>
      <TrailMap selectedZone={selectedZone} onSelectZone={setSelectedZone} />
    </LetterboxViewport>
  );
}
