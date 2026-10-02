import type { ReactNode } from "react";

/**
 * 로그인 화면의 버튼 생김새. 포스터 위에 얹히는 캠프 간판 같은 모양 —
 * 베이지 바탕에 주황 점선 테두리, 아래로 4px 그림자, 누르면 그만큼 내려앉는다.
 *
 * 구글 로그인과 물품 보기가 같은 모양을 쓰므로 클래스 목록을 한곳에 둔다.
 * 양쪽에 길게 복사해 두면 한쪽만 고쳐져 어긋나기 쉽다.
 *
 * 폭은 자기 글자가 아니라 부모가 정한다(w-full). 둘을 감싼 열이 w-max라
 * 열의 폭은 더 긴 쪽("팝업플레이스 물품 보기")이 정하고, 짧은 쪽도 거기에
 * 맞춰 늘어난다 — 어느 쪽 글자가 바뀌어도 둘은 계속 같은 폭이다.
 */
export function TrailButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="border-trail-orange flex w-full items-center justify-center gap-2.5 rounded-full border-[3px] border-dotted bg-[#D9C27E] px-6 py-3 text-base font-bold whitespace-nowrap text-black shadow-[0_4px_0_0_#cc4b00] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#cc4b00] disabled:opacity-60 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_0_#cc4b00]"
    >
      {children}
    </button>
  );
}
