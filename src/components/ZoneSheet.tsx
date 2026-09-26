"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GAME_MODULES } from "@/games";
import type { Zone } from "@/components/TrailMap";

/** Shape returned by the `claim_code_stamp` RPC. */
type ClaimResult = {
  ok: boolean;
  status:
    | "claimed"
    | "already_claimed"
    | "invalid_code"
    | "locked"
    | "code_not_set"
    | "wrong_method"
    | "unknown_zone";
  remaining_attempts?: number;
  retry_after_seconds?: number;
};

export function ZoneSheet({
  zone,
  isCleared,
  onClose,
  onStartGame,
}: {
  zone: Zone | null;
  isCleared: boolean;
  onClose: () => void;
  onStartGame: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep showing the last zone while the sheet slides back down.
  const [shown, setShown] = useState<Zone | null>(zone);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [lockedFor, setLockedFor] = useState(0);

  const [openedZone, setOpenedZone] = useState<Zone | null>(zone);

  const isOpen = zone !== null;

  // Reset the form when a different zone is opened. Adjusting state during
  // render (rather than in an effect) avoids a flash of the previous zone's
  // error message.
  if (zone && zone !== openedZone) {
    setOpenedZone(zone);
    setShown(zone);
    setCode("");
    setMessage(null);
    setClaimed(false);
  }

  // Count the lockout down so the visitor can see when to try again.
  useEffect(() => {
    if (lockedFor <= 0) return;
    const timer = setInterval(() => setLockedFor((n) => Math.max(n - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [lockedFor]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const needsCode = shown?.claimMethod === "code";
  const hasGame = shown ? GAME_MODULES[shown.slug] !== undefined : false;

  // Focus the input only once the sheet has finished sliding up, and never let
  // the browser scroll to reach it: while the sheet is still translated off the
  // bottom, focusing it scrolls the letterbox frame (overflow-hidden is still
  // programmatically scrollable) and the map visibly jolts.
  useEffect(() => {
    if (!isOpen || !needsCode || isCleared) return;
    const timer = setTimeout(
      () => inputRef.current?.focus({ preventScroll: true }),
      320,
    );
    return () => clearTimeout(timer);
  }, [isOpen, needsCode, isCleared]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!shown || isSubmitting || lockedFor > 0) return;

    setIsSubmitting(true);
    setMessage(null);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("claim_code_stamp", {
      zone_slug: shown.slug,
      code,
    });

    setIsSubmitting(false);

    if (error) {
      setMessage("연결이 불안정합니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const result = data as ClaimResult;

    switch (result.status) {
      case "claimed":
      case "already_claimed":
        setClaimed(true);
        setCode("");
        // Re-fetch the server's progress so the pin behind the sheet lights up.
        router.refresh();
        break;
      case "invalid_code": {
        const left = result.remaining_attempts ?? 0;
        setMessage(
          left > 0
            ? `비밀번호가 맞지 않아요. ${left}번 더 시도할 수 있어요.`
            : "비밀번호가 맞지 않아요. 한 번 더 틀리면 잠시 잠겨요.",
        );
        setCode("");
        break;
      }
      case "locked":
        setLockedFor(result.retry_after_seconds ?? 60);
        setMessage(null);
        setCode("");
        break;
      case "code_not_set":
        setMessage("아직 준비되지 않은 구역이에요. 운영자에게 문의해주세요.");
        break;
      default:
        setMessage("지금은 도장을 받을 수 없어요. 운영자에게 문의해주세요.");
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={shown ? `${shown.name} 구역` : undefined}
        aria-hidden={!isOpen}
        className={`absolute inset-x-0 bottom-0 rounded-t-3xl border-t-[3px] border-dotted border-[#FF5E00] bg-[#E8DCC0] px-6 pt-5 pb-7 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] text-black/40">
              STAGE {shown?.stage}
            </p>
            <h2 className="text-xl font-bold text-black">{shown?.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            tabIndex={isOpen ? 0 : -1}
            className="flex h-9 w-9 items-center justify-center rounded-full text-black hover:bg-black/5"
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

        {isCleared || claimed ? (
          <div className="py-4 text-center">
            <p className="text-2xl font-bold text-[#FF5E00]">도장 완료!</p>
            <p className="mt-2 text-sm font-medium text-black/60">
              이 구역은 이미 다녀가셨어요.
            </p>
          </div>
        ) : needsCode ? (
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="zone-code"
              className="block text-sm font-semibold text-black/70"
            >
              운영자에게 받은 비밀번호를 입력해주세요
            </label>
            <input
              id="zone-code"
              ref={inputRef}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              disabled={isSubmitting || lockedFor > 0}
              tabIndex={isOpen ? 0 : -1}
              autoComplete="off"
              autoCapitalize="characters"
              className="mt-2 w-full rounded-xl border-2 border-black/15 bg-white px-4 py-3 text-center text-lg font-bold tracking-widest text-black outline-none focus:border-[#FF5E00] disabled:opacity-60"
            />

            <p
              role="status"
              className="mt-2 min-h-5 text-center text-[13px] font-semibold text-[#C62828]"
            >
              {lockedFor > 0
                ? `너무 많이 틀렸어요. ${lockedFor}초 후에 다시 시도해주세요.`
                : message}
            </p>

            <button
              type="submit"
              disabled={isSubmitting || lockedFor > 0 || code.trim() === ""}
              tabIndex={isOpen ? 0 : -1}
              className="mt-2 w-full rounded-full border-[3px] border-dotted border-[#FF5E00] bg-[#FF5E00] py-3.5 text-base font-bold text-white shadow-[0_4px_0_0_#cc4b00] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#cc4b00] disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_0_#cc4b00]"
            >
              {isSubmitting ? "확인 중..." : "도장 받기"}
            </button>
          </form>
        ) : hasGame ? (
          <div className="pb-2 text-center">
            <p className="text-sm font-semibold text-black/70">
              {GAME_MODULES[shown!.slug]?.howTo}
            </p>
            <button
              type="button"
              onClick={onStartGame}
              tabIndex={isOpen ? 0 : -1}
              className="mt-4 w-full rounded-full border-[3px] border-dotted border-[#FF5E00] bg-[#FF5E00] py-3.5 text-base font-bold text-white shadow-[0_4px_0_0_#cc4b00] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#cc4b00]"
            >
              게임 시작
            </button>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-base font-bold text-black/70">
              미니게임을 클리어하면 도장을 받을 수 있어요
            </p>
            <p className="mt-2 text-sm font-medium text-black/40">준비 중입니다</p>
          </div>
        )}
      </div>
    </>
  );
}
