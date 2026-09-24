"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Placeholder entries — the matching screens land in later phases.
const MENU_ITEMS = [
  "팝업스토어 소개",
  "내 도장판",
  "경품 응모",
  "이용 안내",
] as const;

export function SideMenu() {
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
        className="absolute top-4 left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-black shadow"
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
        className={`absolute inset-y-0 left-0 flex w-[72%] max-w-[300px] flex-col bg-[#E8DCC0] shadow-2xl transition-transform duration-300 ease-out ${
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

        <ul className="flex-1 py-2">
          {MENU_ITEMS.map((label) => (
            <li key={label}>
              <button
                type="button"
                disabled
                tabIndex={isOpen ? 0 : -1}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left text-[15px] font-semibold text-black/40"
              >
                {label}
                <span className="text-[11px] font-medium text-black/30">
                  준비중
                </span>
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          tabIndex={isOpen ? 0 : -1}
          className="text-trail-orange border-t border-black/10 px-5 py-4 text-left text-[15px] font-bold disabled:opacity-60"
        >
          로그아웃
        </button>
      </nav>
    </>
  );
}
