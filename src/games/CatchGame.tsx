"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameField } from "@/games/GameField";
import type { GameModuleProps } from "@/games/types";

type Variant = "good" | "rock" | "bomb";

/** A "-3" that floats up from the basket when a hazard lands in it. */
type DamagePopup = {
  id: number;
  x: number;
  amount: number;
  variant: "rock" | "bomb";
  expiresAt: number;
};

type FallingItem = {
  id: number;
  /** Horizontal centre, in % of the play area. */
  x: number;
  /** Vertical position, in % of the play area. */
  y: number;
  /** Fall speed in % per second. */
  speed: number;
  /** Index into GOODS, only meaningful for `good` items. */
  kind: number;
  variant: Variant;
};

// The Figma frame is 386 wide, so a sprite's on-screen width is its design
// width over 386. Keeping it proportional means the art scales with the
// letterboxed frame instead of drifting on wider phones.
const DESIGN_WIDTH = 386;
const pct = (designPx: number) => (designPx / DESIGN_WIDTH) * 100;

const GOODS = [
  { src: "/images/goods/heart.png", width: pct(67), ratio: "67 / 55" },
  { src: "/images/goods/bear.png", width: pct(65), ratio: "65 / 92" },
  { src: "/images/goods/tag.png", width: pct(62), ratio: "62 / 75" },
  { src: "/images/goods/flower.png", width: pct(56), ratio: "56 / 57" },
  { src: "/images/goods/star.png", width: pct(51), ratio: "51 / 54" },
  { src: "/images/goods/mug.png", width: pct(65), ratio: "65 / 68" },
  { src: "/images/goods/mountain.png", width: pct(64), ratio: "64 / 88" },
  { src: "/images/goods/cap.png", width: pct(54), ratio: "54 / 56" },
] as const;

// Drawn smaller than its 89px design width: at full size it dwarfed the goods
// and read as the main character of the screen.
const BOMB = {
  src: "/images/goods/bomb.png",
  width: pct(64),
  ratio: "89 / 100",
} as const;

// Difficulty ramps across the run: items fall faster, arrive more often, and
// more of them are hazards.
const SPAWN_INTERVAL_START_MS = 780;
const SPAWN_INTERVAL_END_MS = 520;
const MIN_SPEED = 46;
const MAX_SPEED = 66;
const SPEED_RAMP = 0.45;
const ROCK_CHANCE_START = 0.14;
const ROCK_CHANCE_END = 0.22;
const BOMB_CHANCE_START = 0.05;
const BOMB_CHANCE_END = 0.12;
/** Bombs drop faster than everything else, so they are harder to dodge late. */
const BOMB_SPEED_BONUS = 1.25;

// The basket sits where the design puts it, just above the grass.
const BASKET_WIDTH = pct(101);
const BASKET_Y = 89;
const CATCH_BAND = 5;
/** Half the basket plus a little: a sprite grazing the rim still counts. */
const CATCH_WIDTH = 13;

const PENALTY: Record<Variant, number> = { good: 0, rock: 1, bomb: 3 };

export function CatchGame({
  durationSeconds,
  targetScore,
  onFinish,
  onAbort,
}: GameModuleProps) {
  const areaRef = useRef<HTMLDivElement>(null);

  // The simulation lives in refs so the animation frame stays pure state-wise;
  // React state exists only to paint what the refs already decided.
  const basketX = useRef(50);
  /** Whether a finger is down and the basket should follow it. */
  const dragging = useRef(false);
  const itemsRef = useRef<FallingItem[]>([]);
  const scoreRef = useRef(0);
  const finished = useRef(false);
  const pausedRef = useRef(false);
  const onFinishRef = useRef(onFinish);

  const popupsRef = useRef<DamagePopup[]>([]);
  const nextPopupId = useRef(0);

  const [items, setItems] = useState<FallingItem[]>([]);
  const [popups, setPopups] = useState<DamagePopup[]>([]);
  const [basket, setBasket] = useState(50);
  const [score, setScore] = useState(0);
  const [remaining, setRemaining] = useState(durationSeconds);
  const [paused, setPaused] = useState(false);
  /** null = fine, otherwise the hazard just caught. */
  const [hit, setHit] = useState<"rock" | "bomb" | null>(null);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const pause = useCallback(() => {
    if (finished.current) return;
    pausedRef.current = true;
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    setPaused(false);
  }, []);

  // The basket follows the finger directly — no easing, no chase.
  const moveBasket = useCallback((clientX: number) => {
    const area = areaRef.current;
    if (!area || pausedRef.current) return;
    const rect = area.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    basketX.current = Math.min(Math.max(x, 8), 92);
    setBasket(basketX.current);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (pausedRef.current) resume();
        else pause();
        return;
      }
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      if (pausedRef.current) return;
      const step = event.key === "ArrowLeft" ? -7 : 7;
      basketX.current = Math.min(Math.max(basketX.current + step, 8), 92);
      setBasket(basketX.current);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pause, resume]);

  // A phone call or a switched tab should not cost the run.
  useEffect(() => {
    function onVisibility() {
      if (document.hidden) pause();
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [pause]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let sinceSpawn = 0;
    let elapsed = 0;
    let nextId = 0;

    function frame(now: number) {
      // While paused the clock simply does not advance: keep the loop alive so
      // resuming is instant, but drop the elapsed time on the floor.
      if (pausedRef.current) {
        last = now;
        raf = requestAnimationFrame(frame);
        return;
      }

      // Clamp the delta so a backgrounded tab cannot teleport every item past
      // the basket in one frame.
      const delta = Math.min((now - last) / 1000, 0.1);
      last = now;
      elapsed += delta;
      sinceSpawn += delta * 1000;

      const left = Math.max(durationSeconds - elapsed, 0);

      if (left <= 0) {
        if (!finished.current) {
          finished.current = true;
          setRemaining(0);
          onFinishRef.current({ score: scoreRef.current });
        }
        return;
      }

      const progress = Math.min(elapsed / durationSeconds, 1);

      const next: FallingItem[] = [];
      let gained = 0;
      let penalty = 0;
      let worstHit: "rock" | "bomb" | null = null;

      for (const item of itemsRef.current) {
        const y = item.y + item.speed * (1 + SPEED_RAMP * progress) * delta;

        if (
          y >= BASKET_Y - CATCH_BAND &&
          y <= BASKET_Y + CATCH_BAND &&
          Math.abs(item.x - basketX.current) <= CATCH_WIDTH
        ) {
          if (item.variant === "good") {
            gained++;
          } else {
            penalty += PENALTY[item.variant];
            if (item.variant === "bomb" || worstHit === null) {
              worstHit = item.variant;
            }
          }
          continue;
        }

        if (y < 106) next.push({ ...item, y });
      }

      // Stop spawning near the end so nothing is still falling at the whistle.
      const spawnInterval =
        SPAWN_INTERVAL_START_MS +
        (SPAWN_INTERVAL_END_MS - SPAWN_INTERVAL_START_MS) * progress;

      if (sinceSpawn >= spawnInterval && left > 1.5) {
        sinceSpawn = 0;

        const bombChance =
          BOMB_CHANCE_START + (BOMB_CHANCE_END - BOMB_CHANCE_START) * progress;
        const rockChance =
          ROCK_CHANCE_START + (ROCK_CHANCE_END - ROCK_CHANCE_START) * progress;
        const roll = Math.random();
        const variant: Variant =
          roll < bombChance
            ? "bomb"
            : roll < bombChance + rockChance
              ? "rock"
              : "good";

        const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);

        next.push({
          id: nextId++,
          x: 12 + Math.random() * 76,
          y: -8,
          speed: variant === "bomb" ? speed * BOMB_SPEED_BONUS : speed,
          kind: Math.floor(Math.random() * GOODS.length),
          variant,
        });
      }

      itemsRef.current = next;
      setItems(next);
      setRemaining(Math.ceil(left));

      if (gained > 0 || penalty > 0) {
        scoreRef.current = Math.max(scoreRef.current + gained - penalty, 0);
        setScore(scoreRef.current);
        if (worstHit) setHit(worstHit);
      }

      // Float the lost points up from wherever the basket was. Expiry is
      // checked here rather than with a timer per popup, so pausing freezes
      // them along with everything else.
      const alive = popupsRef.current.filter((popup) => popup.expiresAt > now);
      let popupsChanged = alive.length !== popupsRef.current.length;
      popupsRef.current = alive;

      if (penalty > 0 && worstHit) {
        popupsRef.current = [
          ...alive,
          {
            id: nextPopupId.current++,
            x: basketX.current,
            amount: penalty,
            variant: worstHit,
            expiresAt: now + 800,
          },
        ];
        popupsChanged = true;
      }

      if (popupsChanged) setPopups(popupsRef.current);

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [durationSeconds]);

  // Clear the hazard flash shortly after it is set.
  useEffect(() => {
    if (!hit) return;
    const timer = setTimeout(() => setHit(null), hit === "bomb" ? 340 : 220);
    return () => clearTimeout(timer);
  }, [hit]);

  return (
    <div
      ref={areaRef}
      onPointerDown={(event) => {
        // Let the pause button have its own taps.
        if (event.target instanceof Element && event.target.closest("button")) {
          return;
        }
        // Capture so the basket keeps following even if the finger strays over
        // a falling sprite or off the edge of the play area.
        event.currentTarget.setPointerCapture(event.pointerId);
        dragging.current = true;
        moveBasket(event.clientX);
      }}
      onPointerMove={(event) => {
        // iOS reports pressure 0 for an ordinary touch, so asking for pressure
        // here meant the basket never moved on an iPhone: it jumped to wherever
        // the finger landed and then stayed there. Track the drag ourselves.
        if (dragging.current || event.pointerType === "mouse") {
          moveBasket(event.clientX);
        }
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
      className={`relative h-full w-full touch-none overflow-hidden bg-cover bg-bottom ${
        hit === "bomb" ? "animate-bomb-shake" : ""
      }`}
      style={{
        backgroundImage: "url('/images/goods/bg.png')",
        imageRendering: "pixelated",
      }}
    >
      <span className="sr-only">
        떨어지는 굿즈를 바구니로 받는 게임. 남은 시간 {remaining}초, 목표{" "}
        {targetScore}개 중 {score}개.
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

        {items.map((item) => {
          const position = {
            left: `${item.x}%`,
            top: `${item.y}%`,
            transform: "translate(-50%, -50%)",
          } as const;

          if (item.variant === "bomb") {
            return (
              <span
                key={item.id}
                aria-hidden
                className="absolute bg-contain bg-center bg-no-repeat"
                style={{
                  ...position,
                  width: `${BOMB.width}%`,
                  aspectRatio: BOMB.ratio,
                  backgroundImage: `url('${BOMB.src}')`,
                  imageRendering: "pixelated",
                }}
              />
            );
          }

          if (item.variant === "rock") {
            return (
              <svg
                key={item.id}
                viewBox="0 0 28 24"
                aria-hidden
                className="absolute w-[13%]"
                style={position}
              >
                <path
                  d="M4 20 L2 12 L8 4 L18 3 L26 11 L24 20 Z"
                  fill="#8A867E"
                  stroke="#4F4C47"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 4 L12 12 L24 20"
                  fill="none"
                  stroke="#B6B2A9"
                  strokeWidth="2"
                />
              </svg>
            );
          }

          const good = GOODS[item.kind];
          return (
            <span
              key={item.id}
              aria-hidden
              className="absolute bg-contain bg-center bg-no-repeat"
              style={{
                ...position,
                width: `${good.width}%`,
                aspectRatio: good.ratio,
                backgroundImage: `url('${good.src}')`,
                imageRendering: "pixelated",
              }}
            />
          );
        })}

        <span
          aria-hidden
          className={`absolute bg-contain bg-bottom bg-no-repeat transition-[filter] duration-100 ${
            hit ? "brightness-75 saturate-150" : ""
          }`}
          style={{
            left: `${basket}%`,
            top: `${BASKET_Y}%`,
            width: `${BASKET_WIDTH}%`,
            aspectRatio: "101 / 62",
            transform: "translate(-50%, -50%)",
            backgroundImage: "url('/images/goods/basket.png')",
            imageRendering: "pixelated",
          }}
        />

        {popups.map((popup) => (
          <span
            key={popup.id}
            aria-hidden
            className="animate-damage-float absolute text-2xl font-bold text-[#FF3B30] [text-shadow:0_2px_0_rgba(0,0,0,0.45)]"
            style={{ left: `${popup.x}%`, top: `${BASKET_Y - 4}%` }}
          >
            −{popup.amount}
          </span>
        ))}

        <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/55 py-1.5 text-center text-[12px] font-semibold text-white/80">
          돌멩이 −1 · 폭탄 −3, 피하세요!
        </p>
      </GameField>

      {/* A wash of red over the whole board, heavier for a bomb than a rock. */}
      {hit && (
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 ${
            hit === "bomb" ? "bg-[#C62828]/30" : "bg-[#C62828]/14"
          }`}
        />
      )}

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
  );
}
