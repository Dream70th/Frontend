"use client";

import Image from "next/image";
import { Body, Eyebrow, InfoSheet, SectionTitle } from "@/components/InfoSheet";
import {
  GOODS_CATALOG,
  formatPrice,
  type GoodsItem,
} from "@/lib/goods-catalog";

/**
 * 팝업스토어 물품 안내. 로그인 전에도 볼 수 있어야 해서 메뉴가 아니라 로그인
 * 화면에서 직접 열린다.
 *
 * 카드는 세로가 아니라 가로로 짰다. 설명이 한 줄로 끝나지 않는 물품이 있어서
 * 2열 그리드로 두면 카드마다 높이가 들쭉날쭉해지는데, 썸네일을 왼쪽에 두고
 * 글을 오른쪽에 흘리면 길이가 달라도 줄이 맞는다.
 */
function GoodsCard({ item }: { item: GoodsItem }) {
  return (
    <li className="flex gap-3.5 rounded-2xl bg-white/6 p-3.5">
      {item.image ? (
        <Image
          src={item.image}
          alt={item.name}
          width={176}
          height={176}
          className="h-[76px] w-[76px] shrink-0 rounded-xl object-cover"
        />
      ) : (
        // 사진이 아직 없는 물품. 빈 칸으로 두면 줄이 무너지니 같은 크기의
        // 자리를 지키고 산 모양 하나만 넣어 둔다.
        <div
          aria-hidden
          className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-xl bg-white/6"
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
          <h5 className="truncate text-[14.5px] font-bold text-white">
            {item.name}
          </h5>
          <span
            className={`shrink-0 text-[13.5px] font-bold ${
              item.price === null ? "text-white/35" : "text-[#FF5E00]"
            }`}
          >
            {formatPrice(item.price)}
          </span>
        </div>
        <p className="mt-1.5 text-[12.5px] leading-[1.65] font-medium text-white/60">
          {item.description}
        </p>
        {item.note && (
          <p className="mt-1.5 text-[11px] font-bold tracking-wide text-white/35">
            {item.note}
          </p>
        )}
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
        인천 드림교회 70주년 팝업플레이스에서 준비한 굿즈와 의류입니다. 수량이
        한정되어 있어 조기에 마감될 수 있습니다.
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
