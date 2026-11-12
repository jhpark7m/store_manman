# 만만마켓 홈페이지 — 회사 전달본

2026-10-15 / Figma Sites에서 독립 실행 프로젝트로 이관

## 빠르게 확인하기

- `dist/`: 바로 업로드할 정적 배포 파일. 이 폴더의 **내용 전체**를 웹서버의 사이트 루트에 업로드합니다.
- `src/`: 수정 가능한 React + TypeScript 소스.
- `public/`: 원본 이미지, 로고, 파비콘, 공유 이미지와 Paperlogy 웹폰트.
- `docs/배포-안내.md`: 서버 설정 및 도메인 연결 안내.
- `docs/검증-결과.md`: 확인한 동작과 남은 확인 사항.
- `src/data/stores.json`: 지점 34개와 웹 주문·카카오톡 링크.
- 상위 전달 패키지의 `original/`: Figma에서 직접 복사한 수정 전 코드 12개. 배포 대상이 아닙니다.

## 로컬 실행

Node.js 22 이상과 npm이 필요합니다. 별도 API 키, Figma 로그인, 데이터베이스는 필요하지 않습니다.

```sh
npm ci
npm run build
npm run check
npm run preview
```

`http://127.0.0.1:4173`에서 확인합니다. 개발 중에는 `npm run dev`를 사용합니다.
`index.html`을 파일 탐색기에서 더블클릭하는 방식은 지원하지 않습니다.

## 제공 페이지

| 경로 | 소스 |
| --- | --- |
| `/` | `src/pages/home/main.tsx` |
| `/stores` | `src/pages/stores/main.tsx` |

홈페이지 소개·품질 영역은 `src/pages/home/intro-sections.tsx`에 있습니다.
원본 구성과 문구, 모바일 카드 회전, 후기, 이용 안내 11개 화면을 유지했습니다.
Figma 전용 페이지 이동 연결을 일반 웹 링크로 변경하고, 코드 속 이미지 데이터를 이미지 파일로 분리했습니다.
페이지별 코드를 나누어 방문한 페이지에 필요한 코드부터 불러옵니다.

## 지점 정보 변경

`src/data/stores.json`을 수정한 뒤 빌드하고 `dist/`를 다시 배포합니다.
`shop_url`은 웹 주문 주소, `kakao_chat_url`은 카카오톡방 주소입니다.
현재 웹 주문 34개와 카카오톡 33개가 있습니다. 왕십리 센트라스점(54)과 평택 용죽점(55)은 사용자 직접 제공 링크를 적용했습니다. 수지 신봉점(56)만 유효한 채팅방 URL이 확인되지 않아 `null`로 두었습니다. 화면에서는 ‘카카오톡방 준비 중’으로 표시됩니다.
확인된 주소를 `kakao_chat_url`에 넣으면 입장 버튼과 링크 복사 목록이 자동으로 활성화됩니다.
신규 3개 지점의 상세 주소·행정구역도 확인 전까지 비워 두었습니다. ‘전체’나 지점명 검색으로 찾을 수 있고, 확인 전에는 지역 필터에 포함되지 않습니다.

용인 한숲시티점(51)과 잠실 장미아파트점(52)은 사용자 지정 Cafe24 주소를 유지합니다. 잠실 웹 주소의 `?cate_no=430`과 카카오톡 `http://`를 임의로 정규화하지 마세요.

## 포함하지 않는 기능

상품 결제·주문·카카오톡방 참여는 기존 외부 서비스에서 진행됩니다. 이 프로젝트는 회사 소개, 지점 연결과 이용 안내를 제공합니다.
Figma 편집기, Figma 프로젝트 파일, 게시 계정이나 DNS 권한은 포함되지 않습니다.

## 배포 (Vercel)

```sh
npm run deploy
```

빌드 → 검증 → Vercel 운영 배포 → IndexNow 알림(Bing·네이버 등)까지 한 번에 실행합니다.
GitHub에 push해도 자동 배포되지 않으니 반드시 이 명령으로 배포하세요.

## 검색·AI 노출 (SEO)

- 빌드 시 `scripts/prerender.mjs`가 페이지 본문을 정적 HTML로 미리 채우고, 구조화 데이터(JSON-LD)·`sitemap.xml`·`llms.txt`를 생성합니다. JS를 실행하지 않는 AI 크롤러(GPTBot, ClaudeBot 등)도 본문을 읽을 수 있습니다.
- `stores.json`·FAQ 문구를 수정하면 구조화 데이터와 llms.txt에 자동 반영됩니다.
- `index.html`의 `google-site-verification`, `msvalidate.01`(Bing), `naver-site-verification` 메타 태그와 `public/naver*.html`, `public/<IndexNow 키>.txt`는 검색엔진 소유확인용이므로 지우지 마세요.
