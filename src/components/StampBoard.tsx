"use client";

import { useEffect } from "react";
import { ZONES, type ZoneSlug } from "@/components/TrailMap";

/**
 * The stamp board from Figma (56:31), on its own screen rather than tucked into
 * the menu drawer, over the same artwork the mini-games use.
 *
 * The design ships five finished boards — empty, then one more stamp at each
 * step — but a visitor does not necessarily collect them in that order, so
 * picking a board by how many stamps they have would show the wrong slots
 * filled. The four stamps were pulled out of those images instead, by diffing
 * each one against the step before it, and they go on individually. Composing
 * all four back over the empty board reproduces the finished artwork exactly.
 */
const STAMPS: Record<ZoneSlug, string> = {
  goods: "/images/board/stamp-goods.png",
  church: "/images/board/stamp-church.png",
  clothing: "/images/board/stamp-clothing.png",
  experience: "/images/board/stamp-experience.png",
};

/** Natural size of the board art, so the frame keeps its proportions. */
const BOARD_RATIO = "824 / 804";

export function StampBoard({
  clearedZones,
  onClose,
  onEnter,
}: {
  clearedZones: readonly ZoneSlug[];
  onClose: () => void;
  /**
   * Starts the raffle entry. Phase 6 is not built — there is no consent screen
   * and nothing on the server records an entry — so until it exists this is
   * left undefined and the button stays disabled rather than pretending.
   */
  onEnter?: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const collected = ZONES.filter((zone) =>
    clearedZones.includes(zone.slug),
  ).length;
  const complete = collected === ZONES.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="내 도장판"
      className="absolute inset-0 z-30 bg-cover bg-bottom"
      style={{
        backgroundImage: "url('/images/goods/bg.png')",
        imageRendering: "pixelated",
      }}
    >
      <div
        className="absolute inset-x-0 flex flex-col"
        style={{ top: "var(--safe-top)", bottom: "var(--safe-bottom)" }}
      >
        <div className="flex items-center justify-between p-3">
          <span className="w-8" aria-hidden />
          <h2 className="text-[15px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            내 도장판
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-4 w-4"
              aria-hidden
            >
              <line x1="6" x2="18" y1="6" y2="18" />
              <line x1="6" x2="18" y1="18" y2="6" />
            </svg>
          </button>
        </div>

        {/* Everything about the count sits above the board, so the board
            itself reads as one picture and the eye lands on the tally first. */}
        <div className="px-6 text-center">
          <p className="text-2xl font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] tabular-nums">
            {collected}
            <span className="text-base font-semibold text-white/75">
              {" / "}
              {ZONES.length}
            </span>
          </p>
          <p className="mt-1 text-[13px] leading-relaxed font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            {complete
              ? "네 구역을 모두 돌았어요!"
              : `${ZONES.length - collected}개만 더 모으면 경품에 응모할 수 있어요.`}
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center px-4">
          <div
            className="relative w-full max-w-[380px]"
            style={{ aspectRatio: BOARD_RATIO }}
          >
            <span
              aria-hidden
              className="absolute inset-0 bg-contain bg-center bg-no-repeat"
              style={{
                backgroundImage: "url('/images/board/board.png')",
                imageRendering: "pixelated",
              }}
            />
            {ZONES.map((zone) =>
              clearedZones.includes(zone.slug) ? (
                <span
                  key={zone.slug}
                  aria-hidden
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url('${STAMPS[zone.slug]}')`,
                    imageRendering: "pixelated",
                  }}
                />
              ) : null,
            )}
          </div>
        </div>

        <p className="sr-only">
          {ZONES.map(
            (zone) =>
              `${zone.name} ${clearedZones.includes(zone.slug) ? "완료" : "미완료"}`,
          ).join(", ")}
        </p>

        <div className="px-6 pb-4">
          <button
            type="button"
            onClick={onEnter}
            disabled={!complete || !onEnter}
            className="w-full rounded-full border-[3px] border-dotted border-[#FF5E00] bg-[#FF5E00] py-3.5 text-base font-bold text-white shadow-[0_4px_0_0_#cc4b00] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#cc4b00] disabled:border-white/30 disabled:bg-black/45 disabled:text-white/55 disabled:shadow-none disabled:active:translate-y-0"
          >
            {complete ? "경품 응모하기" : "도장을 모두 모아주세요"}
          </button>
        </div>
      </div>
    </div>
  );
}
