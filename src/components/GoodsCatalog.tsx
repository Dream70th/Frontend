"use client";

import Image from "next/image";
import { Body, Eyebrow, InfoSheet, SectionTitle } from "@/components/InfoSheet";
import {
  GOODS_CATALOG,
  formatPrice,
  priceRange,
  uniformPrice,
  type GoodsItem,
  type GoodsOption,
} from "@/lib/goods-catalog";

/**
 * 팝업스토어 물품 안내. 로그인 전에도 볼 수 있어야 해서 로그인 화면에서 바로
 * 열리고, 들어온 뒤에는 메뉴에서 다시 열린다.
 *
 * 물품은 색상·디자인별로 타일을 깐다. 노션의 판매가 표는 변종마다 한 줄이라
 * 41줄이고 엽서 다섯 줄이 전부 1,000원인 식이어서, 물품으로 묶어 머리말에
 * 값을 한 번 쓰고 그 아래에 변종을 늘어놓는다. 가로 스크롤 대신 3열 격자인
 * 이유는 화면 밖으로 밀린 디자인을 아무도 밀어보지 않기 때문이다.
 */
function OptionTile({
  option,
  showPrice,
  showName,
}: {
  option: GoodsOption;
  /** 묶음 안에서 값이 갈릴 때만 타일에 값을 단다. */
  showPrice: boolean;
  /** 선택지가 하나뿐이면 이름이 물품 이름과 같아 중복이다. */
  showName: boolean;
}) {
  return (
    <li className="flex flex-col">
      {option.image ? (
        <Image
          src={option.image}
          alt={option.name}
          width={320}
          height={320}
          className="aspect-square w-full rounded-lg object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="flex aspect-square w-full items-center justify-center rounded-lg bg-white/6"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            className="h-6 w-6 text-white/25"
          >
            <path d="M3 19h18L14 6l-3.5 6.5L8 9z" />
          </svg>
        </div>
      )}
      {/* 이름 자리를 두 줄로 고정한다. 한 줄짜리와 두 줄짜리가 한 행에 섞이면
          (피크의 "노랑 MAKE A JOYFUL NOISE") 그 타일만 가격이 내려앉는다. */}
      {showName && (
        <p className="mt-1.5 line-clamp-2 min-h-[2.6em] text-[11px] leading-snug font-semibold break-keep text-white/60">
          {option.name}
        </p>
      )}
      {showPrice && (
        <p className="mt-auto pt-0.5 text-[11.5px] font-bold text-white/85">
          {formatPrice(option.price)}
        </p>
      )}
    </li>
  );
}

function GoodsCard({ item }: { item: GoodsItem }) {
  const uniform = uniformPrice(item);

  return (
    <li className="rounded-2xl bg-white/6 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h5 className="truncate text-[15px] font-bold text-white">
          {item.name}
        </h5>
        <span className="shrink-0 text-[13.5px] font-bold text-[#FF5E00]">
          {uniform === null ? priceRange(item) : formatPrice(uniform)}
        </span>
      </div>

      {item.description && (
        <p className="mt-1.5 text-[12.5px] leading-[1.65] font-medium text-white/60">
          {item.description}
        </p>
      )}

      <ul className="mt-3 grid grid-cols-3 gap-2">
        {item.options.map((option) => (
          <OptionTile
            key={option.name}
            option={option}
            showPrice={uniform === null}
            showName={item.options.length > 1}
          />
        ))}
      </ul>

      {item.note && (
        <p className="mt-2.5 text-[11px] font-bold tracking-wide text-white/35">
          {item.note}
        </p>
      )}
    </li>
  );
}

export function GoodsCatalog({ onClose }: { onClose: () => void }) {
  return (
    <InfoSheet title="팝업스토어 물품" onClose={onClose}>
      <Eyebrow>WHO MADE THIS TRAIL</Eyebrow>
      <SectionTitle>현장에서 만나는 물품</SectionTitle>
      <Body>
        인천 드림교회 70주년 팝업플레이스에서 준비한 굿즈와 의류입니다. 색상과
        디자인은 물품마다 아래에 늘어놓았습니다.
      </Body>

      <div className="mt-7 flex flex-col gap-7">
        {GOODS_CATALOG.filter((category) => category.items.length > 0).map(
          (category) => (
            <section key={category.slug}>
              <h4 className="text-[13px] font-bold tracking-wide text-[#FF5E00]">
                {category.name}
              </h4>
              <ul className="mt-3 flex flex-col gap-2.5">
                {category.items.map((item) => (
                  <GoodsCard key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ),
        )}
      </div>

      <div className="mt-8 mb-2 rounded-2xl bg-[#FF5E00]/12 px-5 py-4">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#FF5E00]">
          2026.10.04
        </p>
        <p className="mt-2 text-[13px] leading-relaxed font-medium text-white/70">
          인천 드림교회 1층 비전홀 &amp; 카페에서 만나실 수 있습니다. 가격과
          수량은 현장 사정에 따라 달라질 수 있습니다.
        </p>
      </div>
    </InfoSheet>
  );
}
