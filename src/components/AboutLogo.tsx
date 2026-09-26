"use client";

import Image from "next/image";
import { Body, Eyebrow, InfoSheet, SectionTitle } from "@/components/InfoSheet";
import { LogoGallery } from "@/components/LogoGallery";

/**
 * 로고 소개. Copy comes from the team's 보고서 in Notion (§1-2 로고 설명), in
 * their narrative order — TRACES leads to TRUST, which arrives at TOP — rather
 * than the lockup's left-to-right order.
 */

const MEANINGS = [
  {
    word: "TRACES",
    text: "주님께서 남기신 발자취와 흔적을 따라가는 여정을 의미합니다.",
  },
  {
    word: "TRUST",
    text: "그 길 위에서 주님을 신뢰하며 올바른 방향으로 나아가는 믿음의 자세를 나타냅니다.",
  },
  {
    word: "TOP",
    text: "이러한 신뢰와 발걸음이 쌓여, 마침내 도달하게 되는 궁극의 목적지입니다.",
  },
];

export function AboutLogo({ onClose }: { onClose: () => void }) {
  return (
    <InfoSheet title="로고 소개" onClose={onClose}>
      <div className="flex items-center justify-center rounded-2xl bg-white px-6 py-8">
        <Image
          src="/images/about/traces-logo.png"
          alt="TRACES 로고 — 나침반 심볼과 TRUST · TRACES · TOP"
          width={700}
          height={193}
          className="h-auto w-full"
          priority
        />
      </div>

      <div className="mt-7">
        <Eyebrow>SYMBOL</Eyebrow>
        <SectionTitle>TRUST · TRACES · TOP</SectionTitle>
        <Body>
          나침반은 방향을, 그 안의 화살표는 정상을 향해 나아가는 발걸음을
          가리킵니다. 세 단어가 하나의 여정을 이룹니다.
        </Body>
      </div>

      <ol className="mt-6 flex flex-col gap-3">
        {MEANINGS.map(({ word, text }) => (
          <li key={word} className="rounded-2xl bg-white/6 px-5 py-4">
            <p className="text-sm font-bold tracking-[0.15em] text-[#FF5E00]">
              {word}
            </p>
            <p className="mt-2 text-[13px] leading-[1.75] font-medium text-white/70">
              {text}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-8">
        <Eyebrow>VARIATIONS</Eyebrow>
        <SectionTitle>다양한 버전</SectionTitle>
        <Body>
          같은 여정을 각각 다른 방식으로 담은 적용 시안입니다. 좌우로 넘겨 확인해보세요.
        </Body>
        <div className="mt-4">
          <LogoGallery />
        </div>
      </div>

      <div className="mt-8 mb-2 rounded-2xl border-2 border-dotted border-[#FF5E00]/40 bg-[#FF5E00]/10 px-5 py-4">
        <p className="text-[13.5px] leading-[1.8] font-semibold text-white/80">
          결국, TRACES는 “주님의 흔적을 따라 신뢰함으로 나아가, 정상에 이르는 여정”을
          형상화한 로고입니다.
        </p>
      </div>
    </InfoSheet>
  );
}
