"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TrailButton } from "@/components/TrailButton";

/**
 * 계정을 묻지 않고 바로 시작한다.
 *
 * 로그인을 없앴다고 세션까지 없앤 것은 아니다. Supabase 익명 로그인은 진짜
 * auth.users 행을 하나 만들어 주므로 auth.uid()에 기대고 있는 RLS와 RPC가
 * 그대로 돌아간다 — 도장은 여전히 서버만 찍고, 클라이언트는 남의 줄은커녕
 * 제 테이블도 직접 읽지 못한다. 이름과 부서는 다음 화면에서 받는다.
 *
 * 대가는 세션이 그 브라우저에 묶인다는 점이다. 방문객이 사파리에서 열었다가
 * 크롬으로 옮기거나 저장공간을 비우면 모아둔 도장을 따라오게 할 길이 없다.
 * 하루짜리 행사에서는 그 위험이 로그인 한 단계를 세우는 것보다 싸다.
 *
 * 구글을 쓰지 않으므로 카카오톡 같은 인앱 브라우저도 더는 막을 이유가 없다.
 * 구글이 임베디드 웹뷰에서 OAuth를 거부해서 세웠던 안내였다.
 */
export function LoginButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  async function handleStart() {
    setIsLoading(true);
    setHasFailed(false);

    const supabase = createClient();
    const { error } = await supabase.auth.signInAnonymously();

    if (error) {
      // 말없이 멈추면 방문객은 버튼이 죽은 줄 알고 계속 누른다. 글자를 바꾸고
      // 다시 누를 수 있게 돌려놓는다 — 레이아웃은 건드리지 않는다.
      setHasFailed(true);
      setIsLoading(false);
      return;
    }

    // 미들웨어는 쿠키를 보고 판단한다. replace 로 로그인 화면을 뒤로가기에
    // 남기지 않고, refresh 로 서버 쪽 판단을 새로 받는다.
    router.replace("/");
    router.refresh();
  }

  return (
    <TrailButton onClick={handleStart} disabled={isLoading}>
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
        <path d="M3 20h18" />
        <path d="M7 20V9l5-5 5 5v11" />
        <path d="M10 20v-5h4v5" />
      </svg>
      {isLoading
        ? "여는 중…"
        : hasFailed
          ? "다시 눌러주세요"
          : "도장판 시작하기"}
    </TrailButton>
  );
}
