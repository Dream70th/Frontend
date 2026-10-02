"use client";

import Image from "next/image";
import { useState } from "react";
import { AppViewport } from "@/components/AppViewport";
import { ArtStage } from "@/components/ArtStage";
import { LoginButton } from "@/components/LoginButton";
import { TrailButton } from "@/components/TrailButton";
import { InAppBrowserBanner } from "@/components/InAppBrowserBanner";
import { GoodsCatalog } from "@/components/GoodsCatalog";
import { hasCatalog } from "@/lib/goods-catalog";
import { yPct } from "@/lib/design-coordinates";

/**
 * 두 버튼과 그 사이 간격을 합친 높이. 글자 크기도 패딩도 고정이라 기기와
 * 상관없이 54 + 12 + 54 = 120px이다.
 */
const BUTTON_COLUMN_HEIGHT = 120;

/** 버튼 묶음의 위쪽이 더는 내려갈 수 없는 선. ArtStage 기준 좌표. */
const BUTTON_FLOOR = `calc(var(--app-height) - var(--art-top) - ${BUTTON_COLUMN_HEIGHT}px - 20px - var(--safe-bottom))`;

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
            every screen rather than shrinking with the artwork.

            On a short screen the poster scales down while the buttons keep
            their height, and design y=673 left the second button 4px off the
            bottom edge of an SE — close enough to clip its shadow. The floor
            lifts the whole column instead, and binds on no phone taller than
            that. */}
        <div
          className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
          style={{ top: `min(${yPct(673)}, ${BUTTON_FLOOR})` }}
        >
          <LoginButton isInAppBrowser={isInAppBrowser} />

          {/* 로그인 버튼과 같은 간판 모양. 포스터의 호수(어두운 면) 위라
              베이지 바탕이 잘 읽히고, 오른쪽 카라비너와도 겹치지 않는다. */}
          {hasCatalog() && (
            <TrailButton onClick={() => setShowCatalog(true)}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden
              >
                <path d="M4 7h16l-1.2 12.1a2 2 0 0 1-2 1.9H7.2a2 2 0 0 1-2-1.9z" />
                <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
              </svg>
              팝업플레이스 물품 보기
            </TrailButton>
          )}
        </div>
      </ArtStage>

      {showCatalog && <GoodsCatalog onClose={() => setShowCatalog(false)} />}
    </AppViewport>
  );
}
