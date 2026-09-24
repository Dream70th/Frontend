import { MapScreen } from "@/components/MapScreen";
import { clearedZonesOf, getMyProgress } from "@/lib/progress";

export default async function MainMapPage() {
  const progress = await getMyProgress();

  return <MapScreen clearedZones={clearedZonesOf(progress)} />;
}
