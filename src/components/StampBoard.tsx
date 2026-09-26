"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StampBoardArt } from "@/components/StampBoardArt";
import { ZONES, type ZoneSlug } from "@/lib/zones";

/** The stamp board on its own screen, over the artwork the mini-games use. */

export function StampBoard({
  clearedZones,
  onClose,
  signedUp,
  entered,
  onNeedSignup,
}: {
  clearedZones: readonly ZoneSlug[];
  onClose: () => void;
  /** Whether the visitor has given the name and department the draw needs. */
  signedUp: boolean;
  /** Whether they are already in the draw. */
  entered: boolean;
  /** Opens the signup form for someone who skipped it on their first visit. */
  onNeedSignup: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [justEntered, setJustEntered] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const isEntered = entered || justEntered;

  /**
   * The server re-counts the stamps and re-checks the signup before it writes
   * an entry, so this button cannot talk anyone into the draw on its own.
   */
  async function enter() {
    if (submitting) return;
    if (!signedUp) {
      onNeedSignup();
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("enter_raffle");

    if (rpcError) {
      setError("응모하지 못했어요. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    const result = data as { ok: boolean; status: string };
    if (!result?.ok) {
      setError(
        result?.status === "signup_incomplete"
          ? "참가자 정보를 먼저 입력해주세요."
          : "아직 도장이 모자라요.",
      );
      setSubmitting(false);
      return;
    }

    setJustEntered(true);
    setSubmitting(false);
    router.refresh();
  }

  let label = "도장을 모두 모아주세요";
  if (isEntered) label = "응모 완료";
  else if (complete && !signedUp) label = "정보 입력하고 응모하기";
  else if (complete) label = submitting ? "응모하는 중..." : "경품 응모하기";

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
            {isEntered
              ? "응모가 접수됐어요. 추첨 결과는 따로 안내드립니다."
              : complete
                ? "네 구역을 모두 돌았어요!"
                : `${ZONES.length - collected}개만 더 모으면 경품에 응모할 수 있어요.`}
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center px-4">
          <StampBoardArt
            clearedZones={clearedZones}
            className="w-full max-w-[380px]"
          />
        </div>

        <p className="sr-only">
          {ZONES.map(
            (zone) =>
              `${zone.name} ${clearedZones.includes(zone.slug) ? "완료" : "미완료"}`,
          ).join(", ")}
        </p>

        <div className="px-6 pb-4">
          {error && (
            <p
              role="alert"
              className="mb-2 text-center text-[13px] font-bold text-[#FFD9C2] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
            >
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={() => void enter()}
            disabled={!complete || isEntered || submitting}
            className="w-full rounded-full border-[3px] border-dotted border-[#FF5E00] bg-[#FF5E00] py-3.5 text-base font-bold text-white shadow-[0_4px_0_0_#cc4b00] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#cc4b00] disabled:border-white/30 disabled:bg-black/45 disabled:text-white/55 disabled:shadow-none disabled:active:translate-y-0"
          >
            {label}
          </button>
        </div>
      </div>
    </div>
  );
}
