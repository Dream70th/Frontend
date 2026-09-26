"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameField } from "@/games/GameField";
import type { GameModuleProps } from "@/games/types";

/**
 * Watch a coordination sequence, then repeat it. Clearing a round scores a
 * point and adds one more garment to the next sequence.
 *
 * Deliberately time-boxed rather than "one mistake ends the run": the server
 * validates a fixed play duration, and at a popup store nobody should be sent
 * away after four seconds. A mistake costs progress, not the run.
 */

type Phase = "watch" | "input";
type Verdict = "correct" | "wrong";

// Card art and placement come straight from the Figma frame (386x874). The
// design reuses the 굿즈 background, so this does too rather than shipping a
// second copy of it.
const DESIGN_WIDTH = 386;
const DESIGN_HEIGHT = 874;
const xPct = (value: number) => `${(value / DESIGN_WIDTH) * 100}%`;
const yPct = (value: number) => `${(value / DESIGN_HEIGHT) * 100}%`;

const CARDS = [
  {
    name: "상의",
    src: "/images/clothing/card-top.png",
    x: 24,
    y: 127,
    w: 163,
    h: 214,
  },
  {
    name: "바지",
    src: "/images/clothing/card-pants.png",
    x: 195,
    y: 127,
    w: 164,
    h: 215,
  },
  {
    name: "모자",
    src: "/images/clothing/card-cap.png",
    x: 196,
    y: 372,
    w: 163,
    h: 215,
  },
  {
    name: "신발",
    src: "/images/clothing/card-boots.png",
    x: 25,
    y: 373,
    w: 162,
    h: 214,
  },
] as const;

const STEP_MS = 430;
const GAP_MS = 130;
/** Quiet beat before a sequence starts playing back. */
const LEAD_IN_MS = 700;
/** How long a mid-sequence tap stays lit. */
const TAP_FLASH_MS = 180;
/**
 * How long the board holds after the round is decided. Without this the next
 * sequence starts the instant the last card is tapped, so that tap never gets
 * drawn and there is no moment to show the verdict.
 */
const HOLD_MS = 700;
/** Rounds count up from one card, so the first clear reads "1단계 성공!". */
const START_LENGTH = 1;

function randomStep() {
  return Math.floor(Math.random() * CARDS.length);
}

function randomSequence(length: number) {
  return Array.from({ length }, randomStep);
}

export function MemoryGame({
  durationSeconds,
  targetScore,
  onFinish,
  onAbort,
}: GameModuleProps) {
  const phaseRef = useRef<Phase>("watch");
  const sequenceRef = useRef<number[]>(randomSequence(START_LENGTH));
  const inputIndexRef = useRef(0);
  const watchClockRef = useRef(-LEAD_IN_MS);
  const scoreRef = useRef(0);
  const pausedRef = useRef(false);
  const finished = useRef(false);
  const onFinishRef = useRef(onFinish);

  /** The card lit by a tap, and how much longer it stays lit. */
  const flashRef = useRef<{ index: number; remaining: number } | null>(null);
  /** Set once a round is decided: the board waits, then starts `next`. */
  const holdRef = useRef<{ remaining: number; next: number[] } | null>(null);
  const shownRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>("watch");
  const [sequenceLength, setSequenceLength] = useState(START_LENGTH);
  const [active, setActive] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [remaining, setRemaining] = useState(durationSeconds);
  const [paused, setPaused] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const pause = useCallback(() => {
    if (finished.current) return;
    pausedRef.current = true;
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    // Replay the current sequence from the top — nobody remembers where the
    // playback was interrupted.
    if (phaseRef.current === "watch") watchClockRef.current = -LEAD_IN_MS;
    pausedRef.current = false;
    setPaused(false);
  }, []);

  useEffect(() => {
    function onVisibility() {
      if (document.hidden) pause();
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [pause]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (pausedRef.current) resume();
      else pause();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pause, resume]);

  const startSequence = useCallback((next: number[]) => {
    sequenceRef.current = next;
    inputIndexRef.current = 0;
    watchClockRef.current = -LEAD_IN_MS;
    phaseRef.current = "watch";
    flashRef.current = null;
    shownRef.current = null;
    setSequenceLength(next.length);
    setActive(null);
    setPhase("watch");
  }, []);

  // One loop drives the countdown, the playback cursor and every timed hold,
  // so pausing freezes all of them with no stray timers left running.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;

    function frame(now: number) {
      if (pausedRef.current) {
        last = now;
        raf = requestAnimationFrame(frame);
        return;
      }

      const delta = Math.min((now - last) / 1000, 0.1);
      last = now;
      elapsed += delta;
      const deltaMs = delta * 1000;

      const left = Math.max(durationSeconds - elapsed, 0);
      if (left <= 0) {
        if (!finished.current) {
          finished.current = true;
          setRemaining(0);
          onFinishRef.current({ score: scoreRef.current });
        }
        return;
      }
      setRemaining(Math.ceil(left));

      if (flashRef.current) {
        flashRef.current.remaining -= deltaMs;
        if (flashRef.current.remaining <= 0) flashRef.current = null;
      }

      if (holdRef.current) {
        holdRef.current.remaining -= deltaMs;
        if (holdRef.current.remaining <= 0) {
          const { next } = holdRef.current;
          holdRef.current = null;
          setVerdict(null);
          startSequence(next);
        }
      }

      let nextActive: number | null = null;

      if (phaseRef.current === "watch") {
        watchClockRef.current += deltaMs;
        const clock = watchClockRef.current;

        if (clock >= 0) {
          const cycle = STEP_MS + GAP_MS;
          const stepIndex = Math.floor(clock / cycle);

          if (stepIndex >= sequenceRef.current.length) {
            phaseRef.current = "input";
            inputIndexRef.current = 0;
            setPhase("input");
          } else if (clock % cycle < STEP_MS) {
            nextActive = sequenceRef.current[stepIndex];
          }
        }
      } else if (flashRef.current) {
        nextActive = flashRef.current.index;
      }

      if (nextActive !== shownRef.current) {
        shownRef.current = nextActive;
        setActive(nextActive);
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [durationSeconds, startSequence]);

  const handleTap = useCallback((index: number) => {
    if (
      phaseRef.current !== "input" ||
      pausedRef.current ||
      finished.current ||
      holdRef.current
    ) {
      return;
    }

    const expected = sequenceRef.current[inputIndexRef.current];

    if (expected !== index) {
      // Keep the wrong card lit for the whole hold, so it is clear what was hit.
      flashRef.current = { index, remaining: HOLD_MS };
      holdRef.current = {
        remaining: HOLD_MS,
        next: randomSequence(START_LENGTH),
      };
      setVerdict("wrong");
      return;
    }

    inputIndexRef.current += 1;
    const done = inputIndexRef.current >= sequenceRef.current.length;

    flashRef.current = { index, remaining: done ? HOLD_MS : TAP_FLASH_MS };

    if (done) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      holdRef.current = {
        remaining: HOLD_MS,
        next: [...sequenceRef.current, randomStep()],
      };
      setVerdict("correct");
    }
  }, []);

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-cover bg-bottom"
      style={{
        backgroundImage: "url('/images/goods/bg.png')",
        imageRendering: "pixelated",
      }}
    >
      <span className="sr-only">
        반짝이는 순서를 기억해 따라 누르는 게임. 남은 시간 {remaining}초, 목표{" "}
        {targetScore}단계 중 {score}단계.
      </span>

      <GameField>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <span className="rounded-full bg-black/45 px-3 py-1 text-sm font-bold text-white tabular-nums">
            ⏱ {remaining}
          </span>
          <span className="rounded-full bg-black/45 px-3 py-1 text-sm font-bold text-white tabular-nums">
            {score} / {targetScore}
          </span>
          <button
            type="button"
            onClick={pause}
            aria-label="일시정지"
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden
            >
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          </button>
        </div>

        <p
          role="status"
          className="absolute inset-x-0 text-center text-[13px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
          style={{ top: yPct(88) }}
        >
          {phase === "watch" && !verdict
            ? `잘 보세요 · ${sequenceLength}단계`
            : verdict
              ? " "
              : "순서대로 눌러주세요"}
        </p>

        {CARDS.map((card, index) => {
          const lit = active === index;
          const glow =
            lit && verdict === "correct"
              ? "drop-shadow-[0_0_12px_rgba(126,217,87,0.95)]"
              : lit && verdict === "wrong"
                ? "drop-shadow-[0_0_12px_rgba(229,57,53,0.95)]"
                : lit
                  ? "drop-shadow-[0_0_10px_rgba(255,255,255,0.85)]"
                  : "";

          return (
            <button
              key={card.name}
              type="button"
              onClick={() => handleTap(index)}
              disabled={phase !== "input"}
              aria-label={card.name}
              className={`absolute rounded-2xl bg-contain bg-center bg-no-repeat transition-all duration-100 disabled:cursor-default ${
                lit ? `scale-[1.04] brightness-125 ${glow}` : "brightness-90"
              }`}
              style={{
                left: xPct(card.x),
                top: yPct(card.y),
                width: xPct(card.w),
                height: yPct(card.h),
                backgroundImage: `url('${card.src}')`,
                imageRendering: "pixelated",
              }}
            />
          );
        })}

        {verdict && (
          <span
            key={`${verdict}-${score}`}
            aria-hidden
            className={`animate-feedback-pop pointer-events-none absolute left-1/2 rounded-full px-6 py-3 text-xl font-bold text-white shadow-lg ${
              verdict === "correct" ? "bg-[#4CAF50]" : "bg-[#C62828]"
            }`}
            style={{ top: yPct(357) }}
          >
            {verdict === "correct"
              ? `${sequenceLength}단계 성공!`
              : "틀렸어요!"}
          </span>
        )}

        <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/55 py-1.5 text-center text-[12px] font-semibold text-white/80">
          한 단계 성공할 때마다 옷이 하나씩 늘어나요
        </p>
      </GameField>

      {paused && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/65 px-8">
          <p className="text-2xl font-bold text-white">PAUSED</p>
          <p className="text-sm font-medium text-white/60">
            {score} / {targetScore} · {remaining}초 남음
          </p>
          <button
            type="button"
            onClick={resume}
            className="mt-2 w-full max-w-[220px] rounded-full border-[3px] border-dotted border-[#FF5E00] bg-[#FF5E00] py-3 text-base font-bold text-white shadow-[0_4px_0_0_#cc4b00] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#cc4b00]"
          >
            계속하기
          </button>
          <button
            type="button"
            onClick={onAbort}
            className="text-sm font-semibold text-white/50"
          >
            그만두기
          </button>
        </div>
      )}
    </div>
  );
}
