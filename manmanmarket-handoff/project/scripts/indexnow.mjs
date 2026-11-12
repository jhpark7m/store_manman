// IndexNow: 사이트가 바뀌었다고 검색엔진에 즉시 알립니다(https://www.indexnow.org).
// api.indexnow.org 한 곳에 보내면 Bing·네이버·Yandex·Seznam 등 참여 검색엔진에 공유됩니다.
// 네이버에는 확실히 전달되도록 네이버 엔드포인트에도 직접 보냅니다.
// `npm run deploy`에서 운영 배포 후 자동 실행됩니다. 수동 실행: `node scripts/indexnow.mjs`
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const HOST = 'store.manmanmarket.com';
const KEY = '714427ac4ec931ef6900725be63693fe'; // public/<KEY>.txt 와 같아야 합니다.
const root = resolve(import.meta.dirname, '..');

// 제출할 URL은 sitemap.xml에서 읽습니다(dist가 없으면 기본 페이지).
let urlList = [`https://${HOST}/`, `https://${HOST}/stores`];
try {
  const sitemap = await readFile(resolve(root, 'dist/sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (urls.length) urlList = urls;
} catch { /* dist 없이도 동작 */ }

// 운영 사이트에 키 파일이 실제로 올라가 있어야 검색엔진이 요청을 받아들입니다.
const keyLocation = `https://${HOST}/${KEY}.txt`;
// 배포 직후에는 도메인 전환에 몇 초 걸리므로 최대 약 1분간 재시도합니다.
let live = '';
for (let attempt = 0; attempt < 12 && live.trim() !== KEY; attempt++) {
  if (attempt) await new Promise((r) => setTimeout(r, 5000));
  live = await fetch(`${keyLocation}?t=${Date.now()}`, { cache: 'no-store' }).then((r) => (r.ok ? r.text() : '')).catch(() => '');
}
if (live.trim() !== KEY) {
  console.error(`IndexNow 중단: ${keyLocation} 에서 키를 확인하지 못했습니다. 운영 배포가 끝났는지 확인하세요.`);
  process.exit(1);
}

const body = JSON.stringify({ host: HOST, key: KEY, keyLocation, urlList });
let failed = false;
for (const endpoint of ['https://api.indexnow.org/indexnow', 'https://searchadvisor.naver.com/indexnow']) {
  try {
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body });
    // 200 OK / 202 Accepted 가 정상입니다.
    const ok = res.status === 200 || res.status === 202;
    if (!ok) failed = true;
    console.log(`${ok ? '✓' : '✗'} ${endpoint} → ${res.status}${ok ? '' : ' ' + (await res.text()).slice(0, 200)}`);
  } catch (error) {
    failed = true;
    console.log(`✗ ${endpoint} → ${error.message}`);
  }
}
console.log(`IndexNow: ${urlList.length}개 URL 제출 (${urlList.join(', ')})`);
if (failed) process.exitCode = 1;
