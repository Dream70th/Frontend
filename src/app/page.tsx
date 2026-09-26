import { MapScreen } from "@/components/MapScreen";
import { ZONES } from "@/components/TrailMap";
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

  // TEMPORARY — the completion screen is not appearing and the gate below
  // cannot be read from outside. Remove once we know which half is false.
  const debug = [
    `progress=${progress.length}`,
    `cleared=${clearedZones.length}/${ZONES.length}`,
    `celebrated=${profile.celebrated}`,
    `name=${profile.realName === null ? "null" : `"${profile.realName}"`}`,
    `guide=${profile.seenGuide}`,
    `depts=${departments.length}`,
    `entered=${entered}`,
  ].join(" ");

  return (
    <>
      <p
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 90,
          background: "rgba(0,0,0,0.8)",
          color: "#7CFF9B",
          font: "600 10px/1.5 ui-monospace, monospace",
          textAlign: "center",
          padding: "2px 4px",
          wordBreak: "break-all",
        }}
      >
        {debug}
      </p>
      <MapScreen
        clearedZones={clearedZones}
        // The claim refreshes this page, so the fourth stamp lands here first.
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
    </>
  );
}
