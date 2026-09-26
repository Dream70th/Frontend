"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GAME_MODULES } from "@/games";
import type { GameResult } from "@/games/types";
import type { Zone } from "@/components/TrailMap";

type StartResult = {
  ok: boolean;
  status: "started" | "already_claimed" | "not_configured" | "wrong_method" | "unknown_zone";
  session_id?: string;
  duration_seconds?: number;
  target_score?: number;
};

type FinishResult = {
  ok: boolean;
  status:
    | "claimed"
    | "already_claimed"
    | "failed"
    | "too_fast"
    | "expired"
    | "invalid_result"
    | "session_closed"
    | "unknown_session";
  score?: number;
  target_score?: number;
};

type Phase = "intro" | "starting" | "countdown" | "playing" | "submitting" | "result";

const COUNTDOWN_FROM = 3;

/**
 * Shared start → play → finish shell. The module only plays and reports a
 * score; the session, the clock and the stamp all belong to the server.
 */
export function GameShell({
  zone,
  onExit,
}: {
  zone: Zone;
  onExit: () => void;
}) {
  const router = useRouter();
  const gameModule = GAME_MODULES[zone.slug];

  const [phase, setPhase] = useState<Phase>("intro");
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const [rules, setRules] = useState<{ duration: number; target: number } | null>(null);
  const [outcome, setOutcome] = useState<FinishResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const sessionId = useRef<string | null>(null);

  const start = useCallback(async () => {
    setPhase("starting");
    setNotice(null);
    setOutcome(null);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("start_game", {
      zone_slug: zone.slug,
    });

    if (error) {
      setNotice("연결이 불안정합니다. 잠시 후 다시 시도해주세요.");
      setPhase("intro");
      return;
    }

    const result = data as StartResult;

    if (result.status === "already_claimed") {
      setNotice("이미 도장을 받은 구역이에요.");
      setPhase("intro");
      return;
    }

    if (result.status !== "started") {
      setNotice("지금은 게임을 시작할 수 없어요. 운영자에게 문의해주세요.");
      setPhase("intro");
      return;
    }

    sessionId.current = result.session_id ?? null;
    setRules({
      duration: result.duration_seconds ?? 30,
      target: result.target_score ?? 10,
    });
    setCountdown(COUNTDOWN_FROM);
    setPhase("countdown");
  }, [zone.slug]);

  // 3 · 2 · 1 · 시작! — advancing inside the timer (rather than in the effect
  // body) keeps each tick a single render.
  useEffect(() => {
    if (phase !== "countdown") return;
    const timer = setTimeout(() => {
      if (countdown <= 0) setPhase("playing");
      else setCountdown((n) => n - 1);
    }, 800);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  const handleFinish = useCallback(
    async (result: GameResult) => {
      setPhase("submitting");

      const supabase = createClient();
      const { data, error } = await supabase.rpc("finish_game", {
        session_id: sessionId.current,
        result,
      });

      if (error) {
        setOutcome({ ok: false, status: "invalid_result", score: result.score });
        setPhase("result");
        return;
      }

      const finish = data as FinishResult;
      setOutcome(finish);
      setPhase("result");

      if (finish.ok) router.refresh();
    },
    [router],
  );

  if (!gameModule) {
    return null;
  }

  const Game = gameModule.Component;

  return (
    <div
      className={`absolute inset-0 z-20 flex flex-col bg-[#171512] ${
        phase === "playing"
          ? ""
          : "pt-[var(--safe-top)] pb-[var(--safe-bottom)]"
      }`}
    >
      {/* While playing, the whole frame belongs to the game: it fills the
          screen edge to edge, under the status bar and the home indicator, and
          pads its own HUD off them. Insetting the shell here instead would
          leave the game's artwork framed in black bands. */}
      {phase !== "playing" && (
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[11px] font-bold tracking-[0.2em] text-white/40">
            STAGE {zone.stage} · {zone.name}
          </span>
          <button
            type="button"
            onClick={onExit}
            aria-label="게임 닫기"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-5 w-5"
              aria-hidden
            >
              <line x1="6" x2="18" y1="6" y2="18" />
              <line x1="6" x2="18" y1="18" y2="6" />
            </svg>
          </button>
        </div>
      )}

      {phase === "intro" || phase === "starting" ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <h2 className="text-2xl font-bold text-white">{gameModule.title}</h2>
          <p className="mt-3 text-sm font-medium text-white/60">{gameModule.howTo}</p>
          {/* The real numbers arrive with the session; until then stay vague
              rather than promise a target the operator may have retuned. */}
          <p className="mt-1 text-sm font-medium text-white/60">
            {rules
              ? `${rules.duration}초 안에 ${rules.target}개를 받으면 도장!`
              : "제한 시간 안에 목표 개수를 채우면 도장!"}
          </p>

          {notice && (
            <p role="status" className="mt-4 text-[13px] font-semibold text-[#FFB38A]">
              {notice}
            </p>
          )}

          <button
            type="button"
            onClick={start}
            disabled={phase === "starting"}
            className="mt-8 w-full max-w-[260px] rounded-full border-[3px] border-dotted border-[#FF5E00] bg-[#FF5E00] py-3.5 text-base font-bold text-white shadow-[0_4px_0_0_#cc4b00] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#cc4b00] disabled:opacity-60"
          >
            {phase === "starting" ? "준비 중..." : "시작하기"}
          </button>
        </div>
      ) : phase === "countdown" ? (
        <div className="flex flex-1 items-center justify-center">
          <span className="text-7xl font-bold text-[#FF5E00]">
            {countdown > 0 ? countdown : "시작!"}
          </span>
        </div>
      ) : phase === "playing" && rules ? (
        <Game
          durationSeconds={rules.duration}
          targetScore={rules.target}
          onFinish={handleFinish}
          onAbort={onExit}
        />
      ) : phase === "submitting" ? (
        <div className="flex flex-1 items-center justify-center">
          <span className="text-base font-semibold text-white/60">기록 확인 중...</span>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          {outcome?.ok ? (
            <>
              <p className="text-3xl font-bold text-[#FF5E00]">미션 성공!</p>
              <p className="mt-3 text-sm font-medium text-white/60">
                {outcome.score}개를 받았어요
              </p>
              <button
                type="button"
                onClick={onExit}
                className="mt-8 w-full max-w-[260px] rounded-full border-[3px] border-dotted border-[#FF5E00] bg-[#FF5E00] py-3.5 text-base font-bold text-white shadow-[0_4px_0_0_#cc4b00] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#cc4b00]"
              >
                지도로 돌아가기
              </button>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-white">아쉬워요!</p>
              <p className="mt-3 text-sm font-medium text-white/60">
                {outcome?.status === "failed"
                  ? `${outcome.score}개를 받았어요. ${outcome.target_score}개가 필요해요.`
                  : outcome?.status === "expired"
                    ? "너무 오래 멈춰 있었어요. 다시 도전해주세요."
                    : "기록을 확인하지 못했어요. 다시 한 번 해주세요."}
              </p>
              <button
                type="button"
                onClick={start}
                className="mt-8 w-full max-w-[260px] rounded-full border-[3px] border-dotted border-[#FF5E00] bg-[#FF5E00] py-3.5 text-base font-bold text-white shadow-[0_4px_0_0_#cc4b00] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#cc4b00]"
              >
                다시 도전
              </button>
              <button
                type="button"
                onClick={onExit}
                className="mt-3 text-sm font-semibold text-white/50"
              >
                지도로 돌아가기
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
