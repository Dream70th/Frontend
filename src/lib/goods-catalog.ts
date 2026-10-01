// 팝업스토어에서 파는 물품 목록.
//
// 화면이 아니라 여기 한 곳만 고치면 되도록 데이터를 분리해 두었다. 가격이
// 바뀌거나 물품이 빠져도 컴포넌트는 건드릴 필요가 없다.
//
// 이 모듈은 일부러 "use client"를 붙이지 않는다. 서버 컴포넌트가 클라이언트
// 모듈에서 값을 import 하면 값이 아니라 클라이언트 참조가 넘어와 길이가 0으로
// 읽히는 일이 있었다(ZONES 건). 평범한 모듈로 두면 양쪽 모두 안전하다.

export type GoodsItem = {
  /** 안정적인 key. 사진 파일명과 맞춰두면 찾기 쉽다. */
  id: string;
  name: string;
  /** 원 단위. 아직 안 정해졌으면 null — 화면에 "가격 미정"으로 나간다. */
  price: number | null;
  description: string;
  /** public/images/goods-catalog/ 아래 경로. 없으면 자리표시 아이콘이 나온다. */
  image?: string;
  /** "한정 수량", "사이즈 S·M·L" 같은 짧은 꼬리말. */
  note?: string;
};

export type GoodsCategory = {
  slug: string;
  name: string;
  items: readonly GoodsItem[];
};

/**
 * 실제 물품명·가격·설명이 확정되어 아래 목록에 들어갔으면 true로 바꾼다.
 *
 * false인 동안에는 로그인 화면에 굿즈 보기 버튼이 아예 뜨지 않는다. 지금
 * 들어있는 내용은 화면을 짜기 위한 초안이고, 행사 방문객에게 틀린 가격을
 * 보여주는 것보다 버튼이 없는 편이 낫기 때문이다.
 */
export const CATALOG_READY = false;

// ⚠️ 아래는 전부 초안이다. 굿즈팀·의류팀에서 받은 실제 목록으로 교체할 것.
//    가격은 추측하지 않고 전부 null로 비워 두었다.
export const GOODS_CATALOG: readonly GoodsCategory[] = [
  {
    slug: "goods",
    name: "굿즈",
    items: [
      {
        id: "cap",
        name: "트레일 캠프캡",
        price: null,
        description: "70주년 로고를 자수로 올린 캠프 스타일 모자.",
      },
      {
        id: "mug",
        name: "70주년 머그컵",
        price: null,
        description: "트레일 엠블럼을 새긴 머그컵.",
      },
      {
        id: "bear",
        name: "곰 키링",
        price: null,
        description: "트레일을 함께 걷는 곰 캐릭터 키링.",
      },
      {
        id: "tag",
        name: "네임택 키링",
        price: null,
        description: "가방에 다는 네임택 모양 키링.",
      },
    ],
  },
  {
    slug: "clothing",
    name: "의류",
    items: [
      {
        id: "tee",
        name: "70주년 티셔츠",
        price: null,
        description: "포스터 타이포를 그대로 옮긴 반팔 티셔츠.",
        note: "사이즈 S · M · L · XL",
      },
      {
        id: "hoodie",
        name: "트레일 후드",
        price: null,
        description: "WHO MADE THIS TRAIL 레터링 후드 티셔츠.",
        note: "사이즈 M · L · XL",
      },
    ],
  },
];

/** 버튼을 띄울지 판단할 때 쓴다. 목록이 비어 있으면 보여줄 것도 없다. */
export function hasCatalog() {
  return CATALOG_READY && GOODS_CATALOG.some((c) => c.items.length > 0);
}

/** 1200 → "1,200원", null → "가격 미정" */
export function formatPrice(price: number | null) {
  return price === null ? "가격 미정" : `${price.toLocaleString("ko-KR")}원`;
}
