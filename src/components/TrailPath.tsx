// Route traced onto the background artwork's actual terrain: up the forest
// ledge, a switchback west, east across the wooden bridge to the campsite,
// up the grass slope to the castle gate, then the ridge to the summit flag.
// Coordinates are in the 402x874 design canvas.
export const ROUTE =
  "M 172 676 C 150 662, 118 640, 96 612 C 80 592, 64 582, 63 570 " +
  "C 62 560, 82 557, 112 555 C 140 553, 160 552, 181 549 " +
  "C 212 543, 251 536, 287 527 C 296 510, 288 492, 281 472 " +
  "C 276 454, 272 438, 272 421 C 272 403, 266 391, 254 383 " +
  "C 240 374, 226 367, 215 352 C 229 330, 246 317, 254 298 " +
  "C 261 277, 258 247, 265 209 C 271 174, 281 140, 288 112";

export function TrailPath() {
  return (
    <svg
      viewBox="0 0 402 874"
      preserveAspectRatio="none"
      overflow="visible"
      fill="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <path
        d={ROUTE}
        stroke="#000"
        strokeOpacity="0.14"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d={ROUTE}
        stroke="#FF5E00"
        strokeOpacity="0.55"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="10 10"
        className="animate-trail-flow"
      />
    </svg>
  );
}
