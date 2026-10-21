import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './global.css';
const Home = lazy(() => import('./pages/home/main'));
const Stores = lazy(() => import('./pages/stores/main'));
const path = window.location.pathname.replace(/\/(?:index\.html)?$/, '') || '/';
const Page = path === '/' ? Home : path === '/stores' ? Stores : null;
createRoot(document.getElementById('root')!).render(
  <Suspense fallback={<p className="loading" role="status">만만마켓을 불러오고 있어요.</p>}>
    {Page ? <Page /> : <main className="loading"><h1>페이지를 찾을 수 없어요.</h1><a href="/">홈으로 이동</a></main>}
  </Suspense>
);
