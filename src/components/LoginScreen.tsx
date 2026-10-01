"use client";

import Image from "next/image";
import { useState } from "react";
import { AppViewport } from "@/components/AppViewport";
import { ArtStage } from "@/components/ArtStage";
import { LoginButton } from "@/components/LoginButton";
import { InAppBrowserBanner } from "@/components/InAppBrowserBanner";
import { GoodsCatalog } from "@/components/GoodsCatalog";
import { hasCatalog } from "@/lib/goods-catalog";
import { yPct } from "@/lib/design-coordinates";

/**
 * 로그인 화면 전체. 포스터와 버튼들, 그리고 물품 안내 시트를 함께 쥐고 있다.
 *
 * 시트는 ArtStage 안이 아니라 밖에 둔다. ArtStage는 화면보다 크고 위로 밀려
 * 있는 데다 transform까지 걸려 있어서, 그 안에 넣으면 inset-0이 화면이 아니라
 * 그림을 기준으로 잡혀 시트가 엉뚱한 곳에 깔린다.
 */
export function LoginScreen({ isInAppBrowser }: { isInAppBrowser: boolean }) {
  const [showCatalog, setShowCatalog] = useState(false);

  return (
    <AppViewport>
      {/* The poster is typeset edge to edge — the anniversary line at the top
          and the compass at the foot both sit close to the margin — so it has
          far less to spare than the map and leans on stretch instead. */}
      <ArtStage topSlack={55} bottomSlack={60} bleed="/images/login-bg.png">
        <Image
          src="/images/login-bg.png"
          alt="WHO MADE THIS TRAIL — 70주년 팝업플레이스"
          fill
          priority
          // ArtStage has already decided the exact box the artwork should occupy,
          // stretch and all; object-cover here would crop it a second time.
          className="object-fill"
        />

        {isInAppBrowser && <InAppBrowserBanner />}

        {/* Only the top of the column is pinned to the poster; the buttons are
            spaced in CSS px below it, so the gap between them is identical on
            every screen rather than shrinking with the artwork. */}
        <div
          className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
          style={{ top: yPct(673) }}
        >
          <LoginButton isInAppBrowser={isInAppBrowser} />

          {/* 포스터의 호수(어두운 면) 위라 밝은 테두리가 읽히고, 오른쪽
              카라비너와도 겹치지 않는다. 주 버튼보다 한 단계 약한 고스트
              스타일로 두어 로그인이 먼저 눈에 들어오게 했다. */}
          {hasCatalog() && (
            <button
              type="button"
              onClick={() => setShowCatalog(true)}
              className="flex w-max items-center gap-2 rounded-full border-2 border-dotted border-white/45 px-5 py-2.5 text-[13.5px] font-bold whitespace-nowrap text-white/90 transition-colors active:bg-white/10"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden
              >
                <path d="M4 7h16l-1.2 12.1a2 2 0 0 1-2 1.9H7.2a2 2 0 0 1-2-1.9z" />
                <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
              </svg>
              팝업스토어 물품 보기
            </button>
          )}
        </div>
      </ArtStage>

      {showCatalog && <GoodsCatalog onClose={() => setShowCatalog(false)} />}
    </AppViewport>
  );
}
