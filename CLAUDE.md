# 이 레포에 대한 안내 (레포 분리 addendum)

이 레포(`Frontend`)는 **Next.js 프론트엔드 전용**이다. Supabase 백엔드(스키마·RLS·RPC·마이그레이션)는 별도 백엔드 레포(`dream70th/back`)에서 진행한다. 아래 원본 명세는 원래 풀스택 단일 레포를 전제로 작성되었으므로, 이 레포에서는 다음 기준으로 해석한다.

- **이 레포가 담당**: Next.js(App Router) 프로젝트 전체 — UI, 라우팅, `proxy.ts`(Next.js 16부터 미들웨어의 새 이름, 기능은 동일)를 통한 세션 갱신, Google OAuth 콜백 라우트(`/auth/callback`), PWA manifest, Figma 디자인 구현. 즉 원본 명세의 Phase 0(Next.js+TS+Tailwind 셋업 부분)과 Phase 1 전체, 이후 Phase의 UI 부분
- **이 레포가 담당하지 않음**: DB 스키마, RLS 정책, RPC 함수(`get_my_progress`, `claim_code_stamp`, `start_game`/`finish_game` 등), 마이그레이션 — 전부 `back` 레포의 몫. 이 레포는 Supabase 클라이언트(`@supabase/ssr`)로 그 RPC를 **호출만** 한다
- `service_role` 키는 이 레포에 존재하지 않는다(브라우저 번들에 포함되면 안 됨). `.env.local`에는 `NEXT_PUBLIC_SUPABASE_URL`과 anon/publishable key만 둔다
- Supabase Auth의 Google Provider 활성화, Site URL/Redirect URL 등록은 Supabase 대시보드 설정이라 이 레포에 코드로 남지 않는다 (이미 완료됨 — `back` 레포 작업 시 함께 처리)
- Figma 파일: `cwius6nnDWHOfXxaPYthkx` (§4 참고). MCP로 직접 조회해 디자인 토큰·좌표를 추출하며, 없는 화면(도장 획득 UI, 게임, 완주 화면 등)은 임의로 만들지 않고 먼저 질문한다

Phase 진행은 원본 명세의 번호를 그대로 따르되, 이 레포 관점에서 실질적인 코드 작업이 있는 Phase(0의 프론트 셋업 부분, 1, 3의 UI, 4의 UI, 5, 6의 UI, 7)를 중심으로 진행 상황을 판단한다.

**Next.js 16 관련 참고**: 이 레포는 Next.js 16을 사용한다. `middleware.ts`가 아니라 `proxy.ts`(export 함수명도 `proxy`)를 쓴다. `cookies()`, `headers()` 등은 비동기(`await` 필요)다. 자세한 내용은 `node_modules/next/dist/docs/`를 참고한다.

---

# 팝업스토어 도장판 웹앱 — 원본 명세

> 아래는 원래 Claude Code에 붙여넣은 프로젝트 전체 명세(풀스택 기준)이며, 컨텍스트 유지를 위해 그대로 보존한다.

너는 이 프로젝트의 시니어 풀스택 개발자다. 아래 명세대로 모바일 웹앱(PWA)을 Phase 단위로 구현한다.

**이번 세션에서는 Phase 0~1까지만 진행하고, 끝나면 멈춰서 결과를 보고한다.** 다음 Phase는 내가 지시할 때 진행한다.

## 0. 작업 방식

- 코드 작성 전에 Plan 모드로 계획을 제시하고, 내 승인 후 구현한다
- 첫 작업으로 이 명세 전체를 프로젝트 루트 `CLAUDE.md`로 저장한다 (다음 세션에서도 컨텍스트 유지)
- 각 Phase 종료 시 보고: 변경 요약 / 실행·테스트 방법 / 내가 직접 해야 할 수동 작업 목록
- 명세에 없거나 모호한 핵심 사항은 임의 결정하지 말고 질문한다 (사소한 구현 세부는 자율 결정 후 보고)
- 소통은 한국어, 코드 식별자·커밋 메시지는 영어

## 1. 프로젝트 개요

- 컨셉: "WHO MADE THIS TRAIL" (70TH ANNIVERSARY) 캠핑·트레일 테마 팝업스토어
- 방문객이 4개 구역(굿즈·교회·의류·체험)을 돌며 도장을 모으는 **디지털 도장판 웹앱**
- 부가 기능: 팝업스토어 소개 페이지
- 운영 환경: 현장 단기 운영, 방문객은 QR로 접속, **모바일 세로 화면 전용** (디자인 기준 402×874)
- 4개 도장 완료 시 경품 응모에 자동 등록 → **Phase 6, 후순위** (지금은 구현하지 않고 확장 가능하게만 설계)

## 2. 기술 스택

- Next.js (App Router) + TypeScript (`strict: true`)
- Tailwind CSS
- Supabase: Auth(Google OAuth), Postgres, RLS, RPC(SECURITY DEFINER 함수)
- `@supabase/ssr` (서버·브라우저 클라이언트 분리, 미들웨어에서 세션 갱신)
- Zod (입력 검증), ESLint + Prettier
- PWA: manifest + 아이콘 (오프라인 캐싱은 최소한)
- 스키마는 Supabase CLI 마이그레이션(`supabase/migrations/`)으로 버전 관리
- 배포는 Vercel 가정 (Phase 7에서 확정)

## 3. 사용자 흐름

```
Google 로그인 → 메인(트레일 지도) → 구역 선택 → 도장 획득 → 4개 완료 → 완주 화면 → (Phase 6) 경품 응모 자동 등록
```

| 권장 순서 | 구역 | slug | 도장 획득 방식 |
|---|---|---|---|
| 1 | 굿즈 | goods | 모바일 게임 클리어 → 서버 검증 → 도장 |
| 2 | 교회 | church | 현장 게임 성공 → 운영자가 비밀번호 전달 → 웹앱에 입력 → 도장 |
| 3 | 의류 | clothing | 모바일 게임 클리어 → 서버 검증 → 도장 |
| 4 | 체험 | experience | 현장 게임 성공 → 운영자가 비밀번호 전달 → 웹앱에 입력 → 도장 |

- 굿즈→교회→의류→체험은 **권장 동선**일 뿐, 도장 획득은 순서를 강제하지 않는다 (현장 혼잡 대비) [가정, 변경 가능]
- 완주 조건: 4개 구역 도장 모두 획득
- 현장 게임 비밀번호는 **교회·체험 공통 단일 비밀번호**를 쓴다. 단, DB는 구역별 행으로 설계해 나중에 분리해도 코드 수정이 필요 없게 한다
- 운영자 화면은 만들지 않는다. 비밀번호 교체는 Supabase SQL로 수행한다

## 4. Figma 디자인

- 파일: https://www.figma.com/design/cwius6nnDWHOfXxaPYthkx/ (fileKey: `cwius6nnDWHOfXxaPYthkx`)
- Figma MCP가 연결돼 있으면 `get_design_context` / `get_screenshot` / `download_assets`로 각 노드를 직접 확인한다
- 연결돼 있지 않으면 `design/` 폴더의 스크린샷과 아래 좌표를 기준으로 구현한다
- 모든 프레임 크기는 402×874

| 노드 ID | 프레임 | 용도 |
|---|---|---|
| 2:4 | 로그인 | 타이틀 아트 + "Google로 시작하기" 버튼 |
| 5:74 | 메인 | 트레일 지도 (체크포인트 점만, 라벨 없음) |
| 6:256 | 전체메인 | 지도 + 4개 구역 라벨 버튼 |
| 6:143 | 굿즈 | 굿즈 구역 선택 상태 |
| 6:153 | 교회 | 교회 구역 선택 상태 |
| 6:163 | 의류 | 의류 구역 선택 상태 |
| 6:173 | 체험 | 체험 구역 선택 상태 |

**지도 체크포인트 중심 좌표 (402×874 기준)**

| 지점 | x | y | 비고 |
|---|---|---|---|
| 시작 | 115 | 645 | 하단 출발점 |
| 굿즈 | 219 | 531 | 라벨 버튼 108×43 @ (115, 558) |
| 교회 | 309 | 462 | 라벨 버튼 108×43 @ (165, 437) |
| 의류 | 201 | 365 | 라벨 버튼 108×43 @ (210, 313) |
| 체험 | 179 | 271 | 라벨 버튼 108×43 @ (62, 212) |
| 정상(깃발) | 282 | 103 | 완주 지점 |

**구현 원칙**

- 배경 지도는 래스터 이미지 1장으로 두고, 그 위에 체크포인트·라벨을 **컨테이너 대비 % 좌표로 절대 배치**한다 (기기 비율이 달라도 위치 유지). 컨테이너는 402:874 비율을 유지하며, 비율이 다른 화면에서는 **레터박스**(중앙 정렬 + 남는 영역 배경색 여백) 처리한다 — `src/components/LetterboxViewport.tsx` 참고
- 색상·폰트·간격 등 디자인 토큰은 Figma에서 추출한다. 임의로 만들지 않는다
- **체크포인트 점의 흰색 링/주황 채움**: Figma 프레임별로 있는 그대로 재현한다 — 구역 미선택("전체메인" 기준) 시 4개 모두 흰색 링, 특정 구역 탭 시 그 구역만 흰색·나머지는 주황 채움. 이는 **선택 상태**를 나타낼 뿐 도장 획득 여부와는 무관하다. 도장 획득 상태를 지도에 반영하는 것은 Phase 2(`get_my_progress`) 이후 과제이며, Figma에는 "도장 찍힌" 상태의 디자인이 없어 `src/components/StampBadge.tsx`에 자체 제작한 플레이스홀더로 준비해 둔다 (아직 화면에는 연결하지 않음)
- 아직 Figma에 없는 화면(소개 페이지, 비밀번호 입력, 게임, 완주)은 기존 스타일에 맞춰 만들되, 해당 Phase 시작 시 디자인 유무를 먼저 확인한다

## 5. 데이터 모델과 보안 원칙 (가장 중요, `back` 레포 담당)

**핵심 원칙: 도장은 클라이언트가 찍지 않는다. 검증을 통과한 서버 함수만 `stamps`에 기록한다.**

| 테이블 | 역할 | 클라이언트 권한 |
|---|---|---|
| `profiles` | 사용자 정보 (auth.users와 1:1, 가입 시 트리거로 생성) | 본인 행 읽기 |
| `zones` | 구역 4개 (slug, 이름, 순서, 획득 방식 `code`/`game`) | 읽기 |
| `stamps` | (user_id, zone_id) unique, 획득 시각 | 본인 행 읽기만, insert/update/delete 정책 없음 |
| `zone_codes` | 구역별 비밀번호 해시 | 접근 불가 |
| `code_attempts` | 비밀번호 시도 기록 | 접근 불가 |
| `game_sessions` | 게임 시작 시각·종료 시각·결과 | RPC 경유로만 접근 |

**서버 함수 (Postgres RPC, SECURITY DEFINER, `search_path` 고정)** — 이 레포에서는 `@supabase/ssr` 클라이언트로 호출만 한다

- `get_my_progress()` — 내 구역별 도장 상태
- `claim_code_stamp(zone_slug, code)` — 비밀번호 검증 후 도장 (교회·체험)
- `start_game(zone_slug)` / `finish_game(session_id, result)` — 세션 발급, 검증 후 도장 (굿즈·의류)

**필수 규칙 (back 레포 구현 기준, 프론트는 이 계약을 신뢰하고 호출)**

- 모든 테이블에 RLS 활성화. 기본 거부, 필요한 정책만 명시적으로 추가
- 비밀번호는 평문 저장 금지. `pgcrypto`의 bcrypt(`crypt`/`gen_salt`)로 해시
- 무차별 대입 방지: 사용자당 5회 연속 실패 시 60초 잠금, 시도는 `code_attempts`에 기록
- 같은 구역 도장 중복 방지: DB unique 제약 + 함수 내 멱등 처리 (이미 있으면 성공으로 응답)
- 서버 함수는 `anon` 실행 권한을 revoke하고 로그인 사용자만 호출 가능하게 한다
- `service_role` 키는 클라이언트 번들에 절대 포함하지 않는다. 환경변수는 `.env.local`, `.gitignore` 확인
- 모든 RPC 입력은 서버에서 검증한다. 게임 결과는 클라이언트 값을 그대로 믿지 않는다 (서버가 기록한 시작 시각, 최소 플레이 시간, 결과값 범위로 검증)

## 6. Phase별 구현 계획

| Phase | 내용 | 완료 기준 |
|---|---|---|
| 0 | 프로젝트 셋업 | Next.js+TS+Tailwind 실행, Supabase 클라이언트(브라우저/서버) 준비, 환경변수 예시 파일, 마이그레이션 폴더, PWA manifest 골격, lint·typecheck 통과 |
| 1 | 로그인 + 메인 지도 UI | Figma대로 로그인·메인 화면 구현, Google OAuth 동작, `/auth/callback`, 미로그인 시 `/login` 리다이렉트, 카카오톡 등 인앱 브라우저 감지 시 "외부 브라우저에서 열기" 안내. 지도는 도장 없는 정적 상태 |
| 2 | DB 스키마·RLS·도장 상태 | 마이그레이션, zones 시드, profiles 트리거, `get_my_progress`, 메인 지도가 실제 도장 상태 반영. **테스트**: 사용자 A의 도장이 B에게 보이지 않음, 클라이언트에서 `stamps` insert 시도 시 실패 |
| 3 | 현장 게임 비밀번호 도장 (교회·체험) | 비밀번호 입력 UI, `claim_code_stamp`, 시도 제한, 중복 방지. **테스트**: 정답 시 도장, 오답 5회 시 잠금 |
| 4 | 모바일 게임 (굿즈·의류) | 공통 게임 셸(`GameModule` 인터페이스, start→play→finish), `game_sessions`, 서버 검증. **게임 기획은 내가 별도 제공한다. 기획을 받기 전에는 셸과 자리표시 게임까지만 만들고 구체 게임은 구현하지 않는다** |
| 5 | 소개 페이지 + 완주 화면 | `/about`, 4개 도장 완료 시 완주 화면, 스태프에게 보여줄 수 있는 확인 UI |
| 6 | 경품 응모 (후순위) | `raffle_entries`(user_id unique), 완주 시 자동 등록, 개인정보 수집·이용 동의 화면, 운영자용 추출 SQL. **착수 전에 나와 먼저 논의** |
| 7 | 마감·배포 | PWA 마감(아이콘·설치 안내), 이미지 최적화, 실기기 QA(iOS Safari / Android Chrome / 카카오 인앱), RLS·권한 재점검, Vercel 배포, 운영 체크리스트(비밀번호 교체, DB 백업) |

## 7. 하지 말 것

- 클라이언트에서 `stamps`에 직접 insert/update 하기
- 게임 결과·점수·시간을 클라이언트 값만으로 판정하기
- 명세에 없는 기능(운영자 웹 화면, 랭킹, 푸시 알림 등) 임의 추가
- Figma 디자인을 임의로 바꾸기 (개선 제안은 구현 전에 질문으로)
- 이번 세션에서 Phase 2 이후 진행하기

## 8. 이번 세션 지시

1. 이 명세를 `CLAUDE.md`로 저장
2. Phase 0~1 계획을 Plan 모드로 제시 (파일 구조, 사용 라이브러리, 지도 좌표 배치 방식, 확인 필요 사항 포함)
3. 내 승인 후 Phase 0 → Phase 1 순서로 구현
4. 내가 직접 해야 할 수동 작업을 단계별 체크리스트로 제공
   - Supabase 프로젝트 생성 및 키 확인
   - Google Cloud OAuth 클라이언트 생성, 승인된 리디렉션 URI 등록
   - Supabase Auth에서 Google provider 활성화, Site URL·Redirect URL 등록
5. Phase 1 종료 후 멈추고 보고
