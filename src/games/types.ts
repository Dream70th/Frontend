import type { ComponentType } from "react";

/**
 * What a game reports when its run ends. The server range-checks `score`
 * against the zone's ceiling before it means anything, so a module is free to
 * report honestly and let the backend decide.
 */
export type GameResult = { score: number };

export type GameModuleProps = {
  /** Play time, decided by the server in `start_game`. */
  durationSeconds: number;
  /** Score needed to clear, decided by the server in `start_game`. */
  targetScore: number;
  onFinish: (result: GameResult) => void;
  /** Leave without reporting a run — e.g. "그만두기" from the pause overlay. */
  onAbort: () => void;
};

/**
 * The shell (start → play → finish, session handling, stamping) is shared;
 * a module only has to play and report. See `GameShell`.
 */
export type GameModule = {
  title: string;
  howTo: string;
  Component: ComponentType<GameModuleProps>;
};
