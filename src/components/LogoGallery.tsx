"use client";

import Image from "next/image";
import { useRef, useState } from "react";

/**
 * The logo's other applications, as a swipeable gallery. Each slide keeps its
 * own aspect ratio inside a fixed box, since the three artworks are shaped
 * quite differently.
 */
const VARIANTS = [
  { src: "/images/about/logo-v1.jpg", width: 900, height: 606, alt: "TA 모노그램 심볼과 Trust · Trace · Reach the top 태그라인" },
  { src: "/images/about/logo-v2.jpg", width: 900, height: 397, alt: "반전 심볼과 설산 이미지를 나란히 둔 버전" },
  { src: "/images/about/logo-v3.jpg", width: 900, height: 524, alt: "등고선 지도 위 정상으로 이어지는 트레일과 TRACES 워드마크" },
] as const;

export function LogoGallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    if (next !== index) setIndex(next);
  }

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="-mx-6 flex snap-x snap-mandatory overflow-x-auto scroll-smooth px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {VARIANTS.map((variant) => (
          <div key={variant.src} className="w-full shrink-0 snap-center pr-3 last:pr-0">
            <div className="flex aspect-4/3 items-center justify-center rounded-2xl bg-white p-3">
              <Image
                src={variant.src}
                alt={variant.alt}
                width={variant.width}
                height={variant.height}
                className="max-h-full w-full object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        {VARIANTS.map((variant, variantIndex) => (
          <span
            key={variant.src}
            aria-hidden
            className={`h-1.5 rounded-full transition-all ${
              variantIndex === index ? "w-4 bg-[#FF5E00]" : "w-1.5 bg-white/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
