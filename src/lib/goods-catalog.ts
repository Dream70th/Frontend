// 팝업스토어에서 파는 물품 목록.
//
// 출처는 노션 "드림교회 70주년 팝업플레이스 / 굿즈팀 · 의류팀"의 판매가 DB
// (굿즈 36개, 의류 8개). 물품명과 가격은 거기 적힌 그대로 옮겼고, 지어낸
// 값은 없다. 노션 쪽에는 설명란이 없어 description은 비어 있다.
//
// 노션에서 가격이 바뀌면 여기만 고치면 된다. 화면은 이 파일만 읽는다.
//
// 이 모듈은 일부러 "use client"를 붙이지 않는다. 서버 컴포넌트가 클라이언트
// 모듈에서 값을 import 하면 값이 아니라 클라이언트 참조가 넘어와 길이가 0으로
// 읽히는 일이 있었다(ZONES 건). 평범한 모듈로 두면 양쪽 모두 안전하다.

/** 같은 물품의 색상·디자인 선택지. 값이 하나뿐인 물품도 선택지 하나로 적는다. */
export type GoodsOption = {
  name: string;
  /** 원 단위. */
  price: number;
};

export type GoodsItem = {
  /** 안정적인 key. 사진 파일명과 맞춰두면 찾기 쉽다. */
  id: string;
  name: string;
  /** 최소 하나. 선택지가 하나뿐이면 물품 이름과 같은 이름을 쓴다. */
  options: readonly GoodsOption[];
  /** public/images/goods-catalog/ 아래 경로. 없으면 자리표시 아이콘이 나온다. */
  image?: string;
  /** 노션에는 없는 항목. 나중에 한 줄 설명을 붙이고 싶을 때 쓴다. */
  description?: string;
  /** "사이즈 S·M·L" 같은 짧은 꼬리말. */
  note?: string;
};

export type GoodsCategory = {
  slug: string;
  name: string;
  items: readonly GoodsItem[];
};

/**
 * 실제 물품명·가격이 들어가 있으면 true. false인 동안에는 로그인 화면에 물품
 * 보기 버튼이 뜨지 않는다 — 방문객에게 틀린 가격을 보여주는 것보다 버튼이
 * 없는 편이 낫기 때문이다.
 */
export const CATALOG_READY = true;

export const GOODS_CATALOG: readonly GoodsCategory[] = [
  {
    slug: "goods",
    name: "굿즈",
    items: [
      {
        id: "tincase",
        name: "틴케이스",
        options: [
          { name: "선글라스 예수님", price: 5000 },
          { name: "초록 배경 예수님", price: 5000 },
        ],
      },
      {
        id: "keyring",
        name: "키링",
        options: [
          { name: "십자가형", price: 3000 },
          { name: "키캡", price: 6000 },
          { name: "하트 JESUS", price: 6000 },
          { name: "NFC", price: 8000 },
        ],
      },
      {
        id: "pick",
        name: "피크",
        options: [
          { name: "투명 · 파랑", price: 1500 },
          { name: "검정 십자가", price: 1500 },
          { name: "노랑 MAKE A JOYFUL NOISE", price: 2000 },
          { name: "초록 TRACES", price: 2000 },
          { name: "피크 키링", price: 2000 },
        ],
      },
      {
        id: "cleaner",
        name: "멀티클리너",
        options: [
          { name: "초원 산", price: 4000 },
          { name: "숲", price: 4000 },
          { name: "설산", price: 4000 },
          { name: "노을 하늘", price: 4000 },
        ],
      },
      {
        id: "sticker",
        name: "스티커",
        options: [
          { name: "파랑", price: 1500 },
          { name: "초록", price: 1500 },
        ],
      },
      {
        id: "postcard",
        name: "엽서",
        options: [
          { name: "예수님과 아이", price: 1000 },
          { name: "하트", price: 1000 },
          { name: "성령의 열매", price: 1000 },
          { name: "JESUS IS WITH US", price: 1000 },
          { name: "커피 든 예수님", price: 1000 },
        ],
      },
      {
        id: "griptok",
        name: "그립톡",
        options: [
          { name: "산책 풍경", price: 5000 },
          { name: "70주년 로고", price: 5000 },
        ],
      },
      {
        id: "magnet",
        name: "마그넷 세트",
        options: [
          { name: "TRACES", price: 15000 },
          { name: "예수님", price: 15000 },
        ],
      },
      {
        id: "cardsticker",
        name: "카드 스티커",
        options: [
          { name: "예수님 인형", price: 8000 },
          { name: "십자가 드로잉", price: 8000 },
          { name: "잠든 예수님", price: 8000 },
        ],
      },
      // 텀블러(블랙·카키·화이트, 노션 기준 50,000원)는 뺐다. 가격이 다른
      // 굿즈와 한 자릿수 차이라 확인이 필요하다는 판단. 다시 넣을 때는
      // 노션 판매가 DB의 값을 확인하고 옮길 것.
      {
        id: "bookclip",
        name: "북클립",
        options: [{ name: "북클립", price: 2000 }],
      },
      {
        id: "photocard",
        name: "포토 카드",
        options: [
          { name: "포도나무", price: 1500 },
          { name: "WHAT A BEAUTIFUL NAME IT IS", price: 1500 },
          { name: "FOREVER", price: 1500 },
        ],
      },
    ],
  },
  {
    slug: "clothing",
    name: "의류",
    items: [
      {
        id: "longsleeve",
        name: "롱슬리브",
        options: [
          { name: "화이트", price: 20000 },
          { name: "네이비", price: 20000 },
          { name: "블랙", price: 20000 },
        ],
      },
      {
        id: "vest",
        name: "등산조끼",
        options: [
          { name: "화이트", price: 15000 },
          { name: "블랙", price: 15000 },
        ],
      },
      {
        id: "cap",
        name: "모자",
        options: [
          { name: "블랙", price: 25000 },
          { name: "베이지", price: 25000 },
        ],
      },
      {
        id: "socks",
        name: "양말",
        options: [{ name: "양말", price: 5000 }],
      },
    ],
  },
];

/** 버튼을 띄울지 판단할 때 쓴다. 목록이 비어 있으면 보여줄 것도 없다. */
export function hasCatalog() {
  return CATALOG_READY && GOODS_CATALOG.some((c) => c.items.length > 0);
}

/** 1200 → "1,200원" */
export function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

/**
 * 선택지 값이 전부 같으면 그 값, 아니면 null. 같을 때는 가격을 물품 이름 옆에
 * 한 번만 쓰고 선택지는 이름만 나열하면 되고, 다를 때는 선택지마다 값을
 * 붙여야 한다 — 키링처럼 3,000원과 8,000원이 한 묶음에 있는 물품이 있다.
 */
export function uniformPrice(item: GoodsItem): number | null {
  const [first, ...rest] = item.options;
  return rest.every((option) => option.price === first.price)
    ? first.price
    : null;
}

/** 값이 섞인 물품의 머리말: "3,000~8,000원" */
export function priceRange(item: GoodsItem) {
  const prices = item.options.map((option) => option.price);
  return `${Math.min(...prices).toLocaleString("ko-KR")}~${formatPrice(
    Math.max(...prices),
  )}`;
}
