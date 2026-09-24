import { yPct } from "@/lib/design-coordinates";

export function InAppBrowserBanner() {
  return (
    <div
      className="absolute inset-x-4 rounded-lg bg-black/80 px-4 py-3 text-center text-[12px] leading-relaxed text-white"
      style={{ bottom: `calc(${yPct(201)} + 12px)` }}
    >

      카카오톡 등 앱 내 브라우저에서는 구글 로그인이 차단됩니다.
      <br />
      우측 상단 메뉴에서 <strong>외부 브라우저로 열기</strong>를 눌러주세요.
    </div>
  );
}
