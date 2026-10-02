"use client";

import Image from "next/image";
import { Body, Eyebrow, InfoSheet, SectionTitle } from "@/components/InfoSheet";

/**
 * 팝업플레이스 소개. Copy comes from the team's 보고서 in Notion (§1-1 컨셉 설명,
 * §1-3 포스터 설명) — kept close to their wording rather than rewritten.
 */

const INSIDE = ["보물보다 귀한 말씀찾기", "드림 야호", "홀리 밸런스"];

const SPACE_NOTES = [
  ["주제 색감", "초록색과 청록색"],
  ["오브제", "이정표 · 나침반 · 카라비너 · 로프 등"],
  ["조명", "캠프 랜턴 같은 따뜻한 웜톤"],
];

export function AboutPopup({ onClose }: { onClose: () => void }) {
  return (
    <InfoSheet title="팝업플레이스 소개" onClose={onClose}>
      <Image
        src="/images/about/poster.jpg"
        alt="WHO MADE THIS TRAIL 팝업플레이스 포스터"
        width={1200}
        height={1669}
        // 시트 너비를 거의 다 쓴다. sizes가 없으면 next/image가 작은 쪽을
        // 골라 3배율 화면에서 포스터 글씨가 뭉갠다.
        sizes="100vw"
        className="h-auto w-full rounded-2xl border-2 border-white/10"
        priority
      />

      <div className="mt-7">
        <Eyebrow>70TH ANNIVERSARY</Eyebrow>
        <SectionTitle>WHO MADE THIS TRAIL</SectionTitle>
        <Body>
          드림교회 70주년을 기념하는 팝업플레이스입니다. 인생의 여정을 하나의
          트레일에 빗대어, 걸어온 길과 앞으로 걸어갈 길을 함께 생각해보는
          공간으로 꾸몄습니다.
        </Body>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/6 px-4 py-3">
          <dt className="text-[11px] font-bold tracking-wide text-white/40">
            DATE
          </dt>
          <dd className="mt-1 text-sm font-bold text-white">2026.10.04</dd>
        </div>
        <div className="rounded-2xl bg-white/6 px-4 py-3">
          <dt className="text-[11px] font-bold tracking-wide text-white/40">
            PLACE
          </dt>
          <dd className="mt-1 text-sm font-bold text-white">
            드림교회 1층
            <br />
            비전홀 &amp; 카페
          </dd>
        </div>
      </dl>

      <div className="mt-8">
        <Eyebrow>CONCEPT</Eyebrow>
        <SectionTitle>누가 이 길을 만들었는가</SectionTitle>
        <Body>
          포스터의 메인 카피는 질문입니다. 그 답은 요한복음 14장 6절의 말씀으로
          제시됩니다. 예수님께서 산 위에서 가르치신 것을 직설적으로 표현하고,
          교회가 걸어온 시간을 산을 오르는 등반에 빗대었습니다.
        </Body>
      </div>

      <figure className="mt-6 rounded-2xl border-2 border-dotted border-white/15 bg-white/[0.05] px-5 py-4">
        <blockquote className="text-[13px] leading-[1.8] font-semibold text-white/75">
          예수께서 이르시되 내가 곧 길이요 진리요 생명이니 나로 말미암지 않고는
          아버지께로 올 자가 없느니라
        </blockquote>
        <figcaption className="mt-2.5 text-right text-[11px] font-bold tracking-wide text-white/40">
          — 요한복음 14:6
        </figcaption>
      </figure>

      <div className="mt-8">
        <Eyebrow>WHAT&apos;S INSIDE</Eyebrow>
        <SectionTitle>체험 콘텐츠</SectionTitle>
        <ul className="mt-3 flex flex-col gap-2">
          {INSIDE.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 rounded-2xl bg-white/6 px-4 py-3 text-sm font-bold text-white"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF5E00]" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <Eyebrow>SPACE</Eyebrow>
        <SectionTitle>공간 톤</SectionTitle>
        <dl className="mt-3 flex flex-col gap-2.5">
          {SPACE_NOTES.map(([label, value]) => (
            <div key={label} className="flex gap-3">
              <dt className="w-16 shrink-0 text-[12px] font-bold text-white/40">
                {label}
              </dt>
              <dd className="text-[13px] leading-relaxed font-medium text-white/70">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-8 mb-2 rounded-2xl bg-[#FF5E00]/12 px-5 py-4">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#FF5E00]">
          70 YEARS / NEW TRAILS
        </p>
        <p className="mt-2 text-[13px] leading-relaxed font-medium text-white/70">
          지나온 70년의 발자취 위에서, 새로운 길을 향해 나아갑니다.
        </p>
      </div>
    </InfoSheet>
  );
}
