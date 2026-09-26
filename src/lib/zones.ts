/**
 * The four zones, in walking order.
 *
 * Deliberately a plain module and not part of TrailMap: that file is
 * `"use client"`, and a server component importing a value out of a client
 * module gets a client reference rather than the value. `ZONES.length` read
 * back as 0 on the server, which silently closed the completion screen's gate.
 *
 * `claimMethod` mirrors the zones table and only decides which sheet to show.
 * The server re-checks it before writing a stamp, so this copy can never grant
 * anything on its own. The coordinates are pin tips on the 402x874 canvas.
 */
export const ZONES = [
  { slug: "goods", name: "굿즈", stage: 1, x: 172, y: 676, claimMethod: "game" },
  { slug: "church", name: "교회", stage: 2, x: 287, y: 527, claimMethod: "code" },
  {
    slug: "clothing",
    name: "의류",
    stage: 3,
    x: 215,
    y: 352,
    claimMethod: "game",
  },
  // Hangs just under the summit flag (pole y 75~103) rather than in the sky
  // above it. That sky is where the phone puts its clock and its notch, and
  // with the artwork now running to the top of the screen the pin was landing
  // behind the Dynamic Island.
  {
    slug: "experience",
    name: "체험",
    stage: 4,
    x: 288,
    y: 145,
    claimMethod: "code",
  },
] as const;

export type Zone = (typeof ZONES)[number];

export type ZoneSlug = (typeof ZONES)[number]["slug"];
