"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const TILES = [
  { name: "티셔츠", color: "#FF5E00", lit: "#FF8F4D" },
  { name: "바지", color: "#3E7CB1", lit: "#6FA8D6" },
  { name: "모자", color: "#7FB069", lit: "#A8D18F" },
  { name: "신발", color: "#B5546E", lit: "#DB8398" },
] as const;

const STEP_MS = 430;
const GAP_MS = 130;
/** Quiet beat before a sequence starts playing back. */
const LEAD_IN_MS = 700;
const START_LENGTH = 2;
const TAP_FLASH_MS = 160;

function randomStep() {
  return Math.floor(Math.random() * TILES.length);
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
  const activeRef = useRef<number | null>(null);
  const tapFlashUntilRef = useRef(0);
  const scoreRef = useRef(0);
  const pausedRef = useRef(false);
  const finished = useRef(false);
  const onFinishRef = useRef(onFinish);

  const [phase, setPhase] = useState<Phase>("watch");
  const [sequenceLength, setSequenceLength] = useState(START_LENGTH);
  const [active, setActive] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [remaining, setRemaining] = useState(durationSeconds);
  const [paused, setPaused] = useState(false);
  const [wrong, setWrong] = useState(false);

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

  // One loop drives the countdown and the playback cursor, so pausing freezes
  // both with no timers left dangling.
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

      let nextActive: number | null = null;

      if (phaseRef.current === "watch") {
        watchClockRef.current += delta * 1000;
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
      } else if (now < tapFlashUntilRef.current) {
        nextActive = activeRef.current;
      }

      if (nextActive !== activeRef.current) {
        activeRef.current = nextActive;
        setActive(nextActive);
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [durationSeconds]);

  useEffect(() => {
    if (!wrong) return;
    const timer = setTimeout(() => setWrong(false), 600);
    return () => clearTimeout(timer);
  }, [wrong]);

  const startSequence = useCallback((next: number[]) => {
    sequenceRef.current = next;
    inputIndexRef.current = 0;
    watchClockRef.current = -LEAD_IN_MS;
    phaseRef.current = "watch";
    activeRef.current = null;
    setSequenceLength(next.length);
    setActive(null);
    setPhase("watch");
  }, []);

  const handleTap = useCallback(
    (index: number) => {
      if (phaseRef.current !== "input" || pausedRef.current || finished.current) {
        return;
      }

      activeRef.current = index;
      setActive(index);
      tapFlashUntilRef.current = performance.now() + TAP_FLASH_MS;

      if (sequenceRef.current[inputIndexRef.current] !== index) {
        setWrong(true);
        startSequence(randomSequence(START_LENGTH));
        return;
      }

      inputIndexRef.current += 1;

      if (inputIndexRef.current >= sequenceRef.current.length) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
        startSequence([...sequenceRef.current, randomStep()]);
      }
    },
    [startSequence],
  );

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between px-5 py-3 text-white">
        <span className="text-sm font-bold tabular-nums">⏱ {remaining}</span>
        <span className="text-sm font-bold tabular-nums">
          {score} / {targetScore}
        </span>
        <button
          type="button"
          onClick={pause}
          aria-label="일시정지"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        </button>
      </div>

      <div className="relative flex-1 bg-gradient-to-b from-[#BBD9E0] to-[#E8DCC0] px-5 pb-5">
        <p className="py-3 text-center text-sm font-bold text-black/70">
          {wrong
            ? "틀렸어요! 처음부터 다시"
            : phase === "watch"
              ? `잘 보세요 · ${sequenceLength}단계`
              : "순서대로 눌러주세요"}
        </p>

        <div className="grid h-[calc(100%-3.5rem)] grid-cols-2 grid-rows-2 gap-3">
          {TILES.map((tile, index) => (
            <button
              key={tile.name}
              type="button"
              onClick={() => handleTap(index)}
              disabled={phase !== "input"}
              aria-label={tile.name}
              className="flex items-center justify-center rounded-2xl border-4 border-black/20 transition-colors duration-75 disabled:cursor-default"
              style={{
                backgroundColor: active === index ? tile.lit : tile.color,
                boxShadow: active === index ? "inset 0 0 0 4px rgba(255,255,255,0.7)" : undefined,
              }}
            >
              <GarmentIcon index={index} />
            </button>
          ))}
        </div>

        {paused && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/65 px-8">
            <p className="text-2xl font-bold text-white">잠시 멈췄어요</p>
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

      <p className="bg-black/80 py-2 text-center text-[12px] font-semibold text-white/70">
        한 단계 성공할 때마다 옷이 하나씩 늘어나요
      </p>
    </div>
  );
}

/** Blocky garment silhouettes, drawn to match the pixel tone of the map. */
function GarmentIcon({ index }: { index: number }) {
  const common = "h-12 w-12";
  const fill = "rgba(255,255,255,0.92)";

  if (index === 0) {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden>
        <path d="M8 4 L16 4 L20 7 L18 10 L16 9 L16 20 L8 20 L8 9 L6 10 L4 7 Z" fill={fill} />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden>
        <path d="M7 4 L17 4 L17 20 L13 20 L12 11 L11 20 L7 20 Z" fill={fill} />
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden>
        <path d="M6 14 A6 6 0 0 1 18 14 L21 14 L21 17 L4 17 L4 14 Z" fill={fill} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} aria-hidden>
      <path d="M5 8 L10 8 L12 13 L19 16 L19 19 L5 19 Z" fill={fill} />
    </svg>
  );
}
