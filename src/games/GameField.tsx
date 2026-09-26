import type { ReactNode } from "react";

/**
 * The box a game lays its design coordinates out in: the screen, minus the
 * status bar and the home indicator.
 *
 * The artwork behind it still runs to the edges of the screen — only the parts
 * that have to stay readable and reachable live in here. Without it the games
 * measure their percentages against the raw screen, and on a phone with a notch
 * everything lands a status bar's worth too high: the score chip ended up
 * underneath the round's instruction line.
 */
export function GameField({ children }: { children: ReactNode }) {
  return (
    <div
      className="absolute inset-x-0"
      style={{ top: "var(--safe-top)", bottom: "var(--safe-bottom)" }}
    >
      {children}
    </div>
  );
}
