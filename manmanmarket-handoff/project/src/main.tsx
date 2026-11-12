import React, { lazy, Suspense } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './global.css';
const Home = lazy(() => import('./pages/home/main'));
const Stores = lazy(() => import('./pages/stores/main'));
const path = window.location.pathname.replace(/\/(?:index\.html)?$/, '') || '/';
const Page = path === '/' ? Home : path === '/stores' ? Stores : null;
const container = document.getElementById('root')!;
// 빌드 결과물은 scripts/prerender.mjs가 본문을 미리 채워 둡니다(SEO·AI 크롤러용).
// 미리 채워진 경우 hydrate 하고, 개발 서버처럼 비어 있으면 일반 렌더링합니다.
const prerendered = container.hasChildNodes() && Page !== null;
const app = prerendered
  ? <React.StrictMode><Suspense fallback={null}><Page /></Suspense></React.StrictMode>
  : <Suspense fallback={<p className="loading" role="status">만만마켓을 불러오고 있어요.</p>}>
    {Page ? <Page /> : <main className="loading"><h1>페이지를 찾을 수 없어요.</h1><a href="/">홈으로 이동</a></main>}
  </Suspense>;
if (prerendered) hydrateRoot(container, app);
else createRoot(container).render(app);
