import { MapScreen } from "@/components/MapScreen";
import { clearedZonesOf, getMyProgress } from "@/lib/progress";
import { hasSeenGuide } from "@/lib/profile";

export default async function MainMapPage() {
  const [progress, seenGuide] = await Promise.all([
    getMyProgress(),
    hasSeenGuide(),
  ]);

  return (
    <MapScreen
      clearedZones={clearedZonesOf(progress)}
      needsGuide={!seenGuide}
    />
  );
}
