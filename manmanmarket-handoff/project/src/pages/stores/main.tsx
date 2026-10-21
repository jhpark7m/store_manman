import storesData from "../../data/stores.json";
import React, { useEffect, useMemo, useRef, useState } from "react";

/* 만만마켓 지점 찾기 / 2026-10-03 / Figma Sites code component.
 * 34 customer-visible stores checked 2026-10-15; see ../../data/stores.json.
 * IDs 51 and 52 preserve the user's explicit Cafe24 / query / HTTP exceptions.
 * Address evidence: 29 public records; IDs 51, 52, 54, 55 and 56 remain unknown. ID 56 has a pending chat URL; IDs 54–55 use user-confirmed links.
 * Map URLs are retained as data only, because their destinations need rechecking.
 * No account login, room joining, analytics, geolocation, or publishing is performed.
 * Root routing: set homeUrl to the actual site's verified home route.
 */

const DEFAULT_HOME_URL = "/";
const SESSION_KEY = "mm-stores:browse:v1";
const RECENT_KEY = "mm-stores:recent:v1";
const PAGE_SIZE = 9;
const LOGO = "/assets/logo.svg";
const FOOTER_LOGO = "/assets/footer-logo.png";
const CHARACTER = "/assets/character.png";

type Region = "서울" | "경기";
type Store = {
  store_id: number;
  name: string;
  region: Region | null;
  district: string | null;
  address_text: string | null;
  address_status: string;
  map_url: string | null;
  shop_url: string;
  kakao_chat_url: string | null;
  link_source?: string;
};

const STORES = storesData as Store[];

const SORTED_STORES = [...STORES].sort((a, b) => a.name.localeCompare(b.name, "ko"));
const STORE_BY_ID = new Map(STORES.map((store) => [store.store_id, store]));
const normalise = (value: string) => value.normalize("NFKC").replace(/\s+/g, "").toLocaleLowerCase("ko");
const SEARCH_TEXT = new Map(STORES.map((store) => [store.store_id, normalise([store.name, store.region, store.district, store.address_text].filter(Boolean).join(" "))]));

type BrowseState = { query: string; region: string; district: string; count: number; scrollY: number };
const EMPTY_STATE: BrowseState = { query: "", region: "전체", district: "", count: PAGE_SIZE, scrollY: 0 };

function readSession(): BrowseState | null {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) || "null");
    if (!value || typeof value !== "object") return null;
    const region = ["전체", "서울", "경기"].includes(value.region) ? value.region : "전체";
    const district = typeof value.district === "string" && STORES.some((store) => store.district === value.district && (region === "전체" || store.region === region)) ? value.district : "";
    return {
      query: typeof value.query === "string" ? value.query.slice(0, 120) : "",
      region,
      district,
      count: Number.isFinite(value.count) ? Math.min(STORES.length, Math.max(PAGE_SIZE, value.count)) : PAGE_SIZE,
      scrollY: Number.isFinite(value.scrollY) ? Math.max(0, value.scrollY) : 0,
    };
  } catch { return null; }
}

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const shapes: Record<string, React.ReactNode> = {
    search: <><circle cx="10.7" cy="10.7" r="6.6" /><path d="m16 16 4.5 4.5" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    pin: <><path d="M19 10c0 5.4-7 11-7 11S5 15.4 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    external: <><path d="M14 4h6v6m0-6L10 14" /><path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5" /></>,
    chat: <path d="M21 11.2c0 4.6-4 8-9 8-1.1 0-2.2-.2-3.2-.5L4 21l1.2-4.5A7.5 7.5 0 0 1 3 11.2C3 6.7 7 3 12 3s9 3.7 9 8.2Z" />,
    chevron: <path d="m6 9 6 6 6-6" />,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>,
    copy: <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
    check: <path d="m5 12 4.5 4.5L19 7" />,
    bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></>,
    store: <><path d="M4 10v11h16V10M3 10l2-7h14l2 7M8 21v-7h8v7" /><path d="M3 10c0 3 4.5 3 4.5 0 0 3 4.5 3 4.5 0 0 3 4.5 3 4.5 0 0 3 4.5 3 4.5 0" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name] || shapes.arrow}</svg>;
}

function getScrollHost(root: HTMLElement | null): HTMLElement | null {
  if (!root) return null;
  let parent = root.parentElement;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const overflow = window.getComputedStyle(parent).overflowY;
    if (/(auto|scroll)/.test(overflow) && parent.scrollHeight > parent.clientHeight + 1) return parent;
    parent = parent.parentElement;
  }
  return null;
}

function StoreActions({ store, onLeave, compact = false }: { store: Store; onLeave: (store: Store) => void; compact?: boolean }) {
  return <div className={`mm-stores-actions${compact ? " mm-stores-actions-small" : ""}`}>
    {store.kakao_chat_url ? <a className="mm-stores-action mm-stores-kakao" href={store.kakao_chat_url} target="_blank" rel="noopener noreferrer" data-mm-store-id={store.store_id} data-mm-link-kind="kakao_chat_url" aria-label={`${store.name} 카카오톡방 입장 (새 창)`} onClick={() => onLeave(store)}>
      <Icon name="chat" size={18} /><span>카카오톡방 입장</span><Icon name="external" size={13} />
    </a> : <span className="mm-stores-action mm-stores-pending" aria-label={`${store.name} 카카오톡방 준비 중`}>카카오톡방 준비 중</span>}
  </div>;
}

export default function Layer({ homeUrl = DEFAULT_HOME_URL }: { homeUrl?: string } = {}) {
  const resolvedHomeUrl = homeUrl?.trim() || DEFAULT_HOME_URL;
  // Standard anchor navigation works without Figma Sites.
  const goHome = (event: React.MouseEvent<HTMLAnchorElement>) => {
    saveBrowse();
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  };
  const rootRef = useRef<HTMLDivElement>(null);
  const nextFocusId = useRef<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const copyInputRef = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const restoreY = useRef<number | null>(null);
  const ready = useRef(false);
  const currentState = useRef<BrowseState>({ ...EMPTY_STATE });
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("전체");
  const [district, setDistrict] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [recentId, setRecentId] = useState<number | null>(null);
  const [copyStoreId, setCopyStoreId] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [manualCopy, setManualCopy] = useState(false);
  const [moreMessage, setMoreMessage] = useState("");
  const [restoreVersion, setRestoreVersion] = useState(0);

  const districts = useMemo(() => [...new Set(STORES.filter((store) => region === "전체" || store.region === region).map((store) => store.district).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, "ko")), [region]);
  const filtered = useMemo(() => {
    const needle = normalise(query.trim());
    return SORTED_STORES.filter((store) => (region === "전체" || store.region === region) && (!district || store.district === district) && (!needle || SEARCH_TEXT.get(store.store_id)?.includes(needle)));
  }, [query, region, district]);
  const filtering = Boolean(query.trim() || region !== "전체" || district);
  const visibleStores = filtering ? filtered : filtered.slice(0, visibleCount);
  const remaining = filtered.length - visibleStores.length;
  const recentStore = recentId ? STORE_BY_ID.get(recentId) : undefined;
  const copyStore = STORE_BY_ID.get(Number(copyStoreId));
  currentState.current = { query, region, district, count: visibleCount, scrollY: 0 };

  const saveBrowse = () => {
    if (!ready.current) return;
    const host = getScrollHost(rootRef.current);
    const snapshot = { ...currentState.current, scrollY: host ? host.scrollTop : window.scrollY };
    try { window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(snapshot)); } catch { /* Browsing still works with blocked storage. */ }
  };

  useEffect(() => {
    const applySaved = () => {
      const saved = readSession();
      if (saved) {
        setQuery(saved.query); setDraftQuery(saved.query);
        setRegion(saved.region); setDistrict(saved.district); setVisibleCount(saved.count);
        restoreY.current = saved.scrollY;
        setRestoreVersion((value) => value + 1);
      }
      try {
        const id = Number(window.localStorage.getItem(RECENT_KEY));
        if (STORE_BY_ID.has(id)) { setRecentId(id); setCopyStoreId(String(id)); }
      } catch { /* Optional recent history is not required. */ }
      ready.current = true;
    };
    applySaved();
    const onHide = () => saveBrowse();
    const onVisible = () => { if (document.visibilityState === "hidden") saveBrowse(); };
    window.addEventListener("pagehide", onHide);
    window.addEventListener("pageshow", applySaved);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      if (rootRef.current) saveBrowse();
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("pageshow", applySaved);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    if (restoreY.current === null) return;
    let secondFrame = 0;
    const frame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        if (restoreY.current === null) return;
        const host = getScrollHost(rootRef.current);
        const y = restoreY.current;
        restoreY.current = null;
        if (host) host.scrollTo({ top: y, behavior: "auto" });
        else window.scrollTo({ top: y, behavior: "auto" });
      });
    });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(secondFrame); };
  }, [restoreVersion, query, region, district, visibleCount]);

  useEffect(() => {
    if (manualCopy) { copyInputRef.current?.focus(); copyInputRef.current?.select(); }
  }, [manualCopy]);

  useEffect(() => {
    if (nextFocusId.current === null) return;
    const id = nextFocusId.current;
    nextFocusId.current = null;
    const frame = requestAnimationFrame(() => {
      const heading = rootRef.current?.querySelector<HTMLElement>(`#mm-stores-name-${id}`);
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ block: "nearest", behavior: "auto" });
    });
    return () => cancelAnimationFrame(frame);
  }, [visibleCount]);

  const clearFeedback = () => { setMoreMessage(""); setVisibleCount(PAGE_SIZE); };
  const updateQuery = (value: string) => { setQuery(value); clearFeedback(); };
  const clearQuery = () => { composing.current = false; setDraftQuery(""); updateQuery(""); searchRef.current?.focus(); };
  const clearAll = () => { composing.current = false; setDraftQuery(""); setQuery(""); setRegion("전체"); setDistrict(""); clearFeedback(); };
  const leaveForStore = (store: Store) => {
    saveBrowse();
    setRecentId(store.store_id); setCopyStoreId(String(store.store_id));
    try { window.localStorage.setItem(RECENT_KEY, String(store.store_id)); } catch { /* Recent history stays in memory if storage is blocked. */ }
  };
  const removeRecent = () => {
    setRecentId(null);
    try { window.localStorage.removeItem(RECENT_KEY); } catch { /* No persistence is required. */ }
  };
  const copyRoom = async () => {
    if (!copyStore?.kakao_chat_url) return;
    setManualCopy(false); setCopyStatus("");
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(copyStore.kakao_chat_url);
      setCopyStatus(`${copyStore.name} 카카오톡방 링크를 복사했어요.`);
    } catch {
      setManualCopy(true);
      setCopyStatus("아래 주소를 길게 누르거나 선택해 직접 복사해 주세요.");
    }
  };

  return <div className="mm-stores-root" lang="ko" ref={rootRef}>
    <style>{styles}</style>
    <a className="mm-stores-skip" href="#mm-stores-search">지점 검색으로 바로 가기</a>
    <header className="mm-stores-header">
      <div className="mm-stores-shell mm-stores-header-inner">
        <a href={resolvedHomeUrl} className="mm-stores-logo-link" aria-label="만만마켓 홈페이지" onClick={goHome}><img src={LOGO} width="145" height="29" alt="만만마켓" /></a>
        <span className="mm-stores-header-divider" aria-hidden="true" />
        <nav className="mm-stores-header-nav" aria-label="주요 메뉴">
          <span className="mm-stores-page-label" aria-current="page">지점 찾기</span>
        </nav>
        <a className="mm-stores-about" href={resolvedHomeUrl} onClick={goHome}>만만마켓 소개 <Icon name="arrow" size={16} /></a>
      </div>
    </header>

    <main>
      <section className="mm-stores-search-section" aria-labelledby="mm-stores-title">
        <div className="mm-stores-shell">
          <div className="mm-stores-intro">
            <div><p className="mm-stores-eyebrow"><span /> 우리 동네 공동구매</p><h1 id="mm-stores-title">가까운 만만마켓을<br className="mm-stores-mobile-break" /> 찾아보세요</h1><p className="mm-stores-description">이용할 지점을 찾고,<br className="mm-stores-mobile-break" /> 카카오톡방에 바로 입장하세요.</p></div>
            <div className="mm-stores-character" aria-hidden="true"><span /><img src={CHARACTER} width="140" height="140" alt="" /></div>
          </div>

          <div className="mm-stores-tools">
            <div className="mm-stores-search-field">
              <label htmlFor="mm-stores-search">지점 검색</label>
              <div className="mm-stores-input-wrap"><Icon name="search" size={23} /><input ref={searchRef} id="mm-stores-search" type="search" value={draftQuery} maxLength={120} autoComplete="off" spellCheck={false} enterKeyHint="search" placeholder="지점명이나 지역을 검색해 보세요" onCompositionStart={() => { composing.current = true; }} onCompositionEnd={(event) => { composing.current = false; setDraftQuery(event.currentTarget.value); updateQuery(event.currentTarget.value); }} onChange={(event) => { const value = event.currentTarget.value; setDraftQuery(value); if (!composing.current && !(event.nativeEvent as InputEvent).isComposing) updateQuery(value); }} onKeyDown={(event) => { if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return; if (event.key === "Escape") clearQuery(); if (event.key === "Enter" && !composing.current) { event.preventDefault(); updateQuery(event.currentTarget.value); event.currentTarget.blur(); } }} />{draftQuery && <button type="button" className="mm-stores-clear" onClick={clearQuery} aria-label="검색어 지우기"><Icon name="close" size={18} /></button>}</div>
            </div>
            <div className="mm-stores-filter-group">
              <div className="mm-stores-regions" role="group" aria-label="지역 선택">{["전체", "서울", "경기"].map((value) => <button type="button" key={value} aria-pressed={region === value} onClick={() => { setRegion(value); setDistrict(""); clearFeedback(); }}>{region === value && <Icon name="check" size={14} />}{value}</button>)}</div>
              <div className="mm-stores-district-wrap"><label className="mm-stores-sr-only" htmlFor="mm-stores-district">시·구 선택</label><select id="mm-stores-district" value={district} onChange={(event) => { setDistrict(event.target.value); clearFeedback(); }}><option value="">시·구 전체</option>{districts.map((value) => <option key={value} value={value}>{value}</option>)}</select><Icon name="chevron" size={16} /></div>
              {filtering && <button className="mm-stores-reset" type="button" onClick={clearAll}>전체 초기화</button>}
            </div>
          </div>
          <p className="mm-stores-filter-note">지점이 안 보이면 전체에서 지점명으로 검색해 보세요.</p>
        </div>
      </section>

      <section className="mm-stores-results-section" aria-labelledby="mm-stores-results-title">
        <div className="mm-stores-shell">
          {recentStore && !filtering && <aside className="mm-stores-recent" aria-label="최근 이용 지점"><div className="mm-stores-recent-heading"><span><Icon name="clock" size={16} />최근 이용 지점</span><button type="button" onClick={removeRecent} aria-label="최근 이용 지점 기록 삭제"><Icon name="close" size={16} /></button></div><div className="mm-stores-recent-body"><h2>{recentStore.name}</h2><StoreActions store={recentStore} onLeave={leaveForStore} compact /></div></aside>}
          <div className="mm-stores-results-heading"><h2 id="mm-stores-results-title">{filtering ? "검색 결과" : "전체"} <strong>{filtered.length}</strong><span>개 지점</span></h2><span className="mm-stores-order">지점명순</span></div>
          <p className="mm-stores-connection-note">외부 링크는 새 창으로 열립니다.</p>
          <p className="mm-stores-sr-only" role="status" aria-live="polite" aria-atomic="true">{moreMessage || (filtering ? `검색 결과 ${filtered.length}개 지점` : `전체 ${STORES.length}개 중 ${visibleStores.length}개 지점 표시`)}</p>
          {filtered.length ? <>
            <ul className="mm-stores-grid">{visibleStores.map((store) => <li key={store.store_id}><article className="mm-stores-card" data-store-id={store.store_id} aria-labelledby={`mm-stores-name-${store.store_id}`}>
              <div className="mm-stores-card-top"><span className="mm-stores-location"><Icon name="pin" size={14} />{store.region && store.district ? `${store.region} · ${store.district}` : "만만마켓"}</span><span className="mm-stores-card-mark" aria-hidden="true"><Icon name="store" size={19} /></span></div>
              <h3 id={`mm-stores-name-${store.store_id}`} tabIndex={-1}>{store.name}</h3>
              {store.address_text ? <p className="mm-stores-address">{store.address_text}</p> : <p className="mm-stores-address mm-stores-address-help">방문 위치는 해당 지점의 안내를 확인해 주세요.</p>}
              <StoreActions store={store} onLeave={leaveForStore} />
            </article></li>)}</ul>
            {remaining > 0 && <div className="mm-stores-more-wrap"><button className="mm-stores-more" type="button" onClick={() => { const next = Math.min(filtered.length, visibleCount + PAGE_SIZE); nextFocusId.current = filtered[visibleCount]?.store_id ?? null; setVisibleCount(next); setMoreMessage(`${next - visibleCount}개 지점을 추가로 표시했어요. 전체 ${filtered.length}개 중 ${next}개 지점 표시.`); }}>지점 더 보기 <span>남은 {remaining}개</span><Icon name="chevron" size={18} /></button><p>{visibleStores.length} / {filtered.length}개 지점</p></div>}
          </> : <div className="mm-stores-empty"><div className="mm-stores-empty-icon"><Icon name="search" size={28} /></div><h3>검색 결과가 없어요</h3><p>다른 지점명이나 지역으로 검색해 보세요.</p><div><button type="button" onClick={clearQuery} disabled={!query}>검색어 지우기</button><button type="button" className="mm-stores-empty-all" onClick={clearAll}>전체 지점 보기 <Icon name="arrow" size={16} /></button></div></div>}
        </div>
      </section>

      <section className="mm-stores-help-section" aria-labelledby="mm-stores-help-title"><div className="mm-stores-shell mm-stores-help-layout"><div className="mm-stores-help-intro"><p className="mm-stores-eyebrow">이용이 처음이라면</p><h2 id="mm-stores-help-title">가볍게 시작해 보세요.</h2><p>필요한 상품은 미리 주문하고,<br />가까운 매장에서 받아가세요.</p></div><div className="mm-stores-help-items">
        <details className="mm-stores-details"><summary>카카오톡방이 열리지 않나요?<Icon name="chevron" size={20} /></summary><div className="mm-stores-details-content"><p>이용할 지점을 선택해 링크를 복사한 뒤, 사용 중인 브라우저에서 열어 보세요. 앱에 따라 외부 브라우저로 열기 메뉴를 이용할 수 있어요.</p><label htmlFor="mm-stores-copy-select">링크를 복사할 지점</label><div className="mm-stores-copy-controls"><select id="mm-stores-copy-select" value={copyStoreId} onChange={(event) => { setCopyStoreId(event.target.value); setCopyStatus(""); setManualCopy(false); }}><option value="">지점을 선택해 주세요</option>{SORTED_STORES.filter(store => store.kakao_chat_url).map((store) => <option key={store.store_id} value={store.store_id}>{store.name}</option>)}</select><button type="button" onClick={copyRoom} disabled={!copyStore?.kakao_chat_url}><Icon name="copy" size={18} />링크 복사</button></div><p className="mm-stores-copy-status" role="status" aria-live="polite">{copyStatus}</p>{manualCopy && copyStore?.kakao_chat_url && <input className="mm-stores-manual-copy" ref={copyInputRef} aria-label={`${copyStore.name} 카카오톡방 주소 직접 복사`} readOnly value={copyStore.kakao_chat_url} onFocus={(event) => event.currentTarget.select()} />}</div></details>
        <details className="mm-stores-details"><summary>카카오톡으로 처음 이용하시나요?<Icon name="chevron" size={20} /></summary><div className="mm-stores-details-content"><ol className="mm-stores-steps">{[
          ["가까운 지점 찾기", "이용할 매장을 선택하세요."], ["카카오톡방 참여하기", "선택한 지점의 특가 소식을 확인하세요."], ["상품 주문하기", "원하는 상품을 카카오톡으로 간편하게 주문하세요."], ["매장에서 픽업하기", "안내받은 일정에 상품을 받아가세요."],
        ].map(([title, description], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{title}</strong><p>{description}</p></div></li>)}</ol><p className="mm-stores-help-footnote">상품별 주문·픽업 조건은 해당 지점의 안내를 확인해 주세요.</p></div></details>
        <details className="mm-stores-details"><summary>찾는 지점이 보이지 않나요?<Icon name="chevron" size={20} /></summary><div className="mm-stores-details-content"><p>지역 필터를 ‘전체’로 바꾸고 지점명 일부로 검색해 보세요. 매장을 찾기 어렵다면 본사에 문의해 주세요.</p><div className="mm-stores-contact-actions"><button type="button" onClick={() => { clearAll(); searchRef.current?.focus(); searchRef.current?.scrollIntoView({ behavior: "auto", block: "center" }); }}>전체 지점에서 다시 찾기 <Icon name="arrow" size={16} /></button><a href="tel:02-6242-0229">본사 문의 02-6242-0229</a></div></div></details>
      </div></div></section>
    </main>

    <footer className="mm-stores-footer"><div className="mm-stores-shell"><div className="mm-stores-footer-top"><a href={resolvedHomeUrl} onClick={goHome} aria-label="만만마켓 홈페이지"><img src={FOOTER_LOGO} width="165" height="33" alt="만만마켓" /></a><p>만만한 가격으로, 만족을 경험하다.</p></div><div className="mm-stores-footer-details"><p><span>주식회사 셀렉티카</span><span className="mm-stores-footer-separator"> | </span><span>대표이사: 김정대</span><span className="mm-stores-footer-separator"> | </span><span>사업자등록번호: 366-88-03550</span></p><p>주소: 경기도 과천시 과천대로7길 33, 디테크타워 과천 A동 407호</p><div className="mm-stores-footer-contacts"><a href="tel:02-6242-0229">TEL: 02-6242-0229</a><a href="mailto:selectika@selectika.kr">E-mail: selectika@selectika.kr</a></div></div><p className="mm-stores-copyright">Copyright ⓒ 2025 SELECTIKA. All rights reserved.</p></div></footer>
  </div>;
}

const styles = `
.mm-stores-pending{background:#F0F2F6;color:#647087;border:1px solid #DDE2EA;cursor:default;font-size:13px;}

a[aria-label="만만마켓 내부 이용 방법 이동"],a[aria-label="만만마켓 내부 홈 이동"]{display:none!important}
/* The three host wrappers observed in Figma Sites must follow content height.
   Only ancestors of this component are matched; no body/global reset. */
div:has(>.mm-stores-root){width:100%!important;min-width:0!important}
div:has(>.mm-stores-root),div:has(>div>.mm-stores-root),div:has(>div>div>.mm-stores-root){height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
.mm-stores-root{--ms-blue:#2858D9;--ms-ink:#01071A;--ms-body:#2D3643;--ms-muted:#59667B;container:mm-stores/inline-size;position:relative;width:100%;min-width:0;height:auto;overflow:visible;color:var(--ms-body);background:#fff;font:16px/1.65 'Paperlogy','Noto Sans KR',-apple-system,BlinkMacSystemFont,sans-serif;-webkit-font-smoothing:antialiased;text-align:left}
.mm-stores-root *{box-sizing:border-box}.mm-stores-root :is(h1,h2,h3,p,ul,ol){margin:0}.mm-stores-root :is(h1,h2,h3){color:var(--ms-ink);line-height:1.4;word-break:keep-all;overflow-wrap:anywhere}.mm-stores-root img{display:block;max-width:100%;height:auto}.mm-stores-root a{color:inherit;text-decoration:none}.mm-stores-root :is(button,input,select){font:inherit}.mm-stores-root button{cursor:pointer}.mm-stores-root button:disabled{cursor:default;opacity:.55}.mm-stores-root svg{display:block;flex-shrink:0}.mm-stores-root :focus-visible{outline:3px solid #A76500;outline-offset:3px}.mm-stores-root button,.mm-stores-root a{touch-action:manipulation}.mm-stores-shell{width:calc(100% - 80px);max-width:1200px;margin-inline:auto}.mm-stores-sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}.mm-stores-skip{position:absolute;z-index:50;top:8px;left:16px;padding:12px;background:#fff;transform:translateY(-200%)}.mm-stores-skip:focus{transform:none}
.mm-stores-header{border-bottom:1px solid #E8EDF4;background:#fff}.mm-stores-header-inner{min-height:68px;display:flex;align-items:center;gap:19px}.mm-stores-logo-link{display:flex;align-items:center;min-height:44px}.mm-stores-logo-link img{width:145px}.mm-stores-header-divider{width:1px;height:16px;background:#DBE1EB}.mm-stores-page-label{font-size:14px;font-weight:600;color:#546177}.mm-stores-about{margin-left:auto;display:flex;align-items:center;gap:12px;min-height:44px;font-size:14px;font-weight:500}.mm-stores-about:hover{color:var(--ms-blue)}
.mm-stores-search-section{background:linear-gradient(180deg,#F4F7FF 0%,#F9FBFF 100%);padding:46px 0 24px;border-bottom:1px solid #EAF0F7}.mm-stores-intro{display:flex;align-items:center;justify-content:space-between;gap:25px;min-height:148px;margin-bottom:28px}.mm-stores-eyebrow{display:flex;align-items:center;gap:7px;font-size:12px;letter-spacing:.3px;color:var(--ms-blue);font-weight:700;margin-bottom:10px!important}.mm-stores-eyebrow>span{width:5px;height:5px;border-radius:50%;background:#3C6FF6}.mm-stores-root h1{font-size:42px;letter-spacing:-1.8px;font-weight:750;line-height:1.28}.mm-stores-description{font-size:16px;color:var(--ms-muted);margin-top:13px!important;word-break:keep-all}.mm-stores-character{position:relative;width:160px;flex:0 0 160px;display:flex;justify-content:center;margin-right:18px}.mm-stores-character>span{position:absolute;inset:10px -6px -4px 6px;border-radius:50%;background:#E7EEFF}.mm-stores-character img{width:142px;position:relative;transform:rotate(-6deg)}.mm-stores-mobile-break{display:none}.mm-stores-tools{display:flex;align-items:flex-end;gap:28px}.mm-stores-search-field{flex:1;min-width:0}.mm-stores-search-field>label{display:block;font-size:13px;font-weight:600;margin-bottom:7px;color:#3B4A62}.mm-stores-input-wrap{display:flex;align-items:center;gap:13px;border:1px solid #C9D5EA;border-radius:12px;background:#fff;min-height:56px;padding-left:17px;box-shadow:0 3px 10px #1C386007;color:#75839A}.mm-stores-input-wrap:focus-within{border-color:#3C6FF6;box-shadow:0 0 0 3px #3C6FF618}.mm-stores-input-wrap input{background:transparent;border:0;outline:none;width:100%;min-width:0;min-height:54px;font-size:16px;color:var(--ms-ink);padding:11px 14px 11px 0;appearance:none;-webkit-appearance:none}.mm-stores-input-wrap input::-webkit-search-cancel-button{display:none}.mm-stores-input-wrap input::placeholder{color:#67758A;opacity:1}.mm-stores-input-wrap input:focus-visible{outline:none}.mm-stores-clear{border:0;background:transparent;color:#5D6B81;width:44px;min-width:44px;height:44px;display:grid;place-items:center;margin-right:5px;border-radius:8px}.mm-stores-clear:hover{background:#F0F4FB}.mm-stores-filter-group{display:flex;flex-wrap:wrap;gap:10px;align-items:center;min-height:56px}.mm-stores-regions{display:flex;gap:6px}.mm-stores-regions button{display:flex;align-items:center;justify-content:center;gap:5px;min-width:61px;min-height:44px;border:1px solid #D6DEEB;border-radius:9px;padding:9px 13px;font-size:14px;font-weight:600;background:#fff;color:#485670;transition:border-color .17s,background .17s,color .17s}.mm-stores-regions button[aria-pressed=true]{border-color:var(--ms-blue);background:var(--ms-blue);color:#fff}.mm-stores-regions button:hover:not([aria-pressed=true]){border-color:#8EA9E8;background:#F1F5FE}.mm-stores-district-wrap{position:relative;min-width:145px;flex:1}.mm-stores-district-wrap select{display:block;width:100%;min-height:44px;border:1px solid #D6DEEB;border-radius:9px;background:#fff;appearance:none;padding:9px 34px 9px 12px;font-size:14px;color:#3B4A62;cursor:pointer}.mm-stores-district-wrap>svg{position:absolute;right:11px;top:50%;transform:translateY(-50%);pointer-events:none;color:#65748D}.mm-stores-reset{border:0;background:transparent;min-height:44px;padding:8px 3px;font-size:13px;text-decoration:underline;text-underline-offset:3px;color:#53617A}.mm-stores-filter-note{margin-top:12px!important;font-size:12px;line-height:1.6;color:#62718A}
.mm-stores-results-section{padding:34px 0 52px}.mm-stores-results-heading{display:flex;align-items:center;justify-content:space-between;gap:16px}.mm-stores-results-heading h2{display:flex;align-items:baseline;gap:5px;font-size:18px;font-weight:600;letter-spacing:-.5px}.mm-stores-results-heading h2 strong{color:var(--ms-blue);font-size:21px;font-weight:700;margin-left:3px}.mm-stores-results-heading h2>span{font-size:16px;color:#526079;font-weight:500}.mm-stores-order{font-size:12px;color:#65728A}.mm-stores-connection-note{display:flex;flex-wrap:wrap;gap:3px 14px;font-size:12px;line-height:1.65;color:#65728A;margin:9px 0 20px!important}.mm-stores-connection-note>span{color:#65728A}.mm-stores-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;list-style:none;padding:0}.mm-stores-grid>li{min-width:0;display:flex}.mm-stores-card{display:flex;flex-direction:column;width:100%;min-width:0;padding:22px;border:1px solid #E0E6F0;border-radius:16px;background:#fff;box-shadow:0 3px 8px #172F5805;transition:border-color .18s,box-shadow .18s}.mm-stores-card:hover,.mm-stores-card:focus-within{border-color:#ADC1EE;box-shadow:0 6px 18px #1938660A}.mm-stores-card-top{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:11px;min-height:25px}.mm-stores-location{display:flex;align-items:center;gap:5px;color:#586986;font-size:12px;font-weight:500;line-height:1.45;word-break:keep-all}.mm-stores-card-mark{color:#7390C9;background:#F2F6FD;width:29px;height:29px;border-radius:8px;display:grid;place-items:center}.mm-stores-card h3{font-size:19px;font-weight:700;line-height:1.45;letter-spacing:-.5px}.mm-stores-address{font-size:14px;line-height:1.7;color:#5B6980;margin-top:9px!important;margin-bottom:22px!important;min-height:48px;word-break:keep-all;overflow-wrap:anywhere}.mm-stores-address-help{color:#67758A}.mm-stores-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto}.mm-stores-action{display:flex;align-items:center;justify-content:center;gap:6px;flex:1 1 130px;min-width:0;min-height:48px;padding:12px 9px;border-radius:10px;font-size:13px;font-weight:650;line-height:1.45;white-space:nowrap;transition:background .17s,box-shadow .17s}.mm-stores-web{background:var(--ms-blue);color:white!important}.mm-stores-web:hover{background:#1D49BD}.mm-stores-kakao{background:#FEE500;color:#332B00!important}.mm-stores-kakao:hover{background:#F2D900}.mm-stores-action>svg:last-child{opacity:.75}.mm-stores-more-wrap{text-align:center;margin-top:28px}.mm-stores-more{display:inline-flex;align-items:center;justify-content:center;gap:15px;width:360px;max-width:100%;min-height:52px;padding:12px 24px;border:1px solid #D6DFEF;border-radius:10px;background:white;color:#2D405F;font-size:14px;font-weight:600;transition:background .17s,border-color .17s}.mm-stores-more:hover{background:#F7F9FD;border-color:#A5BCEB}.mm-stores-more>span{font-size:12px;color:#65728A;font-weight:400}.mm-stores-more-wrap>p{font-size:11px;color:#65728A;margin-top:9px!important;font-variant-numeric:tabular-nums}
.mm-stores-recent{border:1px solid #D5E0F8;background:#F5F8FF;border-radius:13px;padding:12px 18px 17px;margin-bottom:27px}.mm-stores-recent-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:-5px}.mm-stores-recent-heading>span{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:#526C9D}.mm-stores-recent-heading>button{display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:8px;background:none;color:#596F98;margin-right:-11px}.mm-stores-recent-heading>button:hover{background:#E8EFFD}.mm-stores-recent-body{display:flex;align-items:center;gap:18px;justify-content:space-between}.mm-stores-recent-body h2{font-size:18px;letter-spacing:-.4px}.mm-stores-actions-small{width:344px;max-width:100%;flex-shrink:0;margin-top:0}.mm-stores-actions-small .mm-stores-action{min-height:44px;padding-block:10px}.mm-stores-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:1px solid #E0E6F0;border-radius:16px;padding:46px 20px;min-height:285px}.mm-stores-empty-icon{display:grid;place-items:center;width:58px;height:58px;background:#F0F5FE;border-radius:50%;color:#6A87BE;margin-bottom:17px}.mm-stores-empty h3{font-size:20px}.mm-stores-empty>p{font-size:14px;color:var(--ms-muted);margin-top:8px!important}.mm-stores-empty>div:last-child{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:22px}.mm-stores-empty button{display:flex;align-items:center;justify-content:center;gap:7px;min-height:44px;border:1px solid #D4DEEF;background:white;border-radius:9px;padding:9px 15px;color:#405672;font-size:13px;font-weight:500}.mm-stores-empty button.mm-stores-empty-all{background:var(--ms-blue);border-color:var(--ms-blue);color:white}
.mm-stores-help-section{background:#F8FAFD;border-top:1px solid #EAF0F7;padding:45px 0 50px}.mm-stores-help-layout{display:grid;grid-template-columns:.65fr 1fr;gap:80px}.mm-stores-help-intro .mm-stores-eyebrow{font-size:11px;margin-bottom:9px!important}.mm-stores-help-intro h2{font-size:25px;letter-spacing:-.7px}.mm-stores-help-intro>p:last-child{font-size:14px;color:var(--ms-muted);margin-top:13px!important}.mm-stores-help-items{min-width:0}.mm-stores-details{border-bottom:1px solid #DCE4F0}.mm-stores-details:first-child{border-top:1px solid #DCE4F0}.mm-stores-details>summary{display:flex;align-items:center;justify-content:space-between;gap:16px;list-style:none;cursor:pointer;min-height:64px;padding:17px 0;font-size:15px;font-weight:600;color:#2D405E;word-break:keep-all}.mm-stores-details>summary::-webkit-details-marker{display:none}.mm-stores-details>summary>svg{color:#667997;transition:transform .2s}.mm-stores-details[open]>summary>svg{transform:rotate(180deg)}.mm-stores-details-content{padding:0 0 23px;font-size:14px;line-height:1.8;color:#55647C;word-break:keep-all}.mm-stores-details-content>label{display:block;margin-top:17px;margin-bottom:7px;font-size:12px;font-weight:600;color:#3D526F}.mm-stores-copy-controls{display:flex;flex-wrap:wrap;gap:8px}.mm-stores-copy-controls select{flex:1 1 200px;min-width:0;max-width:100%;min-height:46px;padding:10px 12px;border:1px solid #CBD6E8;border-radius:8px;background:#fff;color:#304566;font-size:14px}.mm-stores-copy-controls button{display:flex;align-items:center;justify-content:center;gap:7px;min-height:46px;flex:0 0 auto;background:#fff;border:1px solid #BFCFEA;border-radius:8px;padding:10px 13px;color:#345CA6;font-size:13px;font-weight:600}.mm-stores-copy-status{font-size:12px;line-height:1.65;color:#365B97;margin-top:9px!important}.mm-stores-copy-status:empty{display:none}.mm-stores-manual-copy{display:block;width:100%;min-width:0;min-height:46px;border:1px solid #B7CAE8;border-radius:8px;background:#fff;padding:10px;color:#304566;font-size:13px;margin-top:9px}.mm-stores-steps{list-style:none;padding:0;display:grid;gap:16px}.mm-stores-steps>li{display:flex;gap:11px;align-items:flex-start}.mm-stores-steps>li>span{display:grid;place-items:center;flex:0 0 26px;height:26px;border-radius:8px;background:#E7EEFC;color:var(--ms-blue);font-size:10px;font-weight:700;margin-top:2px}.mm-stores-steps strong{display:block;font-size:14px;font-weight:600;color:#2E4569}.mm-stores-steps p{font-size:13px;color:#5C6C86}.mm-stores-help-footnote{font-size:12px;color:#61728C;margin-top:21px!important}.mm-stores-web-help{border-top:1px solid #E0E7F2;padding-top:14px;margin-top:14px!important;font-size:13px}.mm-stores-contact-actions{display:flex;align-items:center;gap:8px 20px;flex-wrap:wrap;margin-top:13px}.mm-stores-contact-actions button{display:flex;align-items:center;gap:6px;min-height:44px;background:none;border:0;padding:5px 0;color:var(--ms-blue);font-size:13px;font-weight:600}.mm-stores-contact-actions>a{display:flex;align-items:center;min-height:44px;font-size:13px;text-decoration:underline;text-underline-offset:3px}
.mm-stores-footer{background:#07112A;color:#C0CBE0;padding:37px 0 calc(28px + env(safe-area-inset-bottom,0px))}.mm-stores-footer-top{display:flex;align-items:center;justify-content:space-between;gap:22px;margin-bottom:21px}.mm-stores-footer-top>a{display:flex;align-items:center;min-height:44px}.mm-stores-footer-top img{width:165px}.mm-stores-footer-top>p{font-size:12px;color:#C0CBE0}.mm-stores-footer-details{font-size:12px;line-height:1.9;word-break:keep-all;overflow-wrap:anywhere}.mm-stores-footer-details>p+p{margin-top:3px}.mm-stores-footer-contacts{display:flex;flex-wrap:wrap;gap:0 23px;margin-top:2px}.mm-stores-footer-contacts a{display:flex;align-items:center;min-height:44px}.mm-stores-copyright{font-size:11px;line-height:1.8;padding-top:18px;border-top:1px solid #24314B;margin-top:13px!important;color:#B5C2D9}
.mm-stores-guide-inline{display:flex;align-items:center;flex-wrap:wrap;gap:0 8px;margin-top:9px!important;font-size:12px;color:#64738B}.mm-stores-guide-inline a,.mm-stores-guide-link{display:inline-flex;align-items:center;gap:8px;min-height:44px;color:#2858D9!important;font-weight:600;font-size:13px}.mm-stores-guide-link{margin-top:12px}.mm-stores-help-intro>p{color:#5C6C86;font-size:15px;line-height:1.8;margin-top:10px!important}
@container mm-stores (max-width:1100px){.mm-stores-tools{display:block}.mm-stores-filter-group{margin-top:13px;justify-content:flex-start;min-height:44px}.mm-stores-district-wrap{flex:0 0 175px}.mm-stores-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.mm-stores-card{padding:22px}.mm-stores-help-layout{gap:45px}.mm-stores-character{margin-right:0}.mm-stores-root h1{font-size:38px}.mm-stores-about{font-size:13px}}
@container mm-stores (max-width:600px){
.mm-stores-shell{width:calc(100% - 40px)}.mm-stores-header-inner{min-height:56px;gap:13px}.mm-stores-logo-link img{width:116px}.mm-stores-header-divider{height:14px}.mm-stores-page-label{font-size:12px}.mm-stores-about{font-size:12px;gap:6px}.mm-stores-about svg{width:14px}.mm-stores-search-section{padding:25px 0 17px}.mm-stores-intro{min-height:0;margin-bottom:20px;display:block}.mm-stores-character{display:none}.mm-stores-eyebrow{font-size:11px;margin-bottom:8px!important;gap:6px}.mm-stores-root h1{font-size:29px;line-height:1.3;letter-spacing:-1.15px}.mm-stores-mobile-break{display:block}.mm-stores-description{font-size:14px;line-height:1.7;margin-top:9px!important}.mm-stores-search-field>label{font-size:12px;margin-bottom:6px}.mm-stores-input-wrap{min-height:52px;border-radius:10px;gap:10px;padding-left:13px}.mm-stores-input-wrap>svg{width:20px}.mm-stores-input-wrap input{min-height:50px;padding-block:10px;font-size:16px}.mm-stores-clear{margin-right:3px}.mm-stores-filter-group{gap:9px;margin-top:12px;flex-wrap:wrap}.mm-stores-regions{gap:5px;flex:0 0 auto}.mm-stores-regions button{min-width:55px;padding:9px 11px;font-size:13px;border-radius:8px}.mm-stores-district-wrap{flex:1 1 125px;min-width:125px}.mm-stores-district-wrap select{font-size:13px;padding-left:10px;border-radius:8px}.mm-stores-reset{margin-left:auto;min-height:44px;font-size:12px;padding-block:3px}.mm-stores-filter-note{font-size:11px;line-height:1.6;margin-top:9px!important;word-break:keep-all}.mm-stores-results-section{padding:23px 0 36px}.mm-stores-results-heading h2{font-size:16px}.mm-stores-results-heading h2 strong{font-size:19px}.mm-stores-results-heading h2>span{font-size:14px}.mm-stores-order{font-size:11px}.mm-stores-connection-note{font-size:11px;margin:7px 0 14px!important;line-height:1.7;display:block}.mm-stores-connection-note>span{display:block}.mm-stores-grid{grid-template-columns:1fr;gap:13px}.mm-stores-card{padding:17px 18px 18px;border-radius:14px}.mm-stores-card-top{margin-bottom:7px;min-height:23px}.mm-stores-card-mark{width:25px;height:25px;border-radius:7px}.mm-stores-card-mark svg{width:17px}.mm-stores-location{font-size:11px;gap:4px}.mm-stores-card h3{font-size:18px;line-height:1.45;letter-spacing:-.55px}.mm-stores-address{font-size:14px;line-height:1.65;margin-top:6px!important;margin-bottom:16px!important;min-height:0}.mm-stores-actions{gap:7px}.mm-stores-action{font-size:13px;gap:5px;min-height:47px;flex-basis:130px;padding:11px 8px;border-radius:9px}.mm-stores-action>svg:first-child{width:16px}.mm-stores-action>svg:last-child{width:11px}.mm-stores-more-wrap{margin-top:22px}.mm-stores-more{min-height:50px;font-size:14px;gap:12px}.mm-stores-more-wrap>p{font-size:11px}.mm-stores-recent{padding:10px 14px 15px;margin-bottom:20px}.mm-stores-recent-body{display:block}.mm-stores-recent-body h2{font-size:17px;margin-bottom:11px}.mm-stores-actions-small{width:100%}.mm-stores-recent-heading>span{font-size:11px}.mm-stores-recent-heading>button{margin-right:-8px}.mm-stores-empty{min-height:280px;padding:33px 14px}.mm-stores-empty h3{font-size:19px}.mm-stores-empty>p{font-size:14px}.mm-stores-help-section{padding:31px 0 36px}.mm-stores-help-layout{grid-template-columns:1fr;gap:22px}.mm-stores-help-intro h2{font-size:22px;letter-spacing:-.7px}.mm-stores-help-intro>p:last-child{font-size:14px;margin-top:9px!important}.mm-stores-help-intro>p:last-child br{display:none}.mm-stores-help-intro .mm-stores-eyebrow{font-size:11px;margin-bottom:7px!important}.mm-stores-details>summary{min-height:61px;font-size:14px;gap:12px;padding:16px 0}.mm-stores-details-content{font-size:14px;line-height:1.8;padding-bottom:20px}.mm-stores-copy-controls select{font-size:14px;flex-basis:100%;width:100%}.mm-stores-copy-controls button{width:100%;font-size:14px}.mm-stores-copy-status{font-size:12px}.mm-stores-details-content>label{font-size:12px}.mm-stores-steps{gap:15px}.mm-stores-steps strong{font-size:14px}.mm-stores-steps p{font-size:13px}.mm-stores-web-help{font-size:13px}.mm-stores-footer{padding-top:26px}.mm-stores-footer-top{display:block;margin-bottom:17px}.mm-stores-footer-top img{width:133px}.mm-stores-footer-top>p{font-size:11px;margin-top:9px}.mm-stores-footer-details{font-size:12px;line-height:1.9}.mm-stores-footer-details>p:first-child{display:flex;flex-wrap:wrap;gap:1px 10px}.mm-stores-footer-details>p:first-child>span:first-child{flex-basis:100%}.mm-stores-footer-separator{display:none}.mm-stores-footer-details>p+p{margin-top:7px}.mm-stores-footer-contacts{display:block;margin-top:4px}.mm-stores-footer-contacts a{min-height:44px}.mm-stores-copyright{font-size:10px;padding-top:17px;margin-top:15px!important}
}
@container mm-stores (max-width:370px){.mm-stores-shell{width:calc(100% - 32px)}.mm-stores-about{font-size:11px}.mm-stores-about svg{display:none}.mm-stores-header-inner{gap:10px}.mm-stores-logo-link img{width:109px}.mm-stores-page-label{font-size:11px}.mm-stores-regions button{min-width:51px;padding-inline:9px}.mm-stores-district-wrap{min-width:121px}.mm-stores-card{padding-inline:15px}.mm-stores-action{font-size:12px;gap:5px}.mm-stores-root h1{font-size:28px}}
.mm-stores-header-nav{display:flex;align-items:center;gap:24px;min-width:0}.mm-stores-header-nav .mm-stores-page-label{display:inline-flex;align-items:center;min-height:44px;font-size:14px;font-weight:600;color:#546177;white-space:nowrap}.mm-stores-header-nav a:hover{color:var(--ms-blue)}
.mm-stores-guide-inline{gap:12px;margin-top:18px!important;font-size:13px;color:#546177}.mm-stores-guide-inline .mm-stores-guide-cta{display:inline-flex;align-items:center;justify-content:center;gap:16px;min-height:48px;padding:12px 20px;border:1px solid #2858D9;border-radius:10px;background:var(--ms-blue);color:#fff!important;font-size:14px;font-weight:700;line-height:1.5;box-shadow:0 4px 12px #2858D923;transition:background .18s,box-shadow .18s,transform .18s}.mm-stores-guide-inline .mm-stores-guide-cta:hover{background:#1D49BD;box-shadow:0 6px 16px #2858D930;transform:translateY(-1px)}.mm-stores-guide-inline .mm-stores-guide-cta:active{transform:translateY(0);box-shadow:0 2px 6px #2858D91A}
@container mm-stores (max-width:600px){.mm-stores-header-inner{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:16px;row-gap:0;padding-top:5px;min-height:94px}.mm-stores-header-divider{display:none}.mm-stores-logo-link{grid-column:1;grid-row:1}.mm-stores-about{grid-column:2;grid-row:1}.mm-stores-header-nav{grid-column:1/-1;grid-row:2;gap:26px;min-height:44px;border-top:1px solid #EEF1F7}.mm-stores-header-nav .mm-stores-page-label{font-size:13px;min-height:44px}.mm-stores-guide-inline{flex-wrap:nowrap;justify-content:space-between;gap:12px;margin-top:16px!important;font-size:12px}.mm-stores-guide-inline .mm-stores-guide-cta{flex-shrink:0;min-height:48px;padding:12px 17px;gap:12px;font-size:14px}}
@media(prefers-reduced-motion:reduce){.mm-stores-root *,.mm-stores-root *:before,.mm-stores-root *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
@media(hover:none){.mm-stores-card:hover{box-shadow:0 3px 8px #172F5805;border-color:#E0E6F0}}
`;
