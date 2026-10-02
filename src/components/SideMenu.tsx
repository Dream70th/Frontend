"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasCatalog } from "@/lib/goods-catalog";

export function SideMenu({
  onOpenGuide,
  onOpenPopupIntro,
  onOpenGoods,
  onOpenLogoIntro,
  onOpenContributors,
  onOpenStampBoard,
}: {
  onOpenGuide: () => void;
  onOpenPopupIntro: () => void;
  onOpenGoods: () => void;
  onOpenLogoIntro: () => void;
  onOpenContributors: () => void;
  onOpenStampBoard: () => void;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="메뉴 열기"
        aria-expanded={isOpen}
        className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-black shadow"
        style={{ top: "calc(1rem + var(--safe-top))" }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="h-5 w-5"
          aria-hidden
        >
          <line x1="4" x2="20" y1="7" y2="7" />
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="17" y2="17" />
        </svg>
      </button>

      <div
        onClick={() => setIsOpen(false)}
        aria-hidden
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <nav
        role="dialog"
        aria-modal="true"
        aria-label="메뉴"
        aria-hidden={!isOpen}
        className={`absolute inset-y-0 left-0 flex w-[72%] max-w-[300px] flex-col bg-[#E8DCC0] pt-[var(--safe-top)] pb-[var(--safe-bottom)] shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <span className="text-sm font-bold tracking-wide text-black">
            MENU
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="메뉴 닫기"
            tabIndex={isOpen ? 0 : -1}
            className="flex h-9 w-9 items-center justify-center rounded-full text-black hover:bg-black/5"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-5 w-5"
              aria-hidden
            >
              <line x1="6" x2="18" y1="6" y2="18" />
              <line x1="6" x2="18" y1="18" y2="6" />
            </svg>
          </button>
        </div>

        {/* 내 도장판 has no screen yet, and it is where the raffle will live:
            entry is automatic on the fourth stamp, so it is a status to read on
            the stamp board rather than a separate place to go. */}
        <ul className="flex-1 py-2">
          {[
            { label: "팝업플레이스 소개", open: onOpenPopupIntro },
            // 로그인 화면에서만 볼 수 있으면 들어온 뒤로는 가격을 다시 찾을
            // 길이 없다. 현장에서 값을 되짚어 보는 쪽이 더 잦다.
            ...(hasCatalog()
              ? [{ label: "팝업플레이스 물품", open: onOpenGoods }]
              : []),
            { label: "로고 소개", open: onOpenLogoIntro },
            { label: "내 도장판", open: onOpenStampBoard },
            { label: "Contributors", open: onOpenContributors },
            { label: "이용 안내", open: onOpenGuide },
          ].map(({ label, open }) => (
            <li key={label}>
              <button
                type="button"
                disabled={open === null}
                tabIndex={isOpen ? 0 : -1}
                onClick={
                  open === null
                    ? undefined
                    : () => {
                        setIsOpen(false);
                        open();
                      }
                }
                className={`flex w-full items-center justify-between px-5 py-3.5 text-left text-[15px] font-semibold ${
                  open === null
                    ? "text-black/40"
                    : "text-black hover:bg-black/5"
                }`}
              >
                {label}
                {open === null && (
                  <span className="text-[11px] font-medium text-black/30">
                    준비중
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* The verse the whole trail is named after, set as a pull quote. Sits
            above 로그아웃 so the last tappable row stays on the bottom edge.
            The decorative mark is a Latin glyph, so a serif face is safe here;
            the Korean text stays in the app font — synthesised Korean serif and
            italics look broken across devices. */}
        <figure className="relative mx-5 mb-4 rounded-2xl border-2 border-dotted border-black/15 bg-black/[0.04] px-4 pt-7 pb-3.5">
          <span
            aria-hidden
            className="absolute top-0 left-3 font-serif text-[52px] leading-none text-[#FF5E00]/30"
          >
            &ldquo;
          </span>
          <blockquote className="text-[13px] leading-[1.8] font-semibold text-black/70">
            내가 곧 길이요 진리요 생명이니 나로 말미암지 않고는 아버지께로 올
            자가 없느니라
          </blockquote>
          <figcaption className="mt-3 text-right text-[11px] font-bold tracking-wide text-black/40">
            — 요한복음 14:6
          </figcaption>
        </figure>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          tabIndex={isOpen ? 0 : -1}
          className="text-trail-orange border-t border-black/10 px-5 py-4 text-right text-[15px] font-bold disabled:opacity-60"
        >
          로그아웃
        </button>
      </nav>
    </>
  );
}
