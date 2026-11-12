// 빌드 시 프리렌더 전용 엔트리 (scripts/prerender.mjs 에서 사용).
// 검색엔진·AI 크롤러(GPTBot, ClaudeBot, PerplexityBot 등)는 대부분 JavaScript를 실행하지 않으므로
// 페이지 본문을 정적 HTML로 미리 만들어 둡니다. 브라우저에서는 main.tsx가 이 HTML을 hydrate 합니다.
import React, { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import Home, { FAQS, STEPS } from './pages/home/main';
import Stores from './pages/stores/main';
import stores from './data/stores.json';

// 구조화 데이터(JSON-LD)·llms.txt 생성용. 화면 문구와 같은 원본을 사용해 내용이 어긋나지 않게 합니다.
export { FAQS, STEPS, stores };

export function render(path: '/' | '/stores'): string {
  const Page = path === '/' ? Home : Stores;
  // main.tsx의 hydrate 트리(StrictMode > Suspense > Page)와 구조가 같아야 합니다.
  return renderToString(<React.StrictMode><Suspense fallback={null}><Page /></Suspense></React.StrictMode>);
}
