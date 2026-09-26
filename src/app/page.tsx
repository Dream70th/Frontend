import { MapScreen } from "@/components/MapScreen";
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

  return (
    <MapScreen
      clearedZones={clearedZonesOf(progress)}
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
