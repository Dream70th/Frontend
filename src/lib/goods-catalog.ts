// 팝업플레이스에서 파는 물품 목록.
//
// 이름과 가격의 출처는 노션 "드림교회 70주년 팝업플레이스 / 굿즈팀 · 의류팀"의
// 판매가 DB다. 적힌 그대로 옮겼고 지어낸 값은 없다. 사진은 두 팀의 구글 시트
// 원본에서 가져왔다 — public/images/goods-catalog/README.md 참고.
//
// 노션 쪽에는 설명란이 없어 description은 비어 있다.
//
// 이 모듈은 일부러 "use client"를 붙이지 않는다. 서버 컴포넌트가 클라이언트
// 모듈에서 값을 import 하면 값이 아니라 클라이언트 참조가 넘어와 길이가 0으로
// 읽히는 일이 있었다(ZONES 건). 평범한 모듈로 두면 양쪽 모두 안전하다.

/** 같은 물품의 색상·디자인 선택지. 값이 하나뿐인 물품도 선택지 하나로 적는다. */
export type GoodsOption = {
  name: string;
  /** 원 단위. */
  price: number;
  /** public/images/goods-catalog/ 아래 경로. 없으면 자리표시 타일이 나온다. */
  image?: string;
};

export type GoodsItem = {
  /** 안정적인 key. 사진 파일명 앞머리와 맞춰두면 찾기 쉽다. */
  id: string;
  name: string;
  /** 최소 하나. 선택지가 하나뿐이면 물품 이름과 같은 이름을 쓴다. */
  options: readonly GoodsOption[];
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
 * 실제 물품명·가격이 들어가 있으면 true. false인 동안에는 로그인 화면과
 * 메뉴에 물품 보기가 뜨지 않는다 — 방문객에게 틀린 가격을 보여주는 것보다
 * 안 보이는 편이 낫기 때문이다.
 */
export const CATALOG_READY = true;

const img = (file: string) => `/images/goods-catalog/${file}.png`;

export const GOODS_CATALOG: readonly GoodsCategory[] = [
  {
    slug: "goods",
    name: "굿즈",
    items: [
      // 70주년 기념 제작품 셋을 한 묶음으로 둔다. 셋이라 타일 한 줄에 꼭
      // 맞고, 값이 다른 굿즈와 자릿수가 달라 목록 끝에 두면 못 보고
      // 지나치기 쉬워 앞에 세웠다. 수량·구성 안내는 물품마다 다르지만
      // 꼬리말은 묶음에 하나라 둘을 한 줄에 적는다.
      {
        id: "dreamgoods",
        name: "드림교회 굿즈",
        options: [
          { name: "레고", price: 50000, image: img("lego-0") },
          { name: "도자기 오브제", price: 100000, image: img("ceramic-0") },
          {
            name: "십자가 미니어처",
            price: 200000,
            image: img("cross-0"),
          },
        ],
        note: "레고 100개 한정, 도자기 오브제 전자초 포함",
      },
      {
        id: "tincase",
        name: "틴케이스",
        options: [
          { name: "선글라스 예수님", price: 5000, image: img("tincase-0") },
          { name: "초록 배경 예수님", price: 5000, image: img("tincase-1") },
        ],
      },
      {
        id: "keyring",
        name: "키링",
        options: [
          { name: "십자가형", price: 3000, image: img("keyring-0") },
          { name: "키캡", price: 6000, image: img("keyring-1") },
          { name: "하트 JESUS", price: 6000, image: img("keyring-2") },
          { name: "NFC", price: 8000, image: img("keyring-3") },
        ],
      },
      {
        id: "pick",
        name: "피크",
        options: [
          { name: "투명 · 파랑", price: 1500, image: img("pick-0") },
          { name: "검정 십자가", price: 1500, image: img("pick-1") },
          {
            name: "노랑 MAKE A JOYFUL NOISE",
            price: 2000,
            image: img("pick-2"),
          },
          { name: "초록 TRACES", price: 2000, image: img("pick-3") },
          { name: "피크 키링", price: 2000, image: img("pick-4") },
        ],
      },
      {
        id: "cleaner",
        name: "멀티클리너",
        options: [
          { name: "초원 산", price: 4000, image: img("cleaner-0") },
          { name: "숲", price: 4000, image: img("cleaner-1") },
          { name: "설산", price: 4000, image: img("cleaner-2") },
          { name: "노을 하늘", price: 4000, image: img("cleaner-3") },
        ],
      },
      {
        id: "sticker",
        name: "스티커",
        options: [
          { name: "파랑", price: 1500, image: img("sticker-0") },
          { name: "초록", price: 1500, image: img("sticker-1") },
        ],
      },
      {
        id: "postcard",
        name: "엽서",
        options: [
          { name: "예수님과 아이", price: 1000, image: img("postcard-0") },
          { name: "하트", price: 1000, image: img("postcard-1") },
          { name: "성령의 열매", price: 1000, image: img("postcard-2") },
          { name: "JESUS IS WITH US", price: 1000, image: img("postcard-3") },
          { name: "커피 든 예수님", price: 1000, image: img("postcard-4") },
        ],
      },
      {
        id: "griptok",
        name: "그립톡",
        options: [
          { name: "산책 풍경", price: 5000, image: img("griptok-0") },
          { name: "70주년 로고", price: 5000, image: img("griptok-1") },
        ],
      },
      {
        id: "magnet",
        name: "마그넷 세트",
        options: [
          { name: "TRACES", price: 15000, image: img("magnet-0") },
          { name: "예수님", price: 15000, image: img("magnet-1") },
        ],
      },
      {
        id: "cardsticker",
        name: "카드 스티커",
        options: [
          { name: "예수님 인형", price: 8000, image: img("cardsticker-0") },
          { name: "십자가 드로잉", price: 8000, image: img("cardsticker-1") },
          { name: "잠든 예수님", price: 8000, image: img("cardsticker-2") },
        ],
      },
      {
        id: "bookclip",
        name: "북클립",
        options: [{ name: "북클립", price: 2000, image: img("bookclip-0") }],
      },
      {
        id: "photocard",
        name: "포토 카드",
        options: [
          { name: "포도나무", price: 1500, image: img("photocard-0") },
          {
            name: "WHAT A BEAUTIFUL NAME IT IS",
            price: 1500,
            image: img("photocard-1"),
          },
          { name: "FOREVER", price: 1500, image: img("photocard-2") },
        ],
      },
      {
        id: "ecobag",
        name: "에코백",
        options: [{ name: "에코백", price: 6000, image: img("ecobag-0") }],
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
          { name: "화이트", price: 20000, image: img("longsleeve-0") },
          { name: "네이비", price: 20000, image: img("longsleeve-1") },
          { name: "블랙", price: 20000, image: img("longsleeve-2") },
        ],
      },
      {
        id: "vest",
        name: "등산조끼",
        options: [
          { name: "화이트", price: 15000, image: img("vest-0") },
          { name: "블랙", price: 15000, image: img("vest-1") },
        ],
      },
      {
        id: "cap",
        name: "모자",
        options: [
          { name: "블랙", price: 25000, image: img("cap-0") },
          { name: "베이지", price: 25000, image: img("cap-1") },
        ],
      },
      {
        id: "socks",
        name: "양말",
        options: [{ name: "양말", price: 5000, image: img("socks-0") }],
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
 * 한 번만 쓰고 타일에는 이름만 붙이면 되고, 다를 때는 타일마다 값을 달아야
 * 한다 — 키링처럼 3,000원과 8,000원이 한 묶음에 있는 물품이 있다.
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
