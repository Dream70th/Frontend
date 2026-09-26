"use client";

import { useState } from "react";
import { LetterboxViewport } from "@/components/LetterboxViewport";
import { TrailMap, ZONES, type Zone, type ZoneSlug } from "@/components/TrailMap";
import { SideMenu } from "@/components/SideMenu";
import { ZoneSheet } from "@/components/ZoneSheet";
import { GameShell } from "@/components/GameShell";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import { AboutPopup } from "@/components/AboutPopup";
import { AboutLogo } from "@/components/AboutLogo";
import { Contributors } from "@/components/Contributors";

/**
 * Interactive shell for the main map. Zone selection is local UI state;
 * `clearedZones` is fetched on the server and passed down, never derived here.
 */
export function MapScreen({
  clearedZones,
  needsGuide,
}: {
  clearedZones: readonly ZoneSlug[];
  /** First visit — show the guide before the map, and record it on close. */
  needsGuide: boolean;
}) {
  const [selectedZone, setSelectedZone] = useState<ZoneSlug | null>(null);
  const [playingZone, setPlayingZone] = useState<Zone | null>(null);
  // "first" also writes onboarded_at on close; "manual" is a re-read from the menu.
  const [guide, setGuide] = useState<"first" | "manual" | null>(
    needsGuide ? "first" : null,
  );
  const [info, setInfo] = useState<"popup" | "logo" | "contributors" | null>(
    null,
  );
  const zone = ZONES.find((candidate) => candidate.slug === selectedZone) ?? null;

  return (
    <LetterboxViewport>
      <TrailMap
        selectedZone={selectedZone}
        onSelectZone={setSelectedZone}
        clearedZones={clearedZones}
      />
      <SideMenu
        onOpenGuide={() => setGuide("manual")}
        onOpenPopupIntro={() => setInfo("popup")}
        onOpenLogoIntro={() => setInfo("logo")}
        onOpenContributors={() => setInfo("contributors")}
      />
      <ZoneSheet
        zone={zone}
        isCleared={zone ? clearedZones.includes(zone.slug) : false}
        onClose={() => setSelectedZone(null)}
        onStartGame={() => {
          setPlayingZone(zone);
          setSelectedZone(null);
        }}
      />
      {playingZone && (
        <GameShell zone={playingZone} onExit={() => setPlayingZone(null)} />
      )}
      {guide && (
        <OnboardingGuide
          markSeen={guide === "first"}
          onClose={() => setGuide(null)}
        />
      )}
      {info === "popup" && <AboutPopup onClose={() => setInfo(null)} />}
      {info === "logo" && <AboutLogo onClose={() => setInfo(null)} />}
      {info === "contributors" && (
        <Contributors onClose={() => setInfo(null)} />
      )}
    </LetterboxViewport>
  );
}
