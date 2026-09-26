"use client";

import { useEffect, useState } from "react";
import { AppViewport } from "@/components/AppViewport";
import {
  TrailMap,
  ZONES,
  type Zone,
  type ZoneSlug,
} from "@/components/TrailMap";
import { SideMenu } from "@/components/SideMenu";
import { ZoneSheet } from "@/components/ZoneSheet";
import { GameShell } from "@/components/GameShell";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import { AboutPopup } from "@/components/AboutPopup";
import { AboutLogo } from "@/components/AboutLogo";
import { Contributors } from "@/components/Contributors";
import { StampBoard } from "@/components/StampBoard";
import { WALK_MS } from "@/components/TrailWalker";

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
  const [info, setInfo] = useState<
    "popup" | "logo" | "contributors" | "board" | null
  >(null);

  // The pair always start at the trailhead, where the Figma frame puts them —
  // every visit opens on the same picture, whatever has been stamped already.
  const [characterZone, setCharacterZone] = useState<ZoneSlug | null>(null);
  const [pendingZone, setPendingZone] = useState<ZoneSlug | null>(null);

  // Tap a pin, the pair walks there, and the sheet opens once they arrive.
  useEffect(() => {
    if (!pendingZone) return;

    const open = setTimeout(() => {
      setSelectedZone(pendingZone);
      setPendingZone(null);
    }, WALK_MS);

    return () => clearTimeout(open);
  }, [pendingZone]);

  function handlePinTap(slug: ZoneSlug | null) {
    if (slug === null || pendingZone) return;
    setCharacterZone(slug);
    setPendingZone(slug);
  }

  const zone =
    ZONES.find((candidate) => candidate.slug === selectedZone) ?? null;

  return (
    <AppViewport>
      <TrailMap
        selectedZone={selectedZone ?? pendingZone}
        onSelectZone={handlePinTap}
        clearedZones={clearedZones}
        characterZone={characterZone}
      />
      <SideMenu
        onOpenGuide={() => setGuide("manual")}
        onOpenPopupIntro={() => setInfo("popup")}
        onOpenLogoIntro={() => setInfo("logo")}
        onOpenContributors={() => setInfo("contributors")}
        onOpenStampBoard={() => setInfo("board")}
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
      {info === "board" && (
        <StampBoard clearedZones={clearedZones} onClose={() => setInfo(null)} />
      )}
      {info === "popup" && <AboutPopup onClose={() => setInfo(null)} />}
      {info === "logo" && <AboutLogo onClose={() => setInfo(null)} />}
      {info === "contributors" && (
        <Contributors onClose={() => setInfo(null)} />
      )}
    </AppViewport>
  );
}
