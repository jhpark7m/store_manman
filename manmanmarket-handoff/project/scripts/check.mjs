import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const stores=JSON.parse(readFileSync('src/data/stores.json','utf8'));
const reference=JSON.parse(readFileSync('docs/store-links-reference.json','utf8'));
assert.equal(stores.length,34);
assert.equal(new Set(stores.map(s=>s.store_id)).size,34);
assert(!stores.some(s=>['점주몰','자체공급'].includes(s.name)));
for(const s of stores){
 const r=reference.stores.find(r=>r.store_id===s.store_id);assert(r);
 assert.equal(s.shop_url,r.shop_url);assert.equal(s.kakao_chat_url,r.kakao_chat_url);
 assert(/^https:\/\//.test(s.shop_url));
 assert(s.kakao_chat_url===null||/^https?:\/\/open\.kakao\.com\/o\/[A-Za-z0-9]+$/.test(s.kakao_chat_url));
}
assert.deepEqual(stores.filter(s=>!s.kakao_chat_url).map(s=>s.store_id),[56]);
const walk=d=>readdirSync(d).flatMap(n=>{const f=join(d,n);return statSync(f).isDirectory()?walk(f):[f]});
let refs=0;
for(const f of [...walk('src'),...walk('public').filter(f=>f.endsWith('.css'))]){
 const text=readFileSync(f,'utf8');
 for(const m of text.matchAll(/["'](\/assets\/[^"']+)["']/g)){assert(existsSync('public'+m[1]),`Missing asset: ${m[1]}`);refs++;}
 assert(!/https?:\/\/[^"'\s]+\.(png|jpe?g|woff2?)(?:["'])/.test(text),`Remote runtime asset in ${f}`);
}
for(const page of ['home','stores']){
 const code=readFileSync(`src/pages/${page}/main.tsx`,'utf8');
 for(const value of ['366-88-03550','김정대','디테크타워 과천 A동 407호','02-6242-0229','selectika@selectika.kr','Copyright ⓒ 2025 SELECTIKA. All rights reserved.'])assert(code.includes(value),`Missing footer in ${page}: ${value}`);
}
for(const file of ['index.html','stores/index.html','fonts.css'])assert(existsSync('dist/'+file));
console.log(JSON.stringify({passed:true,stores:stores.length,webLinks:stores.length,chatLinks:33,pendingChatLinks:1,assetReferences:refs,footerPages:2,staticEntryPages:2},null,2));
