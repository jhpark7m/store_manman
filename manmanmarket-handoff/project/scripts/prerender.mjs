// 빌드 후처리: 페이지 본문 프리렌더 + 구조화 데이터 + sitemap.xml / llms.txt 생성.
// `npm run build`에서 `vite build` 다음에 자동 실행됩니다.
//
// 왜 필요한가: 이 사이트는 React SPA라 원래 HTML에는 <div id="root"></div>만 있습니다.
// Google은 JS를 실행해 읽지만, GPTBot·ClaudeBot·PerplexityBot 같은 AI 크롤러와
// 네이버·다음 등 상당수 크롤러는 JS를 실행하지 않아 본문을 보지 못합니다.
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SITE = 'https://store.manmanmarket.com';
const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.prerender');
const today = new Date().toISOString().slice(0, 10);

await build({
  root, configFile: false, logLevel: 'warn', plugins: [react()],
  build: { ssr: resolve(root, 'src/entry-server.tsx'), outDir, emptyOutDir: true, rollupOptions: { output: { entryFileNames: 'entry-server.mjs' } } },
});
const { render, FAQS, STEPS, stores } = await import(pathToFileURL(resolve(outDir, 'entry-server.mjs')).href);
await rm(outDir, { recursive: true, force: true });

const brandName = '만만마켓';
const org = {
  '@type': 'Organization', '@id': `${SITE}/#organization`,
  name: '주식회사 셀렉티카', alternateName: ['SELECTIKA', brandName],
  url: `${SITE}/`, logo: `${SITE}/assets/hero-logo.png`, email: 'selectika@selectika.kr', telephone: '+82-2-6242-0229',
  taxID: '366-88-03550',
  address: { '@type': 'PostalAddress', streetAddress: '과천대로7길 33, 디테크타워 과천 A동 407호', addressLocality: '과천시', addressRegion: '경기도', addressCountry: 'KR' },
  brand: { '@type': 'Brand', name: brandName, slogan: '만만한 가격으로, 만족을 경험하다.' },
};
const website = { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: brandName, inLanguage: 'ko-KR', publisher: { '@id': `${SITE}/#organization` } };
const regionName = { 서울: '서울특별시', 경기: '경기도' };
const storeLd = (s) => ({
  '@type': 'GroceryStore', name: `${brandName} ${s.name}`, url: s.shop_url,
  brand: { '@type': 'Brand', name: brandName }, parentOrganization: { '@id': `${SITE}/#organization` },
  ...(s.address_text && { address: { '@type': 'PostalAddress', streetAddress: s.address_text, ...(s.district && { addressLocality: s.district }), ...(s.region && { addressRegion: regionName[s.region] }), addressCountry: 'KR' } }),
  ...(s.map_url && { hasMap: s.map_url }),
  sameAs: [s.shop_url, s.kakao_chat_url].filter(Boolean),
});
const storeNo = (s) => Number(s.shop_url.match(/\/minishop\/manman(\d+)/)?.[1] ?? 9999); // 점포 순서(호수)
const sortedStores = [...stores].sort((a, b) => storeNo(a) - storeNo(b) || a.name.localeCompare(b.name, 'ko'));
const count = (region) => stores.filter((s) => s.region === region).length;

const pages = {
  '/': {
    file: 'dist/index.html',
    ld: [org, website,
      { '@type': 'WebPage', '@id': `${SITE}/#webpage`, url: `${SITE}/`, name: '만만마켓 — 우리 동네 공동구매 장보기', isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${SITE}/#organization` }, inLanguage: 'ko-KR', dateModified: today },
      { '@type': 'HowTo', name: '만만마켓 이용 방법', step: STEPS.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.title, text: s.text })) },
      { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  },
  '/stores': {
    file: 'dist/stores/index.html',
    ld: [org, website,
      { '@type': 'CollectionPage', url: `${SITE}/stores`, name: '만만마켓 지점 찾기', isPartOf: { '@id': `${SITE}/#website` }, inLanguage: 'ko-KR', dateModified: today,
        breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '홈', item: `${SITE}/` }, { '@type': 'ListItem', position: 2, name: '지점 찾기', item: `${SITE}/stores` }] },
        mainEntity: { '@type': 'ItemList', numberOfItems: stores.length, itemListElement: sortedStores.map((s, i) => ({ '@type': 'ListItem', position: i + 1, item: storeLd(s) })) } },
    ],
  },
};

const ldScript = (graph) => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;

for (const [path, page] of Object.entries(pages)) {
  const file = resolve(root, page.file);
  let html = await readFile(file, 'utf8');
  if (!html.includes('<div id="root"></div>')) throw new Error(`${page.file}: 비어 있는 #root를 찾지 못했습니다(이미 프리렌더된 파일?)`);
  html = html
    .replace('<div id="root"></div>', `<div id="root">${render(path)}</div>`)
    .replace('</head>', `${ldScript(page.ld)}</head>`);
  await writeFile(file, html);
}

// 지점 목록 텍스트에 대해 AI가 쓰기 좋은 요약(https://llmstxt.org)
const storeLine = (s) => `- ${brandName} ${s.name}${s.address_text ? ` — ${s.address_text}` : ''} · [웹 주문](${s.shop_url})${s.kakao_chat_url ? ` · [카카오톡방](${s.kakao_chat_url})` : ' · 카카오톡방 준비 중'}`;
const llms = `# ${brandName}

> ${brandName}은 주식회사 셀렉티카가 운영하는 동네 공동구매 장보기 서비스입니다. 고객의 주문을 먼저 모아 함께 구매해 가격 부담을 낮추고, 주문한 상품은 가까운 오프라인 매장에서 픽업합니다. 현재 서울 ${count('서울')}곳, 경기 ${count('경기')}곳 등 총 ${stores.length}개 지점이 있습니다.

## 서비스 요약

- 매일 달라지는 공동구매 특가 상품을 지점별 카카오톡방과 웹 주문 페이지에서 안내합니다.
- 미리 주문하지 않아도 매장에서 상시 판매하는 상품(과일, 냉장·냉동 식품, 상온 상품)을 구매할 수 있습니다.
- 결제·주문·카카오톡방 참여는 각 지점의 외부 서비스(웹 주문 페이지, 카카오톡 오픈채팅)에서 진행됩니다.

## 이용 방법

${STEPS.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`).join('\n')}

## 자주 묻는 질문

${FAQS.map((f) => `- Q. ${f.q}\n  A. ${f.a}`).join('\n')}

## 주요 페이지

- [만만마켓 소개](${SITE}/): 서비스 소개, 품질 기준, 고객 후기, 이용 방법, FAQ
- [지점 찾기](${SITE}/stores): 전체 지점 목록과 지점별 웹 주문·카카오톡방 링크

## 지점 목록 (${stores.length}곳)

${sortedStores.map(storeLine).join('\n')}

## 회사 정보

- 상호: 주식회사 셀렉티카 (SELECTIKA) / 대표이사: 김정대 / 사업자등록번호: 366-88-03550
- 주소: 경기도 과천시 과천대로7길 33, 디테크타워 과천 A동 407호
- 전화: 02-6242-0229 / 이메일: selectika@selectika.kr
`;
await writeFile(resolve(root, 'dist/llms.txt'), llms);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(pages).map((p) => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
await writeFile(resolve(root, 'dist/sitemap.xml'), sitemap);

console.log(`Prerendered ${Object.keys(pages).length} pages, wrote llms.txt and sitemap.xml (${stores.length} stores).`);
