"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Full-frame scrollable overlay for the reading screens reached from the menu
 * (팝업스토어 소개, 로고 소개). The guide is a paged carousel; these are long
 * copy, so they scroll instead.
 */
export function InfoSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="absolute inset-0 z-30 flex flex-col bg-[#171512] pt-[var(--safe-top)] pb-[var(--safe-bottom)]"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
        <h2 className="text-[15px] font-bold text-white">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10"
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

      <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6">
        {children}
      </div>
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-bold tracking-[0.22em] text-[#FF5E00]">
      {children}
    </p>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-1.5 text-lg leading-snug font-bold text-white">
      {children}
    </h3>
  );
}

export function Body({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2.5 text-[13.5px] leading-[1.75] font-medium text-white/65">
      {children}
    </p>
  );
}
