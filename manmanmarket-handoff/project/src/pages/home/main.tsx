import React, { useEffect, useRef, useState } from "react";
import { IntroQualitySections, introQualityStyles } from "./intro-sections";
import { DealHero, dealHeroStyles } from "./hero";

/*
 * 만만마켓 고객용 홈페이지 — 검토 초안 / 자동 게시하지 않음.
 * 기준: output/homepage-prompt/figma-customer-landing-prompt.txt,
 *       website-requirements.txt (2026-10-03).
 * 사진: 공식 홈페이지 뉴스에 수록된 언론사 원본. 재사용 허락 범위 미검증.
 * 후기: 원문 연속 발췌 검증 완료. 공개 재사용 동의 기록 미확인.
 * 모든 출처 URL은 아래 자료에 보존. 후기 URL은 점포 페이지이며 개별 후기 링크가 아님.
 * 게시 전 위 권리 확인 및 최신 지점 선택 링크 확인이 필요함.
 * Paperlogy 우선; 미지원 환경에서는 Noto Sans KR / 시스템 한글 서체로 표시됨.
 * 해당 메모는 작업자용이며 고객 화면에 표시하지 않음.
 */

const STORE_FINDER_URL = "/stores";
// Standard anchor navigation works without Figma Sites.
function goToStores(event: React.MouseEvent<HTMLAnchorElement>) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
}
const CTA_LABEL = "가까운 지점 찾기";
const ASSETS = {
  logo: "/assets/logo.svg",
  footerLogo: "/assets/footer-logo.png",
  store: "/assets/store.jpg",
  fruit: "/assets/fruit.jpg",
  character: "/assets/character.png",
};

const METHODS = [
  {
    title: "동네마트",
    icon: "store",
    headline: ["직접 보고 골라도,", "잘 고른 건지는 고민되니까."],
    description: ["어떤 상품이 맛있을지, 이 가격이면 괜찮은지.", "매장을 둘러보며 하나하나 따져봐야 하는 장보기."],
    items: ["좋은 상품을 알아보는 데 필요한 안목", "다른 판매처와 가격을 비교하는 수고", "매장을 둘러보고 상품을 고르는 시간"],
  },
  {
    title: "온라인 쇼핑",
    icon: "box",
    headline: ["하나 사려는데,", "비교할 것은 너무 많으니까."],
    description: ["사진과 후기를 살펴보고, 판매자와 가격을 비교하고.", "배송 조건까지 확인하다 보면 길어지는 장보기."],
    items: ["여러 상품과 후기를 오가는 번거로움", "사진과 설명으로 품질을 판단하는 고민", "배송비와 도착일까지 따져보는 수고"],
  },
  {
    title: "만만마켓 공동구매",
    icon: "basket",
    headline: ["선별은 만만마켓이,", "선택은 필요한 만큼."],
    description: ["만만마켓이 고른 상품을 공동구매 특가로 만나보세요.", "집에서 상품 소식을 확인하고, 필요한 상품만 예약해 가까운 매장에서 픽업하세요."],
    items: [
      <><span className="mm-cmp-highlight">깐깐한 선별</span>로, 품질을 고르는 고민을 덜고</>,
      <><span className="mm-cmp-highlight">공동구매 특가</span>로, 구매 가격의 부담을 낮추고</>,
      <>상품 소식을 받아보고, <span className="mm-cmp-highlight">필요한 것만</span> 골라 예약</>,
    ],
    featured: true,
  },
];

const REVIEWS = [
  {
    "quote": "미리 주문하고 찾으러오는 공구마켓인데 상품 퀄리티가 너무 좋아요~\n고기도 맛있고 과일 진짜진짜 달구요",
    "store": "식사위시티자이점",
    "date": "2026-08-11",
    "source": "https://map.naver.com/p/entry/place/2016524894",
    "theme": "상품 품질에 대한 만족"
  },
  {
    "quote": "과일이 신선하고 맛있는데\n가격은 매우 합리적",
    "store": "전농 래미안크레시티점",
    "date": "2026-06-26",
    "source": "https://map.naver.com/p/entry/place/2006490782",
    "theme": "신선함과 합리적인 가격"
  },
  {
    "quote": "가격도 저렴하고 일단 품질이 너무 좋아요 사온 바지락으로 조리한건데 알도 크고 맛있어요",
    "store": "잠원메이플자이점",
    "date": "2026-08-12",
    "source": "https://map.naver.com/p/entry/place/2025389400",
    "theme": "가격과 품질 만족"
  },
  {
    "quote": "계란도 항상 만만마켓에서 구매해요~ 신선하고 저렴하고~최고!",
    "store": "미아뉴타운래미안트리베라점",
    "date": "2026-08-19",
    "source": "https://map.naver.com/p/entry/place/2025574990",
    "theme": "신선하고 저렴한 계란"
  },
  {
    "quote": "확실히 저렴하게 구매가능하구 과일야채 다 신선해요",
    "store": "암사프라이어팰리스점",
    "date": "2026-08-13",
    "source": "https://map.naver.com/p/entry/place/2044521802",
    "theme": "가격과 과채 신선함"
  },
  {
    "quote": "공구 뜰 때마다 자주 사고 있어요. 상품이 매일 바뀌고 입고되는 상품마다 가격, 품질이 좋아서 아주 잘 이용하고 있습니다.",
    "store": "녹번 이편한세상캐슬점",
    "date": "2026-07-09",
    "source": "https://map.naver.com/p/entry/place/2054083374",
    "theme": "가격·품질로 이어진 이용"
  },
  {
    "quote": "다양한 제품과 신선식품 그리고 공구를 통해 좋은 제품을 저렴한 가격에 구매할 수 있어서 너무 좋습니다😄😄",
    "store": "운정 초롱꽃마을점",
    "date": "2026-05-13",
    "source": "https://map.naver.com/p/entry/place/2020462543",
    "theme": "좋은 제품과 합리적인 가격"
  },
  {
    "quote": "소소하게 필요한 물품들이 많고 가격도 착해서참새가 방앗간 가듯이 자주 가게 되는곳입니다",
    "store": "문정 올림픽훼밀리점",
    "date": "2026-04-14",
    "source": "https://map.naver.com/p/entry/place/2002496433",
    "theme": "가격 만족과 잦은 방문"
  },
  {
    "quote": "공구로 저렴하게 많은 상품을 구매할수있어 좋아요~^^",
    "store": "신내봉화산역점",
    "date": "2026-08-21",
    "source": "https://map.naver.com/p/entry/place/2090065405",
    "theme": "공동구매 가격 만족"
  },
  {
    "quote": "매일 신선한 채소 과일이 들어와요.\n맛도 있고 좋아요^^",
    "store": "과천 자이아파트점",
    "date": "2026-08-13",
    "source": "https://map.naver.com/p/entry/place/2074103848",
    "theme": "채소·과일의 신선함"
  }
];

const STEPS = [
  { title: "가까운 지점 찾기", text: "이용할 매장을 선택하세요.", icon: "pin" },
  { title: "카카오톡방 참여하기", text: "선택한 지점의 특가 소식을 확인하세요.", icon: "chat" },
  { title: "상품 주문하기", subtitle: "매일 올라오는 특가", text: "원하는 상품을 카카오톡으로 간편하게 주문하세요.", icon: "bag" },
  { title: "매장에서 픽업하기", text: "안내받은 일정에 상품을 받아가세요.", icon: "store" },
];

const FAQS = [
  { q: "미리 주문한 상품만 살 수 있나요?", a: "아니요. 미리 주문하지 않아도 매장에서 상시 판매하는 상품을 구매하실 수 있어요." },
  { q: "상품은 어떻게 주문하나요?", a: "이용할 지점을 선택한 뒤, 해당 지점의 웹 주문 페이지나 카카오톡방 공지에 안내된 방법으로 주문해 주세요." },
  { q: "주문한 상품은 언제 픽업하나요?", a: "상품마다 픽업 일정이 다를 수 있어요. 주문할 때 안내된 일정과 해당 지점의 공지를 확인해 주세요." },
  { q: "결제나 주문 취소는 어떻게 하나요?", a: "주문 전 해당 지점의 결제·취소 안내를 확인해 주세요. 안내를 찾기 어렵다면 해당 지점에 문의해 주세요." },
];

function Icon({ name, size = 24, className = "" }: { name: string; size?: number; className?: string }) {
  const shapes: Record<string, React.ReactNode> = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    diagonal: <><path d="M7 17 17 7M7 7h10v10" /></>,
    pin: <><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    chat: <><path d="M21 11.5a8.3 8.3 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.3 8.3 0 0 1-3.8-.9L3 21l1.9-5.7a8.3 8.3 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.3 8.3 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" /><path d="M8 11h.01M12 11h.01M16 11h.01" strokeWidth="2.8" /></>,
    bag: <><path d="M5 7h14l1 14H4L5 7Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></>,
    store: <><path d="m3 8 2-5h14l2 5v3a3 3 0 0 1-4.5 2.6 3 3 0 0 1-5 0 3 3 0 0 1-5 0A3 3 0 0 1 3 11V8ZM3 8h18M5 14v7h14v-7M10 21v-6h4v6" /></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5" /></>,
    basket: <><path d="M3 9h18l-2 11H5L3 9ZM7 9l3-6M17 9l-3-6M9 13v3M15 13v3" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    plus: <><path d="M5 12h14M12 5v14" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" /></>,
  };
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name] || shapes.arrow}</svg>;
}

function FindStoreButton({ className = "", small = false }: { className?: string; small?: boolean }) {
  return <a className={`mm-button ${small ? "mm-button-small" : ""} ${className}`} href={STORE_FINDER_URL} onClick={goToStores}>
    <span>{CTA_LABEL}</span><Icon name="arrow" size={small ? 18 : 21} />
  </a>;
}

// Project the same circular path into 2D so initial depth order is explicit,
// including on iOS Safari. Never depend on DOM reordering or 3D layer promotion.
function comparisonOrbitStyle(index: number, phase: number, radius: number): React.CSSProperties {
  const angle = (index - phase) * Math.PI * 2 / 3;
  const depth = radius * (Math.cos(angle) - 1);
  const scale = 1000 / (1000 - depth);
  return {
    "--mm-cmp-x": `${radius * Math.sin(angle) * scale}px`,
    "--mm-cmp-scale": scale,
    "--mm-cmp-layer": Math.round(1000 + depth),
  } as React.CSSProperties;
}

function Comparison() {
  // Keep turns unbounded: 2 → 3 moves forward another 120°, never back to 0°.
  const [turn, setTurn] = useState(0);
  const [mobile, setMobile] = useState(false);
  const [phase, setPhase] = useState(0);
  const [radius, setRadius] = useState(160);
  const phaseRef = useRef(0);
  const turnRef = useRef(0);
  const compactRef = useRef<boolean | null>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  // Stable DOM order preserves desktop columns and avoids a hydration-time move.
  // Only the mobile orbit/status order starts with Manman Market.
  const slides = [METHODS[2], METHODS[0], METHODS[1]];
  const activeIndex = ((turn % slides.length) + slides.length) % slides.length;

  useEffect(() => {
    const root = comparisonRef.current?.closest<HTMLElement>(".mm-root");
    const track = trackRef.current;
    if (!root || !track) return;
    let disposed = false;
    let layoutFrame = 0;
    const supportsSubgrid = typeof CSS !== "undefined" && CSS.supports("grid-template-rows", "subgrid");
    const update = () => {
      if (disposed) return;
      const compact = root.clientWidth <= 900;
      setRadius(Math.max(120, Math.min(270, root.clientWidth * .42)));
      if (compactRef.current !== compact) {
        compactRef.current = compact;
        turnRef.current = 0;
        phaseRef.current = 0;
        setPhase(0);
        setTurn(0);
        setMobile(compact);
        pointerRef.current = null;
      }
      // Preserve the existing desktop shared-row fallback.
      if (!supportsSubgrid) {
        const cells = Array.from(track.querySelectorAll<HTMLElement>("[data-cmp-row]"));
        cells.forEach((cell) => { cell.style.minHeight = ""; });
        if (!compact) {
          ["top", "label", "headline", "description", "item-0", "item-1", "item-2"].forEach((row) => {
            const peers = cells.filter((cell) => cell.dataset.cmpRow === row);
            const height = Math.max(0, ...peers.map((cell) => cell.getBoundingClientRect().height));
            peers.forEach((cell) => { cell.style.minHeight = `${Math.ceil(height)}px`; });
          });
        }
      }
    };
    const schedule = () => { cancelAnimationFrame(layoutFrame); layoutFrame = requestAnimationFrame(update); };
    update();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    observer?.observe(root);
    if (!observer) window.addEventListener("resize", schedule);
    root.ownerDocument.fonts?.ready.then(schedule);
    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(layoutFrame);
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const finish = () => {
      cancelAnimationFrame(frame);
      phaseRef.current = turn;
      setPhase(turn);
    };
    if (!mobile || reduced.matches || phaseRef.current === turn) {
      finish();
      return;
    }
    const from = phaseRef.current;
    const started = performance.now();
    const animate = (now: number) => {
      const progress = Math.min(1, (now - started) / 780);
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      const nextPhase = from + (turn - from) * eased;
      phaseRef.current = nextPhase;
      setPhase(nextPhase);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    const onMotionChange = () => { if (reduced.matches) finish(); };
    reduced.addEventListener("change", onMotionChange);
    return () => {
      cancelAnimationFrame(frame);
      reduced.removeEventListener("change", onMotionChange);
    };
  }, [turn, mobile]);

  const rotateBy = (direction: number) => {
    if (!mobile) return;
    turnRef.current += direction;
    setTurn(turnRef.current);
  };
  const moveTo = (index: number) => {
    const current = ((turnRef.current % slides.length) + slides.length) % slides.length;
    const forward = (index - current + slides.length) % slides.length;
    rotateBy(forward > slides.length / 2 ? forward - slides.length : forward);
  };

  return <div ref={comparisonRef} className="mm-cmp mm-reveal" role="region" aria-roledescription={mobile ? "캐러셀" : undefined} aria-label="장보기 방식 비교" onKeyDown={(event) => {
    if (!mobile || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault(); rotateBy(event.key === "ArrowRight" ? 1 : -1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault(); moveTo(event.key === "Home" ? 0 : slides.length - 1);
    }
  }}>
    <div className="mm-cmp-orbit-viewport">
      <div id="mm-comparison-track" className="mm-cmp-track" ref={trackRef} tabIndex={mobile ? 0 : undefined} aria-label={mobile ? "좌우 방향키로 비교 카드 회전" : undefined}
        onPointerDown={(event) => { if (mobile && event.isPrimary && event.button === 0) pointerRef.current = { x: event.clientX, y: event.clientY }; }}
        onPointerUp={(event) => {
          const start = pointerRef.current;
          pointerRef.current = null;
          if (!start || !mobile) return;
          const dx = event.clientX - start.x, dy = event.clientY - start.y;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) rotateBy(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => { pointerRef.current = null; }} onPointerLeave={() => { pointerRef.current = null; }}>
        {METHODS.map((method, index) => {
          const orbitIndex = (index + 1) % METHODS.length;
          return <article key={method.title}
          className={`mm-cmp-card${method.featured ? " mm-cmp-featured" : ""}${activeIndex === orbitIndex ? " mm-cmp-active" : ""}`}
          style={comparisonOrbitStyle(orbitIndex, phase, radius)}
          aria-hidden={mobile && activeIndex !== orbitIndex ? true : undefined}
          aria-roledescription={mobile ? "슬라이드" : undefined} aria-label={mobile ? `${orbitIndex + 1} / ${slides.length} · ${method.title}` : undefined}>
        <div className="mm-cmp-top" data-cmp-row="top"><span className="mm-cmp-icon"><Icon name={method.icon} size={25} /></span>{method.featured && <span className="mm-cmp-tag">우리 동네 공동구매</span>}</div>
        <h3 className="mm-cmp-label" data-cmp-row="label">{method.title}</h3>
        <p className="mm-cmp-headline" data-cmp-row="headline">{method.headline[0]}<br />{method.headline[1]}</p>
        <p className="mm-cmp-description" data-cmp-row="description">{method.description[0]}<br />{method.description[1]}</p>
        <ul className="mm-cmp-items" aria-label={method.featured ? "만만마켓 공동구매의 장점" : `${method.title}의 고민과 수고`}>
          {method.items.map((item, itemIndex) => <li key={itemIndex} data-cmp-row={`item-${itemIndex}`}><span className="mm-cmp-marker" aria-hidden="true">{method.featured ? <Icon name="check" size={19} /> : <span />}</span><span>{item}</span></li>)}
        </ul>
        </article>;})}
      </div>
    </div>
    <div className="mm-cmp-controls">
      <button type="button" className="mm-cmp-prev" aria-label="이전 비교 카드 보기" aria-controls="mm-comparison-track" onClick={() => rotateBy(-1)}><Icon name="arrow" size={20} /></button>
      <div className="mm-cmp-status" role="status" aria-live="polite" aria-atomic="true"><strong>{slides[activeIndex].title}</strong><span>{activeIndex + 1} / {slides.length}</span></div>
      <button type="button" aria-label="다음 비교 카드 보기" aria-controls="mm-comparison-track" onClick={() => rotateBy(1)}><Icon name="arrow" size={20} /></button>
    </div>
    <p className="mm-cmp-hint">좌우로 돌려 비교해 보세요.</p>
  </div>;
}

const MOBILE_REVIEW_EXCERPTS = [
  { review: REVIEWS[2], quote: "가격도 저렴하고 일단 품질이 너무 좋아요" },
  { review: REVIEWS[1], quote: "과일이 신선하고 맛있는데\n가격은 매우 합리적" },
  { review: REVIEWS[4], quote: "확실히 저렴하게 구매가능하구 과일야채 다 신선해요" },
  { review: REVIEWS[6], quote: "좋은 제품을 저렴한 가격에 구매할 수 있어서 너무 좋습니다" },
  { review: REVIEWS[5], quote: "가격, 품질이 좋아서 아주 잘 이용하고 있습니다." }
];

function MobileReviewBubbles() {
  const bubblesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = bubblesRef.current;
    if (!root) return;
    const view = root.ownerDocument.defaultView;
    if (!view || typeof IntersectionObserver === "undefined") return;
    const reduce = view.matchMedia("(prefers-reduced-motion: reduce)");
    const bubbles = Array.from(root.querySelectorAll<HTMLElement>(".mm-review-bubble"));
    const showAll = () => {
      root.dataset.animate = "false";
      bubbles.forEach((bubble) => { bubble.dataset.visible = "true"; });
    };
    if (reduce.matches) { showAll(); return; }
    root.dataset.animate = "true";
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.visible = "true";
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    bubbles.forEach((bubble) => observer.observe(bubble));
    const onMotionChange = () => { if (reduce.matches) { showAll(); observer.disconnect(); } };
    reduce.addEventListener("change", onMotionChange);
    return () => { observer.disconnect(); reduce.removeEventListener("change", onMotionChange); };
  }, []);

  return <div className="mm-mobile-reviews mm-shell" ref={bubblesRef}>
    <ol className="mm-review-bubbles" aria-label="가격과 품질에 대한 고객 후기 5개">
      {MOBILE_REVIEW_EXCERPTS.map(({ review, quote }, index) => <li key={review.store} className={`mm-review-bubble ${index % 2 ? "mm-review-bubble-right" : "mm-review-bubble-left"}`} style={{ "--mm-bubble-delay": `${index * 130}ms` } as React.CSSProperties}>
        <a href={review.source} target="_blank" rel="noopener noreferrer" aria-label={`${quote} — ${review.store} 후기. 네이버 플레이스 점포 페이지에서 출처 확인, 새 창`}>
          <blockquote>{quote}</blockquote>
          <span className="mm-bubble-source">{review.store}<Icon name="diagonal" size={12} /></span>
        </a>
      </li>)}
    </ol>
    <p className="mm-bubble-note">네이버 플레이스 후기 일부 발췌</p>
  </div>;
}

function ReviewGallery() {
  const railRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [interacting, setInteracting] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startInteraction = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    setInteracting(true);
  };
  const finishInteraction = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setInteracting(false), 1200);
  };
  useEffect(() => () => { if (resumeTimer.current) clearTimeout(resumeTimer.current); }, []);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync(); media.addEventListener("change", sync);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    if (railRef.current) observer.observe(railRef.current);
    return () => { media.removeEventListener("change", sync); observer.disconnect(); };
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    const group = groupRef.current;
    if (!rail || !group || interacting || keyboardFocus || reduced || !visible) return;
    let frame = 0;
    let last = 0;
    let position = rail.scrollLeft;
    let cycle = group.offsetWidth;
    const resize = new ResizeObserver(() => { cycle = group.offsetWidth; position = rail.scrollLeft; });
    resize.observe(group);
    const tick = (now: number) => {
      const elapsed = last ? Math.min(now - last, 64) : 0;
      last = now;
      if (!document.hidden && cycle > 0) {
        position = (position + elapsed * (rail.clientWidth <= 600 ? 0.027 : 0.039)) % cycle;
        rail.scrollLeft = position;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); };
  }, [interacting, keyboardFocus, reduced, visible]);

  const move = (direction: number) => {
    const rail = railRef.current;
    const cycle = groupRef.current?.offsetWidth || 0;
    if (!rail || !cycle) return;
    startInteraction();
    finishInteraction();
    const stride = cycle / REVIEWS.length;
    const index = Math.round(rail.scrollLeft / stride);
    const maxScroll = rail.scrollWidth - rail.clientWidth;
    const target = reduced
      ? direction > 0
        ? rail.scrollLeft >= maxScroll - 2 ? 0 : Math.min(maxScroll, (index + 1) * stride)
        : rail.scrollLeft <= 2 ? maxScroll : Math.max(0, (index - 1) * stride)
      : ((index + direction + REVIEWS.length) % REVIEWS.length) * stride;
    // A wrap uses the identical repeated cards; ordinary moves ease into place.
    rail.scrollTo({ left: target, behavior: reduced || Math.abs(target - rail.scrollLeft) > stride * 1.6 ? "auto" : "smooth" });
  };

  return <div className="mm-review-gallery">
    <div className="mm-review-rail" id="mm-review-rail" ref={railRef} data-paused={interacting || keyboardFocus || reduced} role="region" aria-label="가격과 품질에 대한 고객 후기 10개" tabIndex={0}
      onFocusCapture={(event) => { if ((event.target as HTMLElement).matches(":focus-visible")) setKeyboardFocus(true); }}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setKeyboardFocus(false); }}
      onTouchStart={startInteraction} onTouchEnd={finishInteraction} onTouchCancel={finishInteraction}
      onWheel={(event) => { if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) { startInteraction(); finishInteraction(); } }}
      onScroll={(event) => { const rail = event.currentTarget; const cycle = groupRef.current?.offsetWidth || 0; if (interacting && !reduced && cycle && rail.scrollLeft >= cycle) rail.scrollLeft -= cycle; }}
      onKeyDown={(event) => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }}>
      {[0, 1].map((copy) => <div className={`mm-review-group${copy ? " mm-review-copy" : ""}`} key={copy} ref={copy ? undefined : groupRef} aria-hidden={copy ? true : undefined}>
        {REVIEWS.map((review) => <article className="mm-review" key={review.store}>
          <div className="mm-review-top"><span className="mm-quote-mark" aria-hidden="true">“</span><span className="mm-review-theme">{review.theme}</span></div>
          <blockquote>{review.quote}</blockquote>
          <div className="mm-review-attribution"><p className="mm-review-store"><span className="mm-review-location"><Icon name="pin" size={15} /></span>{review.store}</p><p className="mm-review-date">{review.date} 방문</p><a href={review.source} target="_blank" rel="noopener noreferrer" tabIndex={copy ? -1 : 0} aria-label={`${review.store} 네이버 플레이스 점포 페이지에서 후기 출처 확인`}>네이버 플레이스 후기 일부 발췌<Icon name="diagonal" size={16} /></a></div>
        </article>)}
      </div>)}
    </div>
    <MobileReviewBubbles />
  </div>;
}

export default function Layer() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaqs, setOpenFaqs] = useState<number[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("mm-inview");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    root.querySelectorAll(".mm-reveal").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const jumpTo = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    setMenuOpen(false);
    const element = rootRef.current?.querySelector<HTMLElement>(`#${id}`);
    if (!element) return;
    event.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Wait for the mobile menu to collapse before measuring the section position.
    requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      element.focus({ preventScroll: true });
    });
  };

  const toggleFaq = (index: number) => setOpenFaqs((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);

  return <div className="mm-root" lang="ko" ref={rootRef}>
    <style>{styles + introQualityStyles + dealHeroStyles}</style>
    <a className="mm-skip" href="#mm-main" onClick={(event) => jumpTo(event, "mm-main")}>본문 바로가기</a>
    <header className="mm-header">
      <div className="mm-shell mm-header-inner">
        <a className="mm-logo-link" href="#mm-main" aria-label="만만마켓 홈페이지 처음으로" onClick={(event) => jumpTo(event, "mm-main")}><img className="mm-logo" src={ASSETS.logo} alt="만만마켓" width="168" height="34" /></a>
        <nav className="mm-nav" aria-label="주 메뉴">
          <a href="#mm-intro" onClick={(event) => jumpTo(event, "mm-intro")}>만만마켓 소개</a>
          <a href="#mm-reviews" onClick={(event) => jumpTo(event, "mm-reviews")}>고객 후기</a>
        </nav>
        <div className="mm-header-actions"><FindStoreButton small /><button className="mm-menu-button" aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={menuOpen} aria-controls="mm-mobile-nav" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? "close" : "menu"} size={23} /></button></div>
      </div>
      <nav id="mm-mobile-nav" className={`mm-mobile-nav ${menuOpen ? "mm-menu-open" : ""}`} aria-label="모바일 메뉴" hidden={!menuOpen} onKeyDown={(event) => { if (event.key === "Escape") { setMenuOpen(false); rootRef.current?.querySelector<HTMLButtonElement>(".mm-menu-button")?.focus(); } }}>
        <a href="#mm-intro" onClick={(event) => jumpTo(event, "mm-intro")}>만만마켓 소개<Icon name="arrow" size={19} /></a>
        <a href="#mm-reviews" onClick={(event) => jumpTo(event, "mm-reviews")}>고객 후기<Icon name="arrow" size={19} /></a>
      </nav>
    </header>

    <main id="mm-main" tabIndex={-1}>
      <DealHero ctaHref={STORE_FINDER_URL} onCtaClick={goToStores} />

      <IntroQualitySections storeCta={<FindStoreButton />} />

      <section id="mm-about" className="mm-section mm-about" tabIndex={-1} aria-labelledby="mm-about-title">
        <div className="mm-shell">
          <div className="mm-section-heading mm-reveal"><p className="mm-eyebrow">새로운 동네 장보기</p><h2 id="mm-about-title">좋은 상품을 합리적인 가격에.<br />고르는 수고까지 덜어보세요.</h2></div>
          <Comparison />
          <div className="mm-cmp-cta"><a className="mm-button" href={STORE_FINDER_URL} onClick={goToStores}><span>우리 동네 공동구매 확인하기</span><Icon name="arrow" size={21} /></a></div>

          <div className="mm-instore mm-reveal">
            <div className="mm-instore-copy"><p className="mm-eyebrow"><Icon name="sun" size={20} /> 그냥 들러도 좋아요</p><h3>미리 주문하지 않아도<br />방문해 보세요.</h3><p>매장에서 상시 판매하는 상품도<br className="mm-desktop-break" /> 구매하실 수 있어요.</p><div className="mm-product-tags"><span>과일</span><span>냉장·냉동 식품</span><span>상온 상품</span></div><span className="mm-small-line">필요한 상품을 가까운 매장에서 만나보세요.</span></div>
            <div className="mm-instore-gallery">
              <figure className="mm-fruit-figure"><img src={ASSETS.fruit} width="720" height="960" loading="lazy" alt="과일과 계란이 놓인 만만마켓 실제 냉장 진열대" /><figcaption>과일과 일상의 먹거리</figcaption></figure>
              <figure className="mm-store-figure"><img src={ASSETS.store} width="1024" height="768" loading="lazy" alt="냉장·냉동 진열장과 키오스크가 있는 만만마켓 실제 매장" /><figcaption>가까운 매장에서 직접 만나는 상품</figcaption></figure>
            </div>
          </div>
        </div>
      </section>

      <section id="mm-reviews" className="mm-section mm-reviews" tabIndex={-1} aria-labelledby="mm-reviews-title">
        <div className="mm-shell"><div className="mm-section-heading mm-centered mm-reveal"><p className="mm-eyebrow">먼저 이용한 고객들의 실제 후기</p><h2 id="mm-reviews-title">실제 후기가 말해줍니다.</h2></div></div>
        <ReviewGallery />
      </section>

      <section id="mm-how" className="mm-section mm-how" tabIndex={-1} aria-labelledby="mm-how-title">
        <div className="mm-shell">
          <div className="mm-how-heading mm-reveal"><div><p className="mm-eyebrow">처음이라도 간편하게</p><h2 id="mm-how-title">어떻게 사용하나요?</h2></div></div>
          <ol className="mm-steps">
            {STEPS.map((step, index) => <li className="mm-step mm-reveal" key={step.title} style={{ "--mm-delay": `${index * 65}ms` } as React.CSSProperties}>
              <div className="mm-step-visual"><span className="mm-step-number">0{index + 1}</span><div className="mm-step-icon"><Icon name={step.icon} size={32} /></div>{index < 3 && <span className="mm-step-connector" aria-hidden="true"><Icon name="arrow" size={20} /></span>}</div>
              <div className="mm-step-copy"><div className="mm-step-title-row"><h3>{step.title}</h3>{step.subtitle && <span className="mm-step-subtitle">{step.subtitle}</span>}</div><p>{step.text}</p></div>
            </li>)}
          </ol>
          <p className="mm-how-note"><span className="mm-how-note-icon" aria-hidden="true"><Icon name="check" size={17} /></span><span className="mm-how-note-copy"><span>매장 상시 판매 상품은</span>{" "}<span>사전 주문 없이 구매할 수 있어요.</span></span></p>
        </div>
      </section>

      <section className="mm-final-cta" aria-labelledby="mm-final-title">
        <div className="mm-shell mm-final-inner">
          <div className="mm-final-copy mm-reveal"><p className="mm-final-eyebrow">우리 동네에서 시작하는 작은 만족</p><h2 id="mm-final-title">이제, 만만한 가격으로<br />만족을 채워보세요.</h2><p className="mm-final-description">가까운 만만마켓에서 시작하세요.</p><FindStoreButton className="mm-button-white" /></div>
          <div className="mm-character-scene mm-reveal"><div className="mm-character-halo" aria-hidden="true" /><span className="mm-character-spark mm-character-spark-one" aria-hidden="true">✦</span><span className="mm-character-spark mm-character-spark-two" aria-hidden="true">✦</span><img src={ASSETS.character} width="444" height="524" loading="lazy" alt="장바구니를 든 만만마켓 공식 캐릭터" /></div>
        </div>
      </section>

      <section className="mm-section mm-faq-section" aria-labelledby="mm-faq-title">
        <div className="mm-shell mm-faq-layout">
          <div className="mm-faq-heading mm-reveal"><p className="mm-eyebrow">궁금한 점이 있나요?</p><h2 id="mm-faq-title">자주 묻는 질문</h2><p>처음 이용하기 전,<br />이것만 확인해 주세요.</p></div>
          <div className="mm-faq-list mm-reveal">
            {FAQS.map((faq, index) => { const expanded = openFaqs.includes(index); return <div className={`mm-faq ${expanded ? "mm-faq-open" : ""}`} key={faq.q}>
              <h3><button id={`mm-faq-button-${index}`} type="button" aria-expanded={expanded} aria-controls={`mm-faq-panel-${index}`} onClick={() => toggleFaq(index)}><span className="mm-faq-q">Q</span><span className="mm-faq-question">{faq.q}</span><span className="mm-faq-plus"><Icon name="plus" size={21} /></span></button></h3>
              <div id={`mm-faq-panel-${index}`} className="mm-faq-panel" role="region" aria-labelledby={`mm-faq-button-${index}`} aria-hidden={!expanded}><div className="mm-faq-panel-inner"><p>{faq.a}</p></div></div>
            </div>; })}
          </div>
        </div>
      </section>
    </main>

    <footer className="mm-footer">
      <div className="mm-shell">
        <div className="mm-footer-top"><img src={ASSETS.footerLogo} width="174" height="35" alt="만만마켓" /><span>만만한 가격으로, 만족을 경험하다.</span></div>
        <div className="mm-footer-details"><p><span>주식회사 셀렉티카</span><span className="mm-footer-divider" aria-hidden="true"> | </span><span>대표이사: 김정대</span><span className="mm-footer-divider" aria-hidden="true"> | </span><span>사업자등록번호: 366-88-03550</span></p><p>주소: 경기도 과천시 과천대로7길 33, 디테크타워 과천 A동 407호</p><p className="mm-footer-contacts"><a href="tel:02-6242-0229">TEL: 02-6242-0229</a><a href="mailto:selectika@selectika.kr">E-mail: selectika@selectika.kr</a></p></div>
        <p className="mm-copyright">Copyright ⓒ 2025 SELECTIKA. All rights reserved.</p>
      </div>
    </footer>
  </div>;
}

const styles = `

a[aria-label="만만마켓 내부 이용 방법 이동"]{display:none!important}
.mm-guide-help{text-align:center;margin-top:30px}.mm-guide-outline{display:inline-flex;align-items:center;justify-content:center;gap:14px;min-height:48px;padding:12px 20px;border:1px solid #BDCDF1;border-radius:10px;color:var(--mm-button);background:#fff;font-size:16px;font-weight:600}.mm-guide-outline:hover{background:#F0F5FF}.mm-guide-faq{display:inline-flex;align-items:center;gap:10px;min-height:44px;margin:0 26px 20px;color:var(--mm-button);font-size:15px;font-weight:600}


a[aria-label="만만마켓 내부 지점 찾기 이동"]{display:none!important}
/* Figma Sites code component: only the three direct .mm-root host wrappers.
   Their observed layout is relative/block, relative/flex, static/block.
   Keep the viewport/body intact; let the document and FAQ grow naturally. */
div:has(>.mm-root),div:has(>div>.mm-root),div:has(>div>div>.mm-root){height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}

.mm-root{--mm-blue:#3C6FF6;--mm-button:#2858D9;--mm-ink:#01071A;--mm-muted:#687489;container:mm/inline-size;position:relative;width:100%;min-width:0;height:auto;overflow:visible;background:white;color:#2D3643;font:18px/1.7 'Paperlogy','Noto Sans KR',sans-serif;-webkit-font-smoothing:antialiased;text-align:left}.mm-root *{box-sizing:border-box}.mm-root :is(h1,h2,h3,p,figure,blockquote,dl,dd){margin:0}.mm-root img{display:block;max-width:100%}.mm-root a{color:inherit;text-decoration:none}.mm-root button{font:inherit;cursor:pointer}.mm-root svg{display:block;flex-shrink:0}.mm-root :is(h1,h2,h3){color:var(--mm-ink);word-break:keep-all;overflow-wrap:break-word;line-height:1.35;font-weight:700}.mm-root :focus-visible{outline:3px solid #D58000;outline-offset:4px}.mm-root :is(section[id],main[id]){scroll-margin-top:105px}.mm-root :is(section,main)[tabindex]:focus{outline:none}.mm-shell{width:calc(100% - 80px);max-width:1200px;margin:auto}.mm-section{padding:100px 0}.mm-eyebrow{display:flex;align-items:center;gap:8px;color:var(--mm-button);font-size:13px;font-weight:700;margin-bottom:20px!important}.mm-root h2{font-size:clamp(29px,3.3cqw,43px);letter-spacing:-1.6px}.mm-lead{margin-top:22px!important;font-size:18px;color:var(--mm-muted);word-break:keep-all}.mm-centered{text-align:center;margin-inline:auto}.mm-centered .mm-eyebrow{justify-content:center}.mm-button{display:inline-flex;align-items:center;justify-content:center;gap:25px;min-height:58px;padding:16px 24px;border-radius:10px;background:var(--mm-button);color:white!important;font-size:17px;font-weight:700;line-height:1.4;white-space:nowrap;transition:background .18s,transform .18s}.mm-button:hover{background:#1E49BB}.mm-button:active{transform:translateY(2px)}.mm-button-small{min-height:44px;padding:12px 16px;gap:13px;border-radius:8px;font-size:14px}.mm-button-white{background:white;color:#244EC3!important}.mm-button-white:hover{background:#EEF3FF}.mm-skip{position:absolute;top:10px;left:20px;z-index:100;padding:12px;background:white;transform:translateY(-180%)}.mm-skip:focus{transform:none}.mm-header{position:sticky;top:0;z-index:30;background:#fffffff5;border-bottom:1px solid #E9EDF5;backdrop-filter:blur(16px)}.mm-header-inner{height:86px;display:flex;align-items:center;justify-content:space-between;gap:26px}.mm-logo-link{display:flex;align-items:center;min-height:44px;flex-shrink:0}.mm-logo{width:165px;height:auto}.mm-nav{display:flex;gap:30px;margin-left:auto;margin-right:10px;font-size:14px;font-weight:600}.mm-nav a{display:flex;align-items:center;min-height:44px}.mm-nav a:hover{color:var(--mm-button)}.mm-header-actions{display:flex;gap:8px;align-items:center}.mm-menu-button{display:none;width:44px;height:44px;border:0;background:none;color:var(--mm-ink);align-items:center;justify-content:center}.mm-mobile-nav{display:none}
.mm-hero{padding-top:74px;background:linear-gradient(150deg,#fff,#F9FBFF)}.mm-hero-grid{display:grid;grid-template-columns:1.03fr 1fr;gap:50px;align-items:center}.mm-dot,.mm-caption-dot{width:7px;height:7px;background:var(--mm-blue);border-radius:50%}.mm-hero-intro{font-size:13px;animation:mm-enter .5s both}.mm-root h1{font-size:clamp(35px,4.3cqw,58px);line-height:1.25;letter-spacing:-2.5px;font-weight:800;animation:mm-enter .5s .075s both}.mm-root h1 span{color:var(--mm-blue)}.mm-hero-description{font-size:18px;margin-top:25px!important;word-break:keep-all;animation:mm-enter .5s .15s both}.mm-hero-action{margin-top:28px;animation:mm-enter .5s .22s both}.mm-hero-note{display:flex;gap:9px;font-size:13px;color:var(--mm-muted);margin-top:22px!important}.mm-note-check{display:flex;align-items:center;justify-content:center;width:21px;height:21px;flex-shrink:0;border-radius:50%;background:#E9F0FF;color:var(--mm-button);margin-top:2px}.mm-hero-figure{position:relative;padding-top:12px;animation:mm-enter .55s .3s both}.mm-hero-photo-wrap{position:relative;z-index:1}.mm-hero-photo-wrap:before{content:'';position:absolute;inset:-14px -14px 14px 14px;background:#E5EDFF;border-radius:22px;z-index:-1}.mm-hero-photo{width:100%;height:auto;aspect-ratio:1.2;object-fit:cover;object-position:54% center;border-radius:22px}.mm-photo-caption{display:flex;justify-content:space-between;gap:8px;padding-top:15px;font-size:10px;color:#5F6D82}.mm-photo-caption>span:first-child{display:flex;align-items:center;gap:6px;color:#46516A}.mm-caption-dot{width:5px;height:5px}.mm-hero-stamp{display:flex;gap:12px;align-items:center;position:absolute;bottom:65px;left:24px;z-index:2;background:#fffffff5;border-radius:13px;padding:14px 19px;box-shadow:0 10px 35px #081B7120;color:var(--mm-button)}.mm-hero-stamp span{font-size:11px;color:#5A6476}.mm-hero-stamp strong{font-size:14px;color:#182C59}.mm-hero-bottom{display:flex;justify-content:space-between;gap:12px;border-top:1px solid #E5EAF2;margin-top:65px;padding:24px 0;font-size:11px;color:#5F6D82}.mm-scroll-cue{display:flex;align-items:center;gap:10px}.mm-scroll-cue svg{transform:rotate(90deg)}
.mm-comparison{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:45px;border-block:1px solid #DDE4EF}.mm-method{padding:30px 28px;border-right:1px solid #E4E9F1}.mm-method:first-child{padding-left:0}.mm-method:last-child{border:0}.mm-method-featured{background:#F1F5FF;box-shadow:inset 0 3px var(--mm-blue)}.mm-method-top{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:20px}.mm-method-icon{color:#748199}.mm-method-featured :is(h3,.mm-method-icon){color:var(--mm-button)}.mm-method-tag{font-size:10px;font-weight:700;color:var(--mm-button);background:#E1EAFF;border-radius:4px;padding:4px 7px}.mm-method h3{font-size:21px;letter-spacing:-.7px}.mm-method-summary{font-size:16px;color:var(--mm-muted);margin-top:13px!important;min-height:123px;word-break:keep-all}.mm-method dl{border-top:1px solid #DFE5EF}.mm-method dl>div{display:grid;grid-template-columns:66px 1fr;gap:7px;padding-top:16px;font-size:14px;word-break:keep-all}.mm-method dt{color:#5F6D82}.mm-method dd{color:#35445E;font-weight:500}.mm-comparison-note{font-size:11px;color:#5F6D82;margin-top:15px!important}.mm-instore{display:grid;grid-template-columns:.82fr 1.28fr;align-items:center;gap:55px;margin-top:105px}.mm-instore-copy h3{font-size:32px;letter-spacing:-1.2px}.mm-instore-copy>p:not(.mm-eyebrow){font-size:17px;color:var(--mm-muted);margin-top:21px!important}.mm-product-tags{display:flex;flex-wrap:wrap;gap:7px;margin-top:23px}.mm-product-tags span{font-size:11px;padding:6px 10px;border:1px solid #DAE2EF;border-radius:5px}.mm-small-line{display:block;font-size:11px;color:#5F6D82;margin-top:17px}.mm-instore-gallery{display:grid;grid-template-columns:.78fr 1.1fr;gap:18px;align-items:center}.mm-instore-gallery img{width:100%;height:auto;object-fit:cover;border-radius:13px}.mm-fruit-figure img{aspect-ratio:.75}.mm-store-figure{margin-top:45px!important}.mm-store-figure img{aspect-ratio:1.1;object-position:54% center}.mm-instore-gallery figcaption{font-size:10px;color:#5F6D82;margin-top:10px;text-align:center}.mm-reviews{background:#F5F8FF}.mm-review-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;margin-top:45px}.mm-review{background:white;border:1px solid #E6EDF8;border-radius:16px;padding:26px;display:flex;flex-direction:column;transition:transform .2s}.mm-review:hover{transform:translateY(-3px)}.mm-review-top{display:flex;justify-content:space-between;gap:9px;align-items:center}.mm-quote-mark{font:51px/1.2 Georgia,serif;height:40px;color:var(--mm-blue)}.mm-review-theme{font-size:10px;color:#5F6D82}.mm-review blockquote{font-size:18px;line-height:1.85;color:#15233C;font-weight:500;white-space:pre-line;word-break:keep-all;padding:18px 0 29px;flex:1}.mm-review-attribution{border-top:1px solid #EDF0F5;padding-top:18px}.mm-review-store{font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px;color:#36445B}.mm-review-location{color:#7E8FA8}.mm-review-date{font-size:12px;color:#5F6D82;margin-top:5px!important}.mm-review-attribution a{display:flex;align-items:center;justify-content:space-between;gap:6px;min-height:44px;margin-top:4px;font-size:12px;color:#5F6D82}
.mm-how-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:30px}.mm-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:35px;list-style:none;margin:55px 0 0;padding:0}.mm-step-visual{display:flex;align-items:center;position:relative;gap:18px;height:74px;margin-bottom:27px}.mm-step-number{font-size:12px;font-weight:600;letter-spacing:1px;color:#5F6D82;align-self:flex-start}.mm-step-icon{display:flex;align-items:center;justify-content:center;width:72px;height:72px;flex-shrink:0;border-radius:20px;background:#EFF4FF;color:var(--mm-button)}.mm-step-connector{position:absolute;right:0;color:#CAD3E2}.mm-step h3{font-size:18px;letter-spacing:-.6px;margin-bottom:12px}.mm-step p{font-size:15px;color:#6A7689;word-break:keep-all}.mm-step-subtitle{display:inline-block;color:var(--mm-button);font-size:10px;font-weight:700;padding:3px 6px;border-radius:4px;background:#EDF3FF;margin-bottom:7px}.mm-how-note{display:flex;align-items:center;justify-content:center;gap:10px;font-size:13px;color:#626F84;background:#F9FBFF;border:1px solid #EAF0FA;border-radius:9px;margin-top:44px!important;padding:17px 20px;word-break:keep-all}.mm-how-note-icon{display:flex;align-items:center;justify-content:center;flex:0 0 17px;width:17px;height:17px;color:var(--mm-button)}.mm-how-note-copy{min-width:0}.mm-final-cta{background:var(--mm-button);overflow:hidden}.mm-final-inner{display:grid;grid-template-columns:1.1fr .9fr;align-items:center;gap:30px;padding-block:60px;min-height:412px}.mm-final-copy{position:relative;z-index:2}.mm-final-eyebrow{font-size:12px;color:#E4EBFF;margin-bottom:16px!important}.mm-final-cta h2{color:white;font-size:40px}.mm-final-description{margin-top:17px!important;color:#ECF1FF;font-size:16px}.mm-final-cta .mm-button{margin-top:27px}.mm-character-scene{position:relative;align-self:stretch;display:flex;align-items:center;justify-content:center}.mm-character-scene img{position:relative;width:248px;height:auto;z-index:2;transform:rotate(-4deg)}.mm-character-halo{position:absolute;width:330px;height:330px;border:1px solid #ffffff30;border-radius:50%;background:#ffffff12}.mm-character-halo:before{content:'';position:absolute;inset:25px;border:1px solid #ffffff30;border-radius:50%}.mm-character-spark{position:absolute;color:#DFE8FF;font-size:35px;z-index:2}.mm-character-spark-one{left:6%;top:18%}.mm-character-spark-two{right:6%;bottom:15%}.mm-faq-layout{display:grid;grid-template-columns:.78fr 1.22fr;gap:65px}.mm-faq-heading h2{font-size:34px}.mm-faq-heading>p:last-child{font-size:16px;color:#5F6D82;margin-top:20px!important}.mm-faq-list{border-top:1px solid #CCD6E5}.mm-faq{border-bottom:1px solid #E3E9F2}.mm-faq button{display:flex;align-items:center;gap:14px;border:0;background:none;text-align:left;padding:23px 2px;width:100%;min-height:76px;color:#27344B;font-size:16px;font-weight:600;line-height:1.7;word-break:keep-all}.mm-faq-q{color:var(--mm-button);font-size:13px}.mm-faq-question{flex:1}.mm-faq-plus{color:#7B899F;transition:transform .23s}.mm-faq-open .mm-faq-plus{transform:rotate(45deg);color:var(--mm-button)}.mm-faq-panel{display:grid;grid-template-rows:0fr;opacity:0;visibility:hidden;transition:grid-template-rows .23s,opacity .23s,visibility .23s}.mm-faq-open .mm-faq-panel{grid-template-rows:1fr;opacity:1;visibility:visible}.mm-faq-panel-inner{overflow:hidden;min-height:0}.mm-faq-panel p{font-size:14px;line-height:1.9;color:#667389;padding:0 30px 23px 26px;word-break:keep-all}.mm-footer{background:#07112A;color:#B8C3D8;padding:48px 0 33px}.mm-footer-top{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:29px}.mm-footer-top img{width:174px;height:auto}.mm-footer-top>span{font-size:11px;color:#A9B5CE}.mm-footer-details{font-size:14px;line-height:1.95}.mm-footer-details>p+p{margin-top:5px}.mm-footer-contacts{display:flex;flex-wrap:wrap;gap:24px;margin-top:12px!important}.mm-footer-contacts a{display:inline-flex;align-items:center;min-height:32px}.mm-copyright{padding-top:24px;border-top:1px solid #24314B;margin-top:26px!important;font-size:12px;color:#8E9CB8}.mm-reveal.mm-inview{animation:mm-enter .55s ease-out var(--mm-delay,0ms) both}@keyframes mm-enter{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
@container mm (max-width:1000px){.mm-shell{width:calc(100% - 64px)}.mm-nav{gap:18px;font-size:12px}.mm-logo{width:140px}.mm-hero-grid{gap:30px}.mm-hero-intro{font-size:11px}.mm-hero-description{font-size:16px}.mm-desktop-break{display:none}.mm-hero-photo{aspect-ratio:.93}.mm-photo-caption>span:last-child{display:none}.mm-method{padding-inline:20px}.mm-method-summary{font-size:16px;min-height:125px}.mm-method dl>div{display:block}.mm-method dt{font-size:12px;margin-bottom:4px}.mm-method h3{font-size:18px}.mm-instore{gap:30px}.mm-instore-copy h3{font-size:28px}.mm-review{padding:22px 19px}.mm-review blockquote{font-size:16px}.mm-review-top{display:block}.mm-review-theme{display:block}.mm-step h3{font-size:16px}.mm-step p{font-size:14px}.mm-final-cta h2{font-size:34px}.mm-character-halo{width:275px;height:275px}.mm-character-scene img{width:215px}.mm-faq-layout{gap:35px}}
@container mm (max-width:800px){.mm-section{padding:80px 0}.mm-header-inner{height:76px;gap:15px}.mm-nav{display:none}.mm-menu-button{display:flex}.mm-mobile-nav.mm-menu-open{display:flex;flex-direction:column;padding:10px 32px 18px;background:white;border-top:1px solid #E9EDF5}.mm-mobile-nav a{display:flex;align-items:center;justify-content:space-between;min-height:48px;font-size:15px}.mm-hero{padding-top:50px}.mm-hero-note{font-size:12px}.mm-hero-bottom{margin-top:45px}.mm-instore{grid-template-columns:1fr;gap:30px;margin-top:74px}.mm-instore-gallery{grid-template-columns:.75fr 1.25fr}.mm-fruit-figure img{aspect-ratio:1}.mm-store-figure{margin-top:0!important}.mm-store-figure img{aspect-ratio:1.66}.mm-steps{grid-template-columns:repeat(2,minmax(0,1fr));gap:38px 45px}.mm-step h3{font-size:18px}.mm-step p{font-size:16px}.mm-step:nth-child(2) .mm-step-connector{display:none}.mm-final-inner{grid-template-columns:1.2fr .8fr;gap:12px}.mm-faq-heading h2{font-size:28px}.mm-faq button{font-size:14px}.mm-footer-details{font-size:11px}}
@container mm (max-width:600px){.mm-shell{width:calc(100% - 40px)}.mm-section{padding:64px 0}.mm-root :is(section[id],main[id]){scroll-margin-top:86px}.mm-header-inner{height:70px;gap:6px}.mm-logo{width:108px}.mm-header-actions{gap:0}.mm-header .mm-button-small{min-height:44px;padding:10px;font-size:10px;gap:7px}.mm-header .mm-button-small svg{width:14px}.mm-menu-button{width:36px}.mm-hero{padding-top:35px}.mm-hero-grid{grid-template-columns:1fr;gap:34px}.mm-root h1{font-size:clamp(35px,10cqw,40px);letter-spacing:-2px}.mm-hero-description{font-size:16px;line-height:1.85;margin-top:21px!important}.mm-hero-action{margin-top:23px}.mm-button{font-size:15px;min-height:54px;padding:15px 21px}.mm-hero-note{font-size:12px;line-height:1.75;margin-top:20px!important}.mm-hero-note br{display:none}.mm-hero-figure{padding-top:8px;margin-right:7px!important}.mm-hero-photo{aspect-ratio:1.32;border-radius:15px}.mm-hero-photo-wrap:before{inset:-8px -8px 8px 8px;border-radius:15px}.mm-hero-stamp{left:13px;bottom:51px;padding:10px 13px;gap:8px;border-radius:10px}.mm-hero-stamp svg{width:24px}.mm-hero-stamp strong{font-size:12px}.mm-photo-caption{font-size:9px}.mm-hero-bottom{margin-top:28px;padding-block:19px;font-size:9px}.mm-scroll-cue{gap:5px;font-size:8px}.mm-scroll-cue svg{width:14px}.mm-root h2{font-size:29px;letter-spacing:-1.2px}.mm-eyebrow{font-size:12px;margin-bottom:16px!important}.mm-lead{font-size:16px;line-height:1.9;margin-top:18px!important}.mm-comparison{display:flex;flex-direction:column;border:0;gap:15px;margin-top:29px}.mm-method,.mm-method:first-child,.mm-method:last-child{padding:24px 22px;border:1px solid #DFE6F1;border-radius:12px}.mm-method-featured{border-color:#AFC5FC!important}.mm-method-top{margin-bottom:13px}.mm-method h3{font-size:21px}.mm-method-summary{font-size:16px;min-height:0;margin-bottom:20px!important}.mm-method dl>div{display:grid;grid-template-columns:64px 1fr;font-size:16px;padding-top:13px}.mm-method dt{font-size:11px;margin:0}.mm-comparison-note{font-size:10px}.mm-instore{margin-top:61px;gap:25px}.mm-instore-copy>p:not(.mm-eyebrow){font-size:16px}.mm-instore-gallery{grid-template-columns:.88fr 1.12fr;gap:12px}.mm-fruit-figure img{aspect-ratio:.74}.mm-store-figure{margin-top:23px!important}.mm-store-figure img{aspect-ratio:.96}.mm-instore-gallery figcaption{font-size:9px}.mm-centered{text-align:left}.mm-centered .mm-eyebrow{justify-content:flex-start}.mm-reviews h2{max-width:275px}.mm-review-grid{grid-template-columns:1fr;gap:15px;margin-top:28px}.mm-review{padding:24px 24px 17px}.mm-review-top{display:flex}.mm-review blockquote{font-size:17px;padding-bottom:24px}.mm-review-date{font-size:11px}.mm-how-heading{display:block}.mm-steps{display:flex;flex-direction:column;gap:0;margin-top:33px}.mm-step{display:grid;grid-template-columns:67px 1fr;gap:18px;padding-bottom:33px;position:relative}.mm-step:not(:last-child):before{content:'';position:absolute;left:33px;top:70px;bottom:9px;border-left:1px dashed #CDDAF0}.mm-step-visual{height:68px;display:block;margin:0}.mm-step-number{position:absolute;top:-8px;left:-5px;z-index:2;border-radius:50%;background:white;color:var(--mm-button);font-size:10px;letter-spacing:0;border:1px solid #DAE5FA;width:24px;height:24px;display:grid;place-items:center}.mm-step-icon{width:67px;height:67px;border-radius:18px}.mm-step-icon svg{width:30px}.mm-step-connector{display:none}.mm-step-copy{padding-top:2px}.mm-step h3{font-size:17px;margin-bottom:8px}.mm-step p{font-size:16px}.mm-how-note{align-items:center;justify-content:flex-start;text-align:left;font-size:12px;gap:8px;margin-top:29px!important;padding:16px 14px}.mm-how-note-copy>span{display:block}.mm-final-inner{grid-template-columns:1fr;padding-top:45px;padding-bottom:0;gap:20px;min-height:0}.mm-final-cta h2{font-size:29px}.mm-final-description{font-size:16px}.mm-final-eyebrow{font-size:11px}.mm-character-scene{width:245px;height:210px;justify-self:end;margin-top:-12px}.mm-character-scene img{width:165px;margin-bottom:-12px}.mm-character-halo{width:228px;height:228px;top:8px}.mm-character-spark{font-size:26px}.mm-faq-layout{grid-template-columns:1fr;gap:28px}.mm-faq-heading>p:last-child{font-size:15px;margin-top:15px!important}.mm-faq-heading>p:last-child br{display:none}.mm-faq button{font-size:14px;gap:10px;padding:21px 1px}.mm-faq-panel p{font-size:14px;padding-inline:22px}.mm-footer{padding:35px 0 31px}.mm-footer-top{display:block;margin-bottom:23px}.mm-footer-top img{width:141px}.mm-footer-top>span{display:block;font-size:10px;margin-top:17px}.mm-footer-details{font-size:14px;word-break:keep-all}.mm-footer-details>p:first-child{display:flex;flex-wrap:wrap;gap:0 9px}.mm-footer-divider{display:none}.mm-footer-details>p:first-child>span:first-child{flex-basis:100%;margin-bottom:3px}.mm-footer-contacts{display:block;margin-top:9px!important}.mm-footer-contacts a{display:flex;min-height:32px}.mm-copyright{font-size:9px;line-height:1.7;margin-top:22px!important;padding-top:22px}}
@media(prefers-reduced-motion:reduce){.mm-root *,.mm-root *:before,.mm-root *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.mm-review:hover,.mm-button:active{transform:none}}@media(hover:none){.mm-review:hover{transform:none}}

@container mm (max-width:600px){.mm-header .mm-button-small{font-size:12px;min-height:44px}.mm-menu-button{width:44px;min-width:44px;height:44px}.mm-logo{width:103px}.mm-method-summary,.mm-method dl>div,.mm-method dt,.mm-faq button,.mm-faq-panel p,.mm-how-note,.mm-hero-note{font-size:16px}.mm-method dl>div{grid-template-columns:74px minmax(0,1fr)}.mm-method-summary{line-height:1.85}.mm-review-store,.mm-review-date,.mm-review-attribution a,.mm-review-theme,.mm-method-tag,.mm-comparison-note,.mm-small-line,.mm-instore-gallery figcaption,.mm-photo-caption,.mm-product-tags span,.mm-step-subtitle,.mm-final-eyebrow,.mm-footer-top>span,.mm-copyright{font-size:12px}.mm-footer-details{font-size:14px}.mm-footer-contacts a{min-height:44px}.mm-review-attribution a{font-size:12px;min-height:44px}.mm-photo-caption{line-height:1.5}.mm-method-tag{padding:4px 6px}.mm-review-top{gap:8px}.mm-review-theme{line-height:1.5}.mm-hero-bottom{font-size:12px;line-height:1.6}.mm-scroll-cue{display:none}.mm-root h2{font-size:29px}}
.mm-method-phrase{white-space:nowrap}.mm-method dd{text-wrap:balance}.mm-method-featured .mm-method-benefit dd{color:var(--mm-button);font-weight:700}.mm-method-consideration dt{white-space:nowrap}
.mm-comparison-controls,.mm-comparison-hint{display:none}
@container mm (max-width:600px){
  .mm-comparison-shell{margin-top:19px}
  .mm-comparison-stage{--mm-orbit-radius:clamp(110px,32cqw,155px);width:calc(100% + 24px);margin-inline:-12px;padding:24px 0 30px;perspective:950px;overflow:hidden;touch-action:pan-y pinch-zoom;user-select:none;cursor:grab}
  .mm-comparison-stage:active{cursor:grabbing}
  .mm-comparison{display:grid;grid-template-columns:1fr;justify-items:center;gap:0;margin:0;border:0;transform-style:preserve-3d;transform:translateZ(calc(-1 * var(--mm-orbit-radius)))}
  .mm-comparison .mm-method,.mm-comparison .mm-method:first-child,.mm-comparison .mm-method:last-child{grid-area:1/1;align-self:stretch;width:calc(100% - 72px);min-width:0;padding:22px 19px;border:1px solid #DCE4F1;border-radius:17px;background:#FFFFFF;box-shadow:0 5px 15px #172A5712;transform:rotateY(var(--mm-orbit-angle)) translateZ(var(--mm-orbit-radius)) rotateY(var(--mm-orbit-counter-angle));transition:transform .65s cubic-bezier(.22,.61,.36,1),box-shadow .22s,border-color .22s,background .22s;backface-visibility:hidden}
  .mm-comparison .mm-method[data-active="false"]{background:#F3F6FC}
  .mm-comparison .mm-method[data-active="true"]{border-color:#B8C9F2;box-shadow:0 12px 24px #172A5720}
  .mm-comparison .mm-method.mm-method-featured{background:#F1F5FF;border-color:#91B0FC!important;box-shadow:inset 0 3px var(--mm-blue),0 12px 24px #172A5720}
  .mm-comparison .mm-method.mm-method-featured[data-active="false"]{background:#EAF0FE}
  .mm-comparison .mm-method-top{min-height:27px;margin-bottom:14px}
  .mm-comparison .mm-method h3{font-size:21px}
  .mm-comparison .mm-method-tag{font-size:11px;padding:4px 6px}
  .mm-comparison .mm-method-summary{font-size:16px;line-height:1.75;min-height:0;margin-top:12px!important;margin-bottom:20px!important}
  .mm-comparison .mm-method dl>div{grid-template-columns:64px minmax(0,1fr);gap:9px;padding-top:14px;font-size:16px;line-height:1.65}
  .mm-comparison .mm-method dt{font-size:14px;line-height:1.9}
  .mm-comparison-controls{display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:310px;margin:0 auto}
  .mm-comparison-controls button{display:grid;place-items:center;flex-shrink:0;width:46px;height:46px;padding:0;border:1px solid #CFDCF5;border-radius:50%;background:#FFFFFF;color:var(--mm-button);transition:background .18s,transform .18s}
  .mm-comparison-controls button:hover{background:#EDF3FF}
  .mm-comparison-controls button:active{transform:scale(.94)}
  .mm-orbit-prev svg{transform:rotate(180deg)}
  .mm-comparison-status{text-align:center;min-width:0;line-height:1.5}
  .mm-comparison-status strong{display:block;font-size:14px;font-weight:600;color:#27344B}
  .mm-comparison-status>span{display:block;font-size:12px;color:#5F6D82;margin-top:2px;font-variant-numeric:tabular-nums}
  .mm-comparison-hint{display:block;text-align:center;color:#5F6D82;font-size:12px;margin-top:12px!important}
  .mm-comparison-note{margin-top:22px!important}
}

/* Continuous customer stories, inspired by VIVADE's horizontal gallery. */
.mm-review-gallery{margin-top:32px;min-width:0}





.mm-review-rail{display:flex;width:100%;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;overscroll-behavior-x:contain;scroll-behavior:auto;padding:4px max(40px,calc((100% - 1200px)/2)) 10px;touch-action:pan-x pan-y pinch-zoom;-webkit-overflow-scrolling:touch}
.mm-review-rail::-webkit-scrollbar{display:none}.mm-review-rail:focus-visible{outline:2px solid var(--mm-blue);outline-offset:-3px}
.mm-review-group{display:flex;flex:0 0 auto;gap:22px;padding-right:22px}
.mm-review-gallery .mm-review{width:365px;flex:0 0 365px;min-height:348px;padding:26px 25px 18px;box-shadow:0 3px 10px #233C6410;transition:border-color .2s,box-shadow .2s}
.mm-review-gallery .mm-review:hover{transform:none;border-color:#B7CBF6;box-shadow:0 5px 18px #233C6418}
.mm-review-gallery .mm-review-top{display:flex;align-items:center}.mm-review-gallery .mm-review-theme{font-size:12px;background:#F0F4FF;color:#3E5A91;padding:5px 9px;border-radius:6px;line-height:1.5}
.mm-review-gallery .mm-review blockquote{font-size:17px;line-height:1.8;padding:20px 0 26px;overflow-wrap:anywhere}
.mm-review-gallery .mm-review-store{font-size:12px;line-height:1.65}.mm-review-gallery .mm-review-date{font-size:12px}
@container mm (max-width:1000px){.mm-review-rail{padding-inline:32px}.mm-review-gallery .mm-review{width:330px;flex-basis:330px}}
@container mm (max-width:600px){.mm-review-gallery{margin-top:24px}.mm-review-rail{padding:4px 20px 10px}.mm-review-group{gap:14px;padding-right:14px}.mm-review-gallery .mm-review{width:calc(100cqw - 64px);max-width:340px;flex-basis:calc(100cqw - 64px);min-height:360px;padding:22px 22px 15px;border-radius:15px}.mm-review-gallery .mm-review blockquote{font-size:16px;line-height:1.85;padding:16px 0 24px}.mm-review-gallery .mm-review-theme{font-size:11px;padding:5px 7px}}
@media(prefers-reduced-motion:reduce){.mm-review-copy{display:none}}

/* Compact homepage usage overview after removing the two supporting captions. */
.mm-how{padding-block:80px}
.mm-how-heading{display:block}
.mm-how .mm-steps{margin-top:42px}
.mm-how .mm-step-visual{margin-bottom:22px}
.mm-how .mm-guide-help{margin-top:48px}
.mm-how .mm-how-note{margin-top:28px!important}
@container mm (max-width:600px){
  .mm-how{padding-block:48px}
  .mm-how .mm-steps{margin-top:28px}
  .mm-how .mm-step{padding-bottom:28px}
  .mm-how .mm-step:last-child{padding-bottom:0}
  .mm-how .mm-step-visual{margin-bottom:0}
  .mm-how .mm-guide-help{margin-top:36px}
  .mm-how .mm-how-note{margin-top:24px!important}
}

/* Align all step descriptions; place the deal label beside the order heading. */
.mm-how .mm-step-copy{min-width:0}
.mm-how .mm-step-title-row{display:flex;align-items:center;gap:8px;min-height:25px;margin-bottom:12px}
.mm-how .mm-step-title-row h3{margin:0;min-width:0}
.mm-how .mm-step-title-row .mm-step-subtitle{flex-shrink:0;white-space:nowrap;margin:0;font-size:10px;line-height:1.5;padding:3px 6px}
@container mm (min-width:601px) and (max-width:1000px){.mm-how .mm-steps{grid-template-columns:repeat(2,minmax(0,1fr));gap:38px 40px}.mm-how .mm-step:nth-child(2) .mm-step-connector{display:none}}
@container mm (max-width:600px){.mm-how .mm-step-title-row{gap:7px;min-height:24px;margin-bottom:8px}}

/* Shared desktop rows and a continuous three-card mobile turntable. */
.mm-cmp{margin-top:40px;min-width:0;max-width:100%}
.mm-cmp .mm-cmp-track{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;min-width:0;max-width:100%;border:1px solid #DDE5F1;border-radius:18px;background:#FFFFFF;overflow:hidden}
.mm-cmp .mm-cmp-card{display:flex;flex-direction:column;min-width:0;padding:28px;border:0;border-right:1px solid #DDE5F1;background:#FFFFFF;color:#26344B}
.mm-cmp .mm-cmp-card:last-child{border-right:0}
.mm-cmp .mm-cmp-featured{background:#F1F5FF;box-shadow:inset 0 3px var(--mm-blue)}
.mm-cmp .mm-cmp-top{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:42px;margin-bottom:16px}
.mm-cmp .mm-cmp-icon{display:grid;place-items:center;width:42px;height:42px;flex:0 0 42px;border-radius:12px;background:#EDF3FF;color:var(--mm-button)}
.mm-cmp .mm-cmp-featured .mm-cmp-icon{background:#FFFFFF}
.mm-cmp .mm-cmp-tag{display:inline-block;padding:5px 8px;border:1px solid #B9CCF8;border-radius:6px;color:var(--mm-button);background:#FFFFFF;font-size:11px;line-height:1.5;font-weight:600;white-space:nowrap}
.mm-root .mm-cmp .mm-cmp-label{margin:0 0 17px;font-size:16px;line-height:1.5;font-weight:600;letter-spacing:-.3px;color:#43536E;word-break:keep-all}
.mm-root .mm-cmp .mm-cmp-headline{margin:0 0 18px;font-size:24px;line-height:1.45;font-weight:700;letter-spacing:-.8px;color:var(--mm-ink);word-break:keep-all;overflow-wrap:break-word}
.mm-root .mm-cmp .mm-cmp-description{margin:0;font-size:16px;line-height:1.75;font-weight:400;letter-spacing:-.2px;color:#26344B;word-break:keep-all;overflow-wrap:break-word}
.mm-cmp .mm-cmp-items{display:grid;grid-template-columns:minmax(0,1fr);gap:0;list-style:none;margin:24px 0 0;padding:22px 0 0;border-top:1px solid #DDE5F1;min-width:0}
.mm-cmp .mm-cmp-featured .mm-cmp-items{border-color:#C4D4F6}
.mm-cmp .mm-cmp-items>li{display:flex;align-items:flex-start;gap:9px;min-width:0;margin:0;padding:0;font-size:16px;line-height:1.75;font-weight:400;letter-spacing:-.2px;color:#26344B;word-break:keep-all;overflow-wrap:break-word}
.mm-cmp .mm-cmp-items>li:not(:last-child){padding-bottom:14px}
.mm-cmp .mm-cmp-items>li>span:last-child{min-width:0}
.mm-cmp .mm-cmp-featured .mm-cmp-items>li{font-weight:700}
.mm-cmp .mm-cmp-marker{display:flex;align-items:center;justify-content:center;flex:0 0 19px;width:19px;height:28px;color:var(--mm-button)}
.mm-cmp .mm-cmp-marker>span{width:4px;height:4px;border-radius:50%;background:#6B7B94}
.mm-cmp .mm-cmp-highlight{color:var(--mm-button)}
.mm-cmp .mm-cmp-controls,.mm-cmp .mm-cmp-hint{display:none}
.mm-about .mm-cmp-cta{text-align:center;margin-top:36px}
@supports(grid-template-rows:subgrid){
  .mm-cmp .mm-cmp-track{grid-template-rows:repeat(7,auto)}
  .mm-cmp .mm-cmp-card{display:grid;grid-template-rows:subgrid;grid-row:1 / span 7}
  .mm-cmp .mm-cmp-card:nth-child(1){grid-column:1}
  .mm-cmp .mm-cmp-card:nth-child(2){grid-column:2}
  .mm-cmp .mm-cmp-card:nth-child(3){grid-column:3}
  .mm-cmp .mm-cmp-items{grid-template-rows:subgrid;grid-row:span 3}
}
@container mm (max-width:1000px){.mm-cmp .mm-cmp-card{padding:24px}}
@container mm (max-width:900px){
  .mm-cmp{margin-top:30px}
  .mm-cmp .mm-cmp-orbit-viewport{width:calc(100% + 40px);margin-inline:-20px;padding:18px 0 26px;overflow:hidden}
  .mm-cmp .mm-cmp-track{display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:auto;gap:0;width:100%;max-width:none;padding:0;border:0;border-radius:0;background:transparent;overflow:visible;isolation:isolate;touch-action:pan-y pinch-zoom}
  .mm-cmp .mm-cmp-track:focus-visible{outline-offset:-3px}
  .mm-cmp .mm-cmp-card,.mm-cmp .mm-cmp-card:nth-child(n){position:relative;display:block;grid-area:1/1;justify-self:center;align-self:stretch;width:calc(100% - 64px);max-width:620px;min-width:0;padding:24px 20px;border:1px solid #DDE5F1;border-radius:17px;transform-origin:50% 50%;transform:translateX(var(--mm-cmp-x,0px)) scale(var(--mm-cmp-scale,1));z-index:var(--mm-cmp-layer,1);transition:box-shadow .78s ease;opacity:1;pointer-events:none;box-shadow:0 5px 14px #1E355B0C}
  .mm-cmp .mm-cmp-card.mm-cmp-active{opacity:1;pointer-events:auto;box-shadow:0 12px 25px #1E355B18}
  .mm-cmp .mm-cmp-card:last-child{border-right:1px solid #DDE5F1}
  .mm-cmp .mm-cmp-featured{border-color:#ABC1F2}
  .mm-cmp .mm-cmp-featured:last-child{border-right-color:#ABC1F2}
  .mm-cmp .mm-cmp-items{display:grid;grid-template-rows:none;grid-row:auto;margin-top:24px;padding-top:22px}
  .mm-cmp .mm-cmp-controls{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:13px}
  .mm-cmp .mm-cmp-controls>button{display:grid;place-items:center;width:48px;min-height:48px;flex:0 0 48px;padding:0;border:1px solid #C7D5F1;border-radius:50%;background:#FFFFFF;color:var(--mm-button)}
  .mm-cmp .mm-cmp-controls>button:disabled{opacity:.36;cursor:default}
  .mm-cmp .mm-cmp-controls>button:not(:disabled):hover{background:#EDF3FF}
  .mm-cmp .mm-cmp-prev>svg{transform:rotate(180deg)}
  .mm-cmp .mm-cmp-status{text-align:center;min-width:0;line-height:1.5;color:#26344B}
  .mm-cmp .mm-cmp-status>strong{display:block;font-size:14px;font-weight:600}
  .mm-cmp .mm-cmp-status>span{display:block;margin-top:3px;font-size:13px;color:#43536E;font-variant-numeric:tabular-nums}
  .mm-root .mm-cmp .mm-cmp-hint{display:block;margin:12px 0 0;font-size:13px;line-height:1.6;text-align:center;color:#43536E}
  .mm-about .mm-cmp-cta{margin-top:32px}
  .mm-about .mm-cmp-cta>.mm-button{width:100%;max-width:420px;min-height:54px;gap:12px;white-space:normal}
}
@media(prefers-reduced-motion:reduce){.mm-cmp .mm-cmp-card{transition:none!important}}

/* Mobile-only compact review conversations; desktop gallery remains unchanged. */
.mm-mobile-reviews{display:none}
@container mm (max-width:600px){
  .mm-reviews .mm-review-rail{display:none}
  .mm-mobile-reviews{display:block}
  .mm-root .mm-review-bubbles{display:flex;flex-direction:column;gap:13px;list-style:none;margin:0;padding:4px 5px 5px}
  .mm-review-bubble{position:relative;isolation:isolate;width:94%;max-width:440px;margin:0;align-self:flex-start;border:1px solid #DAE5F5;border-radius:17px 17px 17px 5px;background:#FFFFFF;box-shadow:0 3px 12px #1F42750A;color:var(--mm-ink);--mm-bubble-from-x:-16px}
  .mm-review-bubble-right{align-self:flex-end;border-color:#CDDDFC;border-radius:17px 17px 5px 17px;background:#EAF1FF;--mm-bubble-from-x:16px}
  .mm-review-bubble:before{content:"";position:absolute;z-index:-1;left:-5px;bottom:14px;width:9px;height:9px;transform:rotate(45deg);background:#FFFFFF;border-left:1px solid #DAE5F5;border-bottom:1px solid #DAE5F5}
  .mm-review-bubble-right:before{left:auto;right:-5px;transform:rotate(225deg);background:#EAF1FF;border-color:#CDDDFC}
  .mm-review-bubble>a{display:block;padding:13px 15px 11px;min-height:44px;color:inherit;text-decoration:none;border-radius:inherit}
  .mm-root .mm-review-bubble blockquote{font-size:16px;line-height:1.65;font-weight:500;letter-spacing:-.35px;word-break:keep-all;overflow-wrap:break-word;white-space:pre-line;margin:0;padding:0}
  .mm-bubble-source{display:flex;align-items:center;justify-content:flex-end;gap:5px;margin-top:7px;color:#526581;font-size:12px;line-height:1.5;word-break:keep-all}
  .mm-bubble-source svg{flex:0 0 12px}
  .mm-root .mm-bubble-note{font-size:12px;line-height:1.65;color:#526581;text-align:center;margin:17px 0 0}
  .mm-mobile-reviews[data-animate="true"] .mm-review-bubble{opacity:0;transform:translate3d(var(--mm-bubble-from-x),20px,0);transition:opacity .56s ease,transform .56s cubic-bezier(.22,.68,0,1.01);transition-delay:var(--mm-bubble-delay)}
  .mm-mobile-reviews[data-animate="true"] .mm-review-bubble[data-visible="true"]{opacity:1;transform:translate3d(0,0,0)}
  .mm-mobile-reviews .mm-review-bubble:focus-within{opacity:1!important;transform:none!important;transition-delay:0s!important}
}
@media(prefers-reduced-motion:reduce){.mm-mobile-reviews .mm-review-bubble{opacity:1!important;transform:none!important;transition:none!important}}

/* Hero: one unified slogan, official wordmark, and shopping-cart mascot. */
.mm-hero-grid{grid-template-columns:1.14fr 1fr;gap:32px}
.mm-hero-brand-block{display:grid;grid-template-columns:minmax(0,1fr) 200px;gap:14px;align-items:center;min-width:0}
.mm-hero-copy{min-width:0}
.mm-root .mm-hero h1.mm-hero-slogan{font-size:28px;line-height:1.55;font-weight:700;letter-spacing:-1px;color:#182C59;margin:0;animation:mm-enter .5s both}
.mm-root .mm-hero-slogan span{font:inherit;letter-spacing:inherit;color:inherit}
.mm-hero-slogan-line{display:block}
.mm-root .mm-hero .mm-hero-inline-logo{display:none}
.mm-hero-slogan-line>span{display:inline-block;white-space:nowrap}
.mm-hero-brand-logo{display:block;width:400px;max-width:100%;height:auto;object-fit:contain;margin-top:20px}
.mm-hero-mascot{display:block;width:100%;height:auto;object-fit:contain;animation:mm-enter .55s .15s both}
.mm-hero .mm-hero-action{margin-top:34px}
.mm-hero .mm-hero-bottom{justify-content:center;align-items:center;margin-top:56px;padding:30px 0 36px}
.mm-root .mm-hero-explore{display:inline-flex;align-items:center;justify-content:space-between;gap:28px;min-width:300px;min-height:64px;padding:10px 12px 10px 28px;border:1.5px solid #B4C8FF;border-radius:999px;background:#fff;color:var(--mm-button);font-size:18px;font-weight:700;line-height:1.4;text-decoration:none;box-shadow:0 7px 22px #2858D914;transition:background .2s,border-color .2s,box-shadow .2s,transform .2s}
.mm-hero-explore-icon{display:grid;place-items:center;flex:0 0 42px;width:42px;height:42px;border-radius:50%;background:var(--mm-button);color:#fff}
.mm-hero-explore-icon svg{transform:rotate(90deg);width:22px;height:22px}
.mm-root .mm-hero-explore:hover{background:#EDF3FF;border-color:var(--mm-button);box-shadow:0 9px 26px #2858D921;transform:translateY(-2px)}
.mm-root .mm-hero-explore:focus-visible{outline:3px solid #2858D9;outline-offset:5px}
@container mm (min-width:601px) and (max-width:1000px){
 .mm-hero-grid{grid-template-columns:1.03fr 1fr;gap:30px}
 .mm-hero-brand-block{display:block}
 .mm-root .mm-hero .mm-hero-mascot{display:none}
 .mm-root .mm-hero h1.mm-hero-slogan{font-size:clamp(20px,2.6cqw,26px);letter-spacing:-.6px}
 .mm-hero-brand-logo{width:300px;margin-top:18px}
}
@container mm (max-width:600px){
 .mm-hero .mm-shell{width:calc(100% - 52px)}
 .mm-hero-grid{grid-template-columns:1fr;gap:34px}
 .mm-hero-brand-block{display:block}
 .mm-root .mm-hero .mm-hero-mascot,.mm-root .mm-hero .mm-hero-brand-logo{display:none}
 .mm-root .mm-hero h1.mm-hero-slogan{font-size:clamp(18.9px,5.76cqw,23.4px);line-height:1.6;font-weight:700;letter-spacing:-.7px}
 .mm-root .mm-hero-slogan .mm-hero-brand-line{display:flex;align-items:center;gap:14px}
 .mm-hero-brand-tagline{flex:0 0 auto}
 .mm-root .mm-hero .mm-hero-inline-logo{display:block;flex:0 1 119px;width:119px;min-width:0;max-width:119px;height:auto;aspect-ratio:4096/821;object-fit:contain}
 .mm-root .mm-hero .mm-hero-action{display:none}
 .mm-hero .mm-hero-figure{margin-right:0!important}
 .mm-hero .mm-hero-photo{aspect-ratio:8/5;object-position:54% center}
 .mm-hero .mm-hero-photo-wrap:before{inset:-6px -2px 6px 2px}
 .mm-root .mm-hero .mm-hero-stamp{display:none}
 .mm-hero .mm-hero-bottom{margin-top:28px;padding:24px 0 30px}
 .mm-root .mm-hero-explore{width:min(100%,260px);min-width:0;min-height:54px;padding:8px 20px;font-size:16px;justify-content:center;gap:12px;border:1px solid #D9E3F6;box-shadow:none}
 .mm-hero-explore-icon{flex-basis:28px;width:28px;height:28px;background:#EDF3FF;color:var(--mm-button)}
 .mm-hero-explore-icon svg{width:18px;height:18px}
 .mm-root .mm-hero-explore:hover{background:#F6F9FF;border-color:#CAD7EF;box-shadow:none;transform:none}
}
@media(prefers-reduced-motion:reduce){.mm-root .mm-hero-explore{transition:none}.mm-root .mm-hero-explore:hover{transform:none}}
/* Mobile store photos share a baseline; keep the review heading on one line. */
@container mm (max-width:600px){
 .mm-root .mm-instore-gallery{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;gap:12px}
 .mm-root .mm-instore-gallery>figure{min-width:0;margin:0!important}
 .mm-root .mm-instore-gallery img{display:block;width:100%;height:auto;aspect-ratio:3/4;object-fit:cover;object-position:center}
 .mm-root #mm-reviews-title{max-width:none;font-size:clamp(20px,6.4cqw,28px);line-height:1.4;letter-spacing:-.7px;white-space:nowrap}
}
`;
