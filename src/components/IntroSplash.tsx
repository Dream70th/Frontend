"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * 앱을 열 때 잠깐 지나가는 인트로.
 *
 * 서버에서도 그려진다. 클라이언트에서만 띄우면 첫 프레임에 로그인 포스터가
 * 비쳤다가 덮이는 게 보인다.
 *
 * 한 세션에 한 번만 나온다. 구글 로그인은 같은 탭에서 밖으로 나갔다 돌아오는
 * 흐름이라, 매 페이지 로드마다 틀면 로그인을 누른 직후에 한 번 더 보게 된다.
 * sessionStorage는 그 왕복을 넘어 살아남으므로 "앱을 연 순간"에만 맞춰 뜬다.
 */

// 마지막 동작(점선 트레일)이 1.65초에 끝난다. 거기서 곧바로 걷으면 글자를
// 읽을 틈이 없어, 다 멎고 0.8초쯤 머문 뒤 사라지게 둔다.
const DURATION_MS = 2800;
const FADE_MS = 320;
const SEEN_KEY = "wmtt-intro-seen";

/** 사생활 보호 모드 등에서는 sessionStorage 접근 자체가 던진다. */
function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // 못 적어도 인트로는 이미 재생됐다. 다음 로드에 한 번 더 보는 정도다.
  }
}

export function IntroSplash() {
  const [phase, setPhase] = useState<"playing" | "leaving" | "done">("playing");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) {
      // 렌더가 한 번 더 도는 건 맞고, 여기서는 그게 의도다. 서버는 인트로를
      // 그려야 하고(안 그러면 첫 프레임에 포스터가 비친다) 이미 본 세션에서는
      // 클라이언트가 즉시 걷어내야 한다. 둘 다 하려면 이 한 번은 피할 수 없다.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("done");
      return;
    }

    // "봤다" 표시는 시작할 때가 아니라 끝날 때 적는다. 개발 모드의 Strict
    // Mode는 effect를 두 번 돌리는데, 시작할 때 적으면 첫 번째가 적은 것을
    // 두 번째가 읽어 인트로가 한 프레임도 안 보이고 사라진다.
    const leaving = setTimeout(
      () => setPhase("leaving"),
      DURATION_MS - FADE_MS,
    );
    const done = setTimeout(() => {
      markSeen();
      setPhase("done");
    }, DURATION_MS);
    return () => {
      clearTimeout(leaving);
      clearTimeout(done);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      // 기다리기 싫은 사람은 아무 데나 누르면 바로 넘어간다.
      onPointerDown={() => {
        markSeen();
        setPhase("done");
      }}
      className={`bg-letterbox fixed inset-x-0 top-0 z-50 flex flex-col items-center justify-center gap-6 px-10 transition-opacity ${
        phase === "leaving" ? "opacity-0" : "opacity-100"
      }`}
      style={{
        height: "var(--app-height)",
        transitionDuration: `${FADE_MS}ms`,
      }}
    >
      <Image
        src="/icons/icon-512.png"
        alt=""
        width={512}
        height={512}
        priority
        className="animate-intro-mark h-20 w-20"
      />

      <div className="flex flex-col items-center gap-2.5">
        <p
          className="animate-intro-rise text-[11px] font-bold tracking-[0.3em] text-[#FF5E00]"
          style={{ animationDelay: "350ms" }}
        >
          70TH ANNIVERSARY
        </p>
        <h1
          className="animate-intro-rise text-center text-[26px] leading-tight font-black tracking-tight text-white"
          style={{ animationDelay: "500ms" }}
        >
          WHO MADE
          <br />
          THIS TRAIL
        </h1>
      </div>

      <svg
        viewBox="0 0 240 12"
        className="animate-intro-reveal w-[200px]"
        style={{ animationDelay: "750ms" }}
        aria-hidden
      >
        <path
          d="M3 6 C 42 1, 70 11, 110 6 S 190 1, 237 6"
          fill="none"
          stroke="#FF5E00"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="10 9"
        />
      </svg>
    </div>
  );
}
