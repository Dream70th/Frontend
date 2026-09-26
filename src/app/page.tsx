import { MapScreen } from "@/components/MapScreen";
import { ZONES } from "@/lib/zones";
import { clearedZonesOf, getMyProgress } from "@/lib/progress";
import {
  getDepartments,
  getVisitorProfile,
  hasEnteredRaffle,
  hasSignedUp,
} from "@/lib/profile";

export default async function MainMapPage() {
  const [progress, profile, departments, entered] = await Promise.all([
    getMyProgress(),
    getVisitorProfile(),
    getDepartments(),
    hasEnteredRaffle(),
  ]);

  const clearedZones = clearedZonesOf(progress);

  return (
    <MapScreen
      clearedZones={clearedZones}
      // The claim refreshes this page, so the fourth stamp lands here first.
      // ZONES comes from lib rather than TrailMap: a server component that
      // imports a value out of a "use client" module is handed a client
      // reference instead, and this read silently came back as 0.
      needsCelebration={
        clearedZones.length === ZONES.length && !profile.celebrated
      }
      // Nothing to pick from means the table is unreachable; sending someone
      // to an unanswerable form would trap them on it.
      needsSignup={!hasSignedUp(profile) && departments.length > 0}
      needsGuide={!profile.seenGuide}
      displayName={profile.displayName}
      departments={departments}
      hasEnteredRaffle={entered}
    />
  );
}
