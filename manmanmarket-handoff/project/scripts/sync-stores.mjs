// 주문페이지 공개 지점 API(Supabase manman17 store-get)에서 새로 생긴 지점을 찾아
// src/data/stores.json과 docs/store-links-reference.json에 추가합니다.
// - 이미 있는 지점(store_id 기준)은 절대 수정·삭제하지 않습니다. 사용자 지정 링크(51·52 등)와
//   주문조회만 이탈한 지점(왕십리 센트라스점 54)도 그대로 유지됩니다.
// - chat_url / address가 URL이 아니면(신규 지점은 매장명이 들어 있음) null로 둡니다.
//   화면에는 '카카오톡방 준비 중'으로 표시되고, 나중에 URL을 넣으면 자동으로 활성화됩니다.
// 사용법: node scripts/sync-stores.mjs [--dry-run]
import { readFileSync, writeFileSync } from 'node:fs';

const STORES_PATH = 'src/data/stores.json';
const REFERENCE_PATH = 'docs/store-links-reference.json';
const SHOP_DOMAIN = 'https://manmanmarket.com';
const CAFE24_DOMAIN = 'https://manman17.cafe24.com';
const KAKAO_URL = /^https?:\/\/open\.kakao\.com\/o\/[A-Za-z0-9]+$/;
const MAP_URL = /^https:\/\/naver\.me\/[A-Za-z0-9]+$/;

const dryRun = process.argv.includes('--dry-run');
const stores = JSON.parse(readFileSync(STORES_PATH, 'utf8'));
const reference = JSON.parse(readFileSync(REFERENCE_PATH, 'utf8'));
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());

const response = await fetch(reference.source_api);
if (!response.ok) throw new Error(`지점 API 오류 (${response.status})`);
const apiStores = await response.json();

const excluded = new Set(reference.excluded_non_display_names || []);
const existingIds = new Set(stores.map(store => store.store_id));

const added = apiStores
  .filter(store => store.is_active && store.is_display && !excluded.has(store.name))
  .filter(store => !existingIds.has(store.id))
  .sort((a, b) => a.id - b.id)
  .map(store => {
    const link = String(store.link || '').trim();
    if (!/^\/minishop\/[A-Za-z0-9]+$/.test(link)) {
      throw new Error(`${store.name}(${store.id})의 link 형식이 예상과 다릅니다: ${link}`);
    }
    const rawChatUrl = String(store.chat_url || '').trim();
    const rawMapUrl = String(store.address || '').trim();
    return {
      store_id: store.id,
      name: String(store.name).trim(),
      shopUrl: SHOP_DOMAIN + link,
      cafe24ShopUrl: CAFE24_DOMAIN + link,
      kakaoChatUrl: KAKAO_URL.test(rawChatUrl) ? rawChatUrl : null,
      mapUrl: MAP_URL.test(rawMapUrl) ? rawMapUrl : null,
      rawChatUrl
    };
  });

if (!added.length) {
  console.log('새로 추가할 지점이 없습니다.');
  process.exit(0);
}

added.forEach(store => {
  console.log(`+ ${store.store_id} ${store.name} | ${store.shopUrl} | 카톡 ${store.kakaoChatUrl || '준비 중'} | 지도 ${store.mapUrl || '없음'}`);
});

if (dryRun) {
  console.log(`(dry-run) ${added.length}개 지점을 추가할 예정입니다.`);
  process.exit(0);
}

added.forEach(store => {
  stores.push({
    store_id: store.store_id,
    name: store.name,
    region: null,
    district: null,
    address_text: null,
    address_status: 'pending_official_address',
    map_url: store.mapUrl,
    shop_url: store.shopUrl,
    kakao_chat_url: store.kakaoChatUrl,
    link_source: `public_store_api_${today}`
  });
  reference.stores.push({
    store_id: store.store_id,
    name: store.name,
    shop_url: store.shopUrl,
    kakao_chat_url: store.kakaoChatUrl,
    cafe24_shop_url: store.cafe24ShopUrl,
    kakao_chat_status: store.kakaoChatUrl ? 'public_api' : 'pending_official_url',
    raw_chat_url: store.rawChatUrl
  });
});

reference.count = stores.length;
reference.last_sync_on = today;

writeFileSync(STORES_PATH, JSON.stringify(stores, null, 2) + '\n');
writeFileSync(REFERENCE_PATH, JSON.stringify(reference, null, 2) + '\n');
console.log(`${added.length}개 지점을 추가했습니다. (총 ${stores.length}개)`);
