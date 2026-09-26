import { CatchGame } from "@/games/CatchGame";
import { MemoryGame } from "@/games/MemoryGame";
import type { GameModule } from "@/games/types";
import type { ZoneSlug } from "@/lib/zones";

/**
 * Which module each game zone plays. The sheet falls back to a "준비 중" notice
 * for any game zone with no module here, and the server keeps rules and
 * sessions per zone, so adding one is a single entry.
 */
export const GAME_MODULES: Partial<Record<ZoneSlug, GameModule>> = {
  goods: {
    title: "굿즈 받기",
    howTo: "떨어지는 굿즈를 바구니로 받으세요",
    Component: CatchGame,
  },
  clothing: {
    title: "코디 기억하기",
    howTo: "반짝이는 순서를 기억해서 똑같이 누르세요",
    Component: MemoryGame,
  },
};
