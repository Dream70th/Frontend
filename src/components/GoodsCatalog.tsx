"use client";

import Image from "next/image";
import { Body, Eyebrow, InfoSheet, SectionTitle } from "@/components/InfoSheet";
import {
  GOODS_CATALOG,
  formatPrice,
  priceRange,
  uniformPrice,
  type GoodsItem,
} from "@/lib/goods-catalog";

/**
 * 팝업스토어 물품 안내. 로그인 전에도 볼 수 있어야 해서 메뉴가 아니라 로그인
 * 화면에서 직접 열린다.
 *
 * 노션의 판매가 표는 색상·디자인별로 한 줄씩이라 44줄이다. 엽서 다섯 줄이
 * 전부 1,000원인 식이어서 그대로 옮기면 같은 값만 반복된다. 그래서 물품으로
 * 묶고 선택지는 아래에 늘어놓되, 값이 섞인 물품(키링 3,000~8,000원)만 선택지
 * 옆에 값을 따로 붙인다 — 빠진 정보 없이 줄 수만 44에서 16으로 준다.
 */
function GoodsCard({ item }: { item: GoodsItem }) {
  const uniform = uniformPrice(item);
  const hasChoices = item.options.length > 1;

  return (
    <li className="rounded-2xl bg-white/6 p-4">
      <div className="flex gap-3.5">
        {/* 사진은 흰 바탕 정사각형으로 맞춰 두었다. 지금은 열다섯 묶음 모두
            한 장씩 있지만, 빠진 물품이 생겨도 같은 크기의 자리를 지켜 글머리가
            어긋나지 않게 한다. */}
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            width={256}
            height={256}
            className="h-16 w-16 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/6"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
              className="h-7 w-7 text-white/25"
            >
              <path d="M3 19h18L14 6l-3.5 6.5L8 9z" />
            </svg>
          </div>
        )}

        <div className="min-w-0 flex-1">
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

          {hasChoices &&
            (uniform === null ? (
              // 값이 섞인 물품: 선택지마다 값을 붙인다.
              <ul className="mt-2.5 flex flex-col gap-1">
                {item.options.map((option) => (
                  <li
                    key={option.name}
                    className="flex items-baseline justify-between gap-3 text-[12.5px]"
                  >
                    <span className="truncate font-medium text-white/55">
                      {option.name}
                    </span>
                    <span className="shrink-0 font-bold text-white/80">
                      {formatPrice(option.price)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {item.options.map((option) => (
                  <li
                    key={option.name}
                    className="rounded-full bg-white/8 px-2.5 py-1 text-[11.5px] font-semibold text-white/60"
                  >
                    {option.name}
                  </li>
                ))}
              </ul>
            ))}

          {item.note && (
            <p className="mt-2 text-[11px] font-bold tracking-wide text-white/35">
              {item.note}
            </p>
          )}
        </div>
      </div>
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
        디자인은 물품마다 아래에 적어두었습니다.
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
    </InfoSheet>
  );
}
