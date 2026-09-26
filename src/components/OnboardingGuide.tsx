"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ZONES } from "@/components/TrailMap";

/**
 * The guide a visitor sees once, right after their first Google sign-in, and
 * again any time they pick 이용 안내 from the menu.
 */

const SLIDES = ["story", "zones", "howto", "raffle"] as const;

export function OnboardingGuide({
  markSeen,
  onClose,
}: {
  /** True on a first visit: closing records that the guide has been read. */
  markSeen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [closing, setClosing] = useState(false);

  const isLast = index === SLIDES.length - 1;

  const finish = useCallback(async () => {
    if (closing) return;
    setClosing(true);

    if (markSeen) {
      const supabase = createClient();
      const { error } = await supabase.rpc("complete_onboarding");
      // Not worth blocking the visitor on: the worst case is seeing the guide
      // again next time.
      if (error) console.error("complete_onboarding failed:", error.message);
      router.refresh();
    }

    onClose();
  }, [closing, markSeen, onClose, router]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") void finish();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [finish]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="이용 안내"
      className="absolute inset-0 z-30 flex flex-col bg-[#171512]"
    >
      <div className="flex items-center justify-end px-4 py-3">
        <button
          type="button"
          onClick={() => void finish()}
          className="rounded-full border-2 border-dotted border-white/25 bg-white/8 px-3.5 py-1.5 text-[12px] font-bold text-white/70 transition-colors active:bg-white/15"
        >
          {markSeen ? "건너뛰기" : "닫기"}
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-7 text-center">
        {SLIDES[index] === "story" && <StorySlide />}
        {SLIDES[index] === "zones" && <ZonesSlide />}
        {SLIDES[index] === "howto" && <HowToSlide />}
        {SLIDES[index] === "raffle" && <RaffleSlide />}
      </div>

      <div className="flex items-center justify-center gap-2 pb-4">
        {SLIDES.map((slide, slideIndex) => (
          <span
            key={slide}
            aria-hidden
            className={`h-2 rounded-full transition-all ${
              slideIndex === index ? "w-5 bg-[#FF5E00]" : "w-2 bg-white/25"
            }`}
          />
        ))}
      </div>

      <div className="px-7 pb-8">
        <button
          type="button"
          onClick={() => (isLast ? void finish() : setIndex(index + 1))}
          className="w-full rounded-full border-[3px] border-dotted border-[#FF5E00] bg-[#FF5E00] py-3.5 text-base font-bold text-white shadow-[0_4px_0_0_#cc4b00] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#cc4b00]"
        >
          {isLast ? "탐험 시작하기" : "다음"}
        </button>
        {index > 0 && (
          <button
            type="button"
            onClick={() => setIndex(index - 1)}
            className="mt-3 w-full text-sm font-semibold text-white/45"
          >
            이전
          </button>
        )}
      </div>
    </div>
  );
}

function SlideTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <p className="text-[11px] font-bold tracking-[0.25em] text-[#FF5E00]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl leading-snug font-bold text-white">{title}</h2>
    </>
  );
}

function StorySlide() {
  return (
    <>
      <div
        className="mb-7 h-40 w-40 rounded-2xl border-4 border-[#D9C27E] bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/trail-map-bg.png')",
          imageRendering: "pixelated",
        }}
        aria-hidden
      />
      <SlideTitle eyebrow="WHO MADE THIS TRAIL" title="이 길은 누가 만들었을까요?" />
      <p className="mt-4 text-sm leading-relaxed font-medium text-white/65">
        70년 전, 우리는 누군가와 함께 이 길을 걸었습니다.
        <br />
        인천드림교회 70주년을 맞아,
        <br />그 발자취를 따라 걷는 트레일을 열었습니다.
      </p>
    </>
  );
}

function ZonesSlide() {
  return (
    <>
      <div className="mb-7 flex items-end gap-3" aria-hidden>
        {ZONES.map((zone) => (
          <div key={zone.slug} className="flex flex-col items-center gap-2">
            <svg viewBox="0 0 30 40" className="h-11 w-8 drop-shadow">
              <path
                d="M15 39C15 39 28 23.5 28 14A13 13 0 1 0 2 14C2 23.5 15 39 15 39Z"
                fill="#FF5E00"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <text
                x="15"
                y="19"
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill="#FFFFFF"
              >
                {zone.stage}
              </text>
            </svg>
            <span className="text-[11px] font-bold text-white/70">{zone.name}</span>
          </div>
        ))}
      </div>
      <SlideTitle eyebrow="STAMP BOARD" title="네 곳을 지나며 도장을 모아요" />
      <p className="mt-4 text-sm leading-relaxed font-medium text-white/65">
        지도 위의 핀이 도장판입니다.
        <br />
        도장을 받으면 핀에 색이 들어와요.
        <br />
        <span className="text-white/80">순서는 상관없으니</span> 한가한 곳부터
        들르셔도 됩니다.
      </p>
    </>
  );
}

function HowToSlide() {
  return (
    <>
      <div className="mb-7 flex w-full max-w-[280px] flex-col gap-3" aria-hidden>
        <div className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3 text-left">
          <span className="text-2xl">🎮</span>
          <div>
            <p className="text-sm font-bold text-white">미니게임</p>
            <p className="text-[12px] font-medium text-white/50">굿즈팀 & 의류팀</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3 text-left">
          <span className="text-2xl">🔑</span>
          <div>
            <p className="text-sm font-bold text-white">비밀번호 입력</p>
            <p className="text-[12px] font-medium text-white/50">교회팀 & 체험팀</p>
          </div>
        </div>
      </div>
      <SlideTitle eyebrow="HOW TO PLAY" title="핀을 누르면 시작됩니다" />
      <p className="mt-4 text-sm leading-relaxed font-medium text-white/65">
        굿즈와 의류는 미니게임을 클리어하면 도장을 받아요.
        <br />
        교회와 체험은 현장에서 진행한 뒤,
        <br />
        운영자에게 받은 비밀번호를 입력하면 됩니다.
      </p>
    </>
  );
}

function RaffleSlide() {
  return (
    <>
      <div className="mb-7 flex items-center gap-2" aria-hidden>
        {[0, 1, 2, 3].map((slot) => (
          <span
            key={slot}
            className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-dotted border-[#FF5E00] bg-[#FF5E00] text-lg font-bold text-white"
          >
            ✓
          </span>
        ))}
      </div>
      <SlideTitle eyebrow="RAFFLE" title="네 개를 모두 모으면 응모 완료" />
      <p className="mt-4 text-sm leading-relaxed font-medium text-white/65">
        도장 4개를 모으면 경품 응모가 자동으로 완료됩니다.
        <br />
        따로 신청하실 것은 없어요.
      </p>
      <p className="mt-5 rounded-xl bg-white/8 px-4 py-3 text-[12px] leading-relaxed font-medium text-white/45">
        경품 추첨과 수령 안내는 추후 공지를 드립니다.
      </p>
    </>
  );
}
