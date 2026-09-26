"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StampBoardArt } from "@/components/StampBoardArt";
import { ZONES } from "@/lib/zones";

/**
 * The payoff, shown once when the fourth stamp lands.
 *
 * Which is why it is not decided here: the server holds a flag, so the screen
 * survives the reload that follows the claim and still never comes back a
 * second time. Leaving it — by either button — is what marks it seen.
 */
export function CompletionScreen({
  onClose,
  onOpenBoard,
}: {
  onClose: () => void;
  onOpenBoard: () => void;
}) {
  const router = useRouter();
  const marked = useRef(false);
  const [leaving, setLeaving] = useState(false);

  async function leave(next: () => void) {
    if (leaving) return;
    setLeaving(true);

    if (!marked.current) {
      marked.current = true;
      const supabase = createClient();
      const { error } = await supabase.rpc("complete_celebration");
      // Not worth trapping anyone on a celebration over: the worst case is
      // seeing it once more.
      if (error) console.error("complete_celebration failed:", error.message);
      router.refresh();
    }

    next();
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") void leave(onClose);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="트레일 완주"
      className="absolute inset-0 z-40 bg-cover bg-bottom"
      style={{
        backgroundImage: "url('/images/goods/bg.png')",
        imageRendering: "pixelated",
      }}
    >
      <span aria-hidden className="absolute inset-0 bg-black/35" />

      <div
        className="absolute inset-x-0 flex flex-col"
        style={{ top: "var(--safe-top)", bottom: "var(--safe-bottom)" }}
      >
        <div className="px-6 pt-8 text-center">
          <p className="text-[11px] font-bold tracking-[0.3em] text-[#FFC9A3] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            TRAIL COMPLETE
          </p>
          <h2 className="mt-2 text-[26px] leading-tight font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
            완주를 축하합니다!
          </h2>
          <p className="mt-2.5 text-[13.5px] leading-relaxed font-semibold text-white/85 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            {ZONES.length}개 구역을 모두 돌고 정상에 올랐어요.
            <br />
            이제 경품에 응모하실 수 있습니다.
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center px-4">
          <StampBoardArt
            clearedZones={ZONES.map((zone) => zone.slug)}
            className="w-full max-w-[360px]"
            animate
          />
        </div>

        <div className="px-6 pb-4">
          <button
            type="button"
            onClick={() => void leave(onOpenBoard)}
            disabled={leaving}
            className="w-full rounded-full border-[3px] border-dotted border-[#FF5E00] bg-[#FF5E00] py-3.5 text-base font-bold text-white shadow-[0_4px_0_0_#cc4b00] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#cc4b00] disabled:opacity-70"
          >
            경품 응모하러 가기
          </button>
          <button
            type="button"
            onClick={() => void leave(onClose)}
            disabled={leaving}
            className="mt-2 w-full py-2.5 text-[13px] font-bold text-white/70 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
          >
            나중에 하기
          </button>
        </div>
      </div>
    </div>
  );
}
