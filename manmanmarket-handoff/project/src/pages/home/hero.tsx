import React, { useEffect, useRef } from "react";

/*
 * 공동구매 종료 히어로 (B안, 2026-10-24 전달본 manman-market-hero/에서 이관).
 * 컨테이너 1200px 이상: 상품 3개 고정 배치. 미만: 3초마다 순환, 전환 1.2초.
 * 동작 줄이기 설정에서는 자동 순환·이동 없음.
 * 특가/상품 교체 시 종료 스티커와 가격 옆 상태도 함께 갱신할 것.
 */

const PRODUCTS = [
  { name: "소곱창전골", size: "1kg", image: "/assets/hero-gopchang.jpg", before: "13,400원", price: "7,400", position: "left" },
  { name: "우거지감자탕", size: "1kg", image: "/assets/hero-gamjatang.jpg", before: "10,180원", price: "5,900", position: "front" },
  { name: "제주 흑돼지 불고기", size: "400g", image: "/assets/hero-bulgogi.jpg", before: "10,400원", price: "4,900", position: "right" },
];

// Ported from the standalone hero.js: orbit projection for containers under 1200px.
function useHeroCarousel(rootRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    const section = root?.querySelector<HTMLElement>(".mm-b-hero");
    const cards = root ? Array.from(root.querySelectorAll<HTMLElement>(".mm-b-card")) : [];
    if (!section || cards.length !== 3) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let compact = false, turn = 1, phase = 1, frame = 0, timer = 0;
    const listeners: (() => void)[] = [];
    const activeIndex = () => ((turn % 3) + 3) % 3;
    function render() {
      const active = activeIndex();
      cards.forEach((card, index) => {
        card.dataset.position = index === active ? "front" : index === (active + 2) % 3 ? "left" : "right";
        if (!compact) {
          card.style.removeProperty("transform");
          card.style.removeProperty("z-index");
          ["role", "tabindex", "aria-label", "aria-pressed"].forEach((name) => card.removeAttribute(name));
          return;
        }
        const angle = (index - phase) * Math.PI * 2 / 3;
        const x = Math.sin(angle), depth = Math.cos(angle);
        card.style.transform = `translateX(calc(-50% + var(--mm-orbit-radius) * ${x.toFixed(5)})) translateY(${((1 - depth) * 12).toFixed(3)}px) scale(${(.92 + .08 * depth).toFixed(5)}) rotate(${(x * 8).toFixed(3)}deg)`;
        card.style.zIndex = String(Math.round(2000 + depth * 1000));
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `${PRODUCTS[index].name} 상품 크게 보기`);
        card.setAttribute("aria-pressed", String(index === active));
      });
    }
    function animateTo(next: number) {
      turn = next;
      cancelAnimationFrame(frame);
      if (!compact || motion.matches) { phase = turn; render(); return; }
      const from = phase;
      let started: number | null = null;
      function animate(now: number) {
        if (started === null) started = now;
        const t = Math.min(1, (now - started) / 1200);
        const eased = t * t * (3 - 2 * t);
        phase = from + (turn - from) * eased;
        render();
        if (t < 1) frame = requestAnimationFrame(animate);
      }
      frame = requestAnimationFrame(animate);
    }
    function resetTimer() {
      clearInterval(timer);
      if (compact && !motion.matches) {
        timer = window.setInterval(() => { if (!document.hidden) animateTo(turn + 1); }, 3000);
      }
    }
    function resize() {
      const next = section!.clientWidth < 1200;
      if (next !== compact) {
        compact = next;
        cancelAnimationFrame(frame);
        phase = turn;
        resetTimer();
      }
      render();
    }
    function motionChanged() {
      cancelAnimationFrame(frame); phase = turn; render(); resetTimer();
    }
    cards.forEach((card, index) => {
      function select() {
        if (!compact) return;
        animateTo(turn + ((index - activeIndex() + 3) % 3));
        resetTimer();
      }
      function keydown(event: KeyboardEvent) {
        if (compact && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault(); select();
        }
      }
      card.addEventListener("click", select);
      card.addEventListener("keydown", keydown);
      listeners.push(() => {
        card.removeEventListener("click", select);
        card.removeEventListener("keydown", keydown);
      });
    });
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    if (observer) observer.observe(section);
    else window.addEventListener("resize", resize);
    motion.addEventListener("change", motionChanged);
    resize();
    return () => {
      cancelAnimationFrame(frame); clearInterval(timer);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      motion.removeEventListener("change", motionChanged);
      listeners.forEach((remove) => remove());
    };
  }, [rootRef]);
}

export function DealHero({ ctaHref, onCtaClick }: { ctaHref: string; onCtaClick?: React.MouseEventHandler<HTMLAnchorElement> }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useHeroCarousel(rootRef);
  return <div className="mmh-root" ref={rootRef}>
    <section className="mm-b-hero" data-color="true" aria-labelledby="mm-hero-title">
      <div className="mm-shell">
        <h1 id="mm-hero-title">이 가격,<br /><span>이미 끝났습니다.</span></h1>
        <div className="mm-b-grid">
          {PRODUCTS.map((product) => <article className="mm-b-card" data-position={product.position} key={product.name}>
            <div className="mm-b-photo"><img src={product.image} alt={`${product.name} 실제 공동구매 안내 이미지 중 상품 사진`} decoding="async" loading="eager" /><span className="mm-b-stamp">공동구매<br />종료</span></div>
            <div className="mm-b-cardbody"><h2>{product.name}<span>{product.size}</span></h2>
              <div className="mm-b-prices"><span className="mm-b-before"><s>{product.before}</s></span><p><span>만만마켓 특가</span><strong>{product.price}<small>원</small><em className="mm-b-price-ended">종료</em></strong></p></div>
            </div>
          </article>)}
        </div>
        <div className="mm-b-next">
          <div><h2>하지만, 끝난 건 이 특가뿐입니다.</h2><p className="mm-b-main-message"><span>매일 달라지는 새로운 공동구매.</span><span className="mm-b-next-benefit">다음 혜택은 놓치지 마세요.</span></p></div>
          <div className="mm-b-action"><a className="mm-button" href={ctaHref} onClick={onCtaClick}>오늘의 공동구매 확인하기<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg></a><p>가까운 지점에서 진행 중인 상품을 확인하세요.</p></div>
        </div>
      </div>
    </section>
  </div>;
}

// hero.css as delivered, minus the remote font @import (Paperlogy is self-hosted via fonts.css).
export const dealHeroStyles = `
.mmh-root{--mm-blue:#3C6FF6;--mm-button:#2858D9;--mm-ink:#01071A;--mm-muted:#687489;container:mmHero/inline-size;position:relative;width:100%;min-width:0;color:#2D3643;background:white;font:18px/1.7 'Paperlogy','Noto Sans KR',sans-serif;-webkit-font-smoothing:antialiased;text-align:left}
.mmh-root *{box-sizing:border-box}
.mmh-root :is(h1,h2,p){margin:0}
.mmh-root img{display:block;max-width:100%}
.mmh-root a{color:inherit;text-decoration:none}
.mmh-root svg{display:block;flex-shrink:0}
.mmh-root :is(h1,h2){color:var(--mm-ink);word-break:keep-all;overflow-wrap:break-word;line-height:1.35;font-weight:700}
.mmh-root :focus-visible{outline:3px solid #D58000;outline-offset:4px}
.mmh-root .mm-shell{width:calc(100% - 80px);max-width:1200px;margin:auto}
.mmh-root .mm-button{display:inline-flex;align-items:center;justify-content:center;gap:25px;min-height:58px;padding:16px 24px;border-radius:10px;background:var(--mm-button);color:white!important;font-size:17px;font-weight:700;line-height:1.4;white-space:nowrap;transition:background .18s,transform .18s}
.mmh-root .mm-button:hover{background:#1E49BB}
@container mmHero (max-width:1000px){.mmh-root .mm-shell{width:calc(100% - 64px)}}
@container mmHero (max-width:600px){.mmh-root .mm-shell{width:calc(100% - 40px)}}
.mmh-root .mm-b-hero {background:#f8f9fc;color:#172039;padding-top:54px}
.mmh-root .mm-b-hero h1 {font-size:clamp(44px,6.1vw,84px);line-height:1.13;letter-spacing:-.065em;font-weight:850;margin:0 0 26px}
.mmh-root .mm-b-hero h1 span {color:#344bea}
.mmh-root .mm-b-grid {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.mmh-root .mm-b-card {background:white;border:1px solid #e1e5ed;border-radius:16px;overflow:hidden;min-width:0}
.mmh-root .mm-b-photo {position:relative;aspect-ratio:1.65;overflow:hidden;background:#ddd}
.mmh-root .mm-b-photo>img {position:absolute;width:100%;max-width:none;height:200%;top:-38%;object-fit:cover;filter:grayscale(1);transition:filter .2s}
.mmh-root .mm-b-hero[data-color=true] .mm-b-photo>img {filter:none}
.mmh-root .mm-b-stamp {position:absolute;top:14px;left:14px;background:#172039e8;color:#fff;font-size:11px;font-weight:600;border-radius:5px;padding:7px 9px}
.mmh-root .mm-b-cardbody {padding:22px}
.mmh-root .mm-b-cardbody h2 {font-size:19px;line-height:1.45;margin:0 0 18px;letter-spacing:-.04em}
.mmh-root .mm-b-cardbody h2>span {font-size:13px;font-weight:500;color:#7b8291;margin-left:8px;white-space:nowrap}
.mmh-root .mm-b-before {font-size:11px;display:flex;gap:8px;justify-content:space-between;color:#777f91}
.mmh-root .mm-b-before s {font-size:14px;color:#777f91}
.mmh-root .mm-b-prices p {display:flex;align-items:center;justify-content:space-between;gap:8px;margin:8px 0 0}
.mmh-root .mm-b-prices p>span {font-size:12px;color:#4b5365}
.mmh-root .mm-b-prices strong {font-size:37px;line-height:1.1;font-weight:850;letter-spacing:-.05em;color:#344bea}
.mmh-root .mm-b-prices small {font-size:17px;margin-left:2px}
.mmh-root .mm-b-next {display:flex;justify-content:space-between;align-items:center;gap:32px;padding:44px 0}
.mmh-root .mm-b-next h2 {font-size:32px;line-height:1.3;letter-spacing:-.05em;margin:0 0 12px}
.mmh-root .mm-b-next p {font-size:17px;line-height:1.7;color:#626a7e;margin:0}
.mmh-root .mm-b-action {flex-shrink:0}
.mmh-root .mm-b-action .mm-button {gap:22px;white-space:nowrap;font-size:16px;padding:19px 24px}
.mmh-root .mm-b-action p {font-size:11px;margin-top:12px;text-align:center}
@container mmHero (max-width: 700px) {
.mmh-root .mm-b-hero {padding-top:34px}
.mmh-root .mm-b-hero h1 {font-size:clamp(37px,10.5cqw,60px);margin-bottom:20px}
.mmh-root .mm-b-grid {grid-template-columns:1fr;gap:14px}
.mmh-root .mm-b-card {display:grid;grid-template-columns:40% 60%;border-radius:12px}
.mmh-root .mm-b-photo {aspect-ratio:auto;min-height:154px;height:100%}
.mmh-root .mm-b-photo>img {width:190%;height:190%;left:-45%;top:-32%;object-fit:cover}
.mmh-root .mm-b-stamp {left:8px;top:8px;font-size:9px;padding:5px}
.mmh-root .mm-b-cardbody {padding:18px 14px}
.mmh-root .mm-b-cardbody h2 {font-size:16px;margin-bottom:14px}
.mmh-root .mm-b-cardbody h2>span {display:block;margin-left:0;font-size:11px;margin-top:2px}
.mmh-root .mm-b-before {font-size:9px;gap:5px}
.mmh-root .mm-b-before s {font-size:11px}
.mmh-root .mm-b-prices p>span {font-size:10px}
.mmh-root .mm-b-prices strong {font-size:30px}
.mmh-root .mm-b-prices small {font-size:14px}
.mmh-root .mm-b-next {display:block;padding:32px 0}
.mmh-root .mm-b-next h2 {font-size:27px}
.mmh-root .mm-b-next p {font-size:15px}
.mmh-root .mm-b-action {margin-top:24px}
.mmh-root .mm-b-action .mm-button {width:100%;justify-content:space-between;font-size:15px}
.mmh-root .mm-b-action p {font-size:10px}
}
.mmh-root .mm-b-hero {padding-top:28px}
.mmh-root .mm-b-hero h1 {font-size:clamp(38px,5cqw,64px);line-height:1.08;margin-bottom:8px;letter-spacing:-.055em}
.mmh-root .mm-b-grid {display:block;position:relative;width:min(100%,720px);height:332px;margin:16px auto 0;isolation:isolate}
.mmh-root .mm-b-card {position:absolute;display:block;width:38%;height:292px;top:20px;overflow:hidden;border-radius:14px;box-shadow:0 14px 28px #17203918;cursor:pointer;transform-origin:50% 70%;transition:transform .25s,top .25s,width .25s,box-shadow .25s}
.mmh-root .mm-b-card[data-position=left] {left:0;transform:rotate(-7deg);z-index:1}
.mmh-root .mm-b-card[data-position=right] {right:0;transform:rotate(7deg);z-index:1}
.mmh-root .mm-b-card[data-position=front] {left:50%;top:0;transform:translateX(-50%);width:44%;height:318px;z-index:3;box-shadow:0 18px 32px #17203926;border-color:#fff}
.mmh-root .mm-b-photo {aspect-ratio:auto;height:174px;min-height:0}
.mmh-root .mm-b-photo>img {width:100%;height:200%;left:0;top:-38%}
.mmh-root .mm-b-card[data-position=front] .mm-b-photo {height:192px}
.mmh-root .mm-b-stamp {top:12px;left:auto;right:12px;width:64px;height:64px;padding:0;border:2px solid white;outline:1px solid #ed443c;background:#ed443c;color:white;border-radius:50%;font-size:14px;line-height:1.15;font-weight:800;text-align:center;display:flex;flex-direction:column;justify-content:center;transform:rotate(12deg);box-shadow:0 3px 9px #400e1620}
.mmh-root .mm-b-cardbody {padding:12px 16px}
.mmh-root .mm-b-cardbody h2 {font-size:17px;margin-bottom:8px;line-height:1.3;white-space:nowrap}
.mmh-root .mm-b-cardbody h2>span {font-size:11px;margin-left:5px}
.mmh-root .mm-b-before {font-size:9px}
.mmh-root .mm-b-before s {font-size:12px}
.mmh-root .mm-b-prices p {margin-top:3px}
.mmh-root .mm-b-prices strong {font-size:32px}
.mmh-root .mm-b-prices p>span {font-size:10px}
.mmh-root .mm-b-next {padding:22px 0 24px;gap:20px}
.mmh-root .mm-b-next h2 {font-size:26px;margin-bottom:6px}
.mmh-root .mm-b-next p {font-size:15px;line-height:1.5}
.mmh-root .mm-b-action .mm-button {font-size:15px;padding:15px 20px;min-height:48px}
.mmh-root .mm-b-action p {font-size:10px;margin-top:6px}
.mmh-root .mm-b-card:focus-visible {outline:3px solid #344bea;outline-offset:4px}
@container mmHero (max-width:700px) {
.mmh-root .mm-b-hero {padding-top:16px;position:relative}
.mmh-root .mm-b-hero h1 {font-size:clamp(31px,9.3cqw,44px);line-height:1.08;margin-bottom:0}
.mmh-root .mm-b-grid {height:237px;width:100%;margin-top:16px}
.mmh-root .mm-b-card {width:45%;height:205px;top:16px;border-radius:11px}
.mmh-root .mm-b-card[data-position=front] {width:56%;height:228px;top:0;border-radius:12px}
.mmh-root .mm-b-photo {height:112px}
.mmh-root .mm-b-card[data-position=front] .mm-b-photo {height:134px}
.mmh-root .mm-b-photo>img {width:100%;height:200%;left:0;top:-38%}
.mmh-root .mm-b-stamp {width:48px;height:48px;top:9px;right:8px;font-size:11px;outline-width:1px}
.mmh-root .mm-b-cardbody {padding:10px 11px}
.mmh-root .mm-b-cardbody h2 {font-size:14px;margin-bottom:8px;line-height:1.15;white-space:normal;letter-spacing:-.04em}
.mmh-root .mm-b-cardbody h2>span {display:inline;font-size:9px;margin-left:4px;white-space:nowrap}
.mmh-root .mm-b-before {justify-content:flex-end;font-size:0;line-height:1.1}
.mmh-root .mm-b-before s {font-size:10px}
.mmh-root .mm-b-prices p {margin-top:3px;gap:4px}
.mmh-root .mm-b-prices p>span {font-size:8px}
.mmh-root .mm-b-prices strong {font-size:27px}
.mmh-root .mm-b-prices small {font-size:12px}
.mmh-root .mm-b-next {padding:15px 0 18px;text-align:center}
.mmh-root .mm-b-next h2 {font-size:23px;line-height:1.2;margin-bottom:6px}
.mmh-root .mm-b-next p {font-size:13px;line-height:1.5}
.mmh-root .mm-b-action {margin-top:12px}
.mmh-root .mm-b-action .mm-button {font-size:14px;padding:11px 16px;min-height:44px;width:100%;justify-content:space-between}
.mmh-root .mm-b-action p {font-size:9px;margin-top:4px}
}
@media(prefers-reduced-motion:reduce) {
.mmh-root .mm-b-card,
.mmh-root .mm-b-photo>img {transition:none}
}
.mmh-root .mm-b-hero h1 {text-align:center;margin:0 0 24px}
.mmh-root .mm-b-hero h1 span {color:#e5443c}
.mmh-root .mm-b-grid {margin-top:0}
.mmh-root .mm-b-card,
.mmh-root .mm-b-card[data-position=front] {left:50%;right:auto;top:0;width:44%;height:318px;will-change:transform;transition:transform 900ms cubic-bezier(.22,.61,.36,1),box-shadow 900ms ease;--mm-spread:200px}
.mmh-root .mm-b-card[data-position=left] {transform:translateX(calc(-50% - var(--mm-spread))) translateY(18px) scale(.9) rotate(-7deg);z-index:1}
.mmh-root .mm-b-card[data-position=right] {transform:translateX(calc(-50% + var(--mm-spread))) translateY(18px) scale(.9) rotate(7deg);z-index:2}
.mmh-root .mm-b-card[data-position=front] {transform:translateX(-50%) translateY(0) scale(1) rotate(0);z-index:3}
.mmh-root .mm-b-card .mm-b-photo,
.mmh-root .mm-b-card[data-position=front] .mm-b-photo {height:192px}
.mmh-root .mm-b-card:focus:not(:focus-visible) {outline:none}
.mmh-root .mm-b-prices p>span {font-size:14px;color:#111;font-weight:700;white-space:nowrap;letter-spacing:-.04em}
.mmh-root .mm-b-next {text-align:center;display:block;padding-top:20px}
.mmh-root .mm-b-next>div>p {color:#111}
.mmh-root .mm-b-next h2 {color:#080b12}
.mmh-root .mm-b-next .mm-b-action {margin-top:16px}
.mmh-root .mm-b-action .mm-button {width:fit-content;max-width:100%;margin-inline:auto;justify-content:center;gap:12px;padding:14px 25px;min-height:48px}
.mmh-root .mm-b-action p {color:#111;font-size:11px}
@container mmHero (max-width:700px) {
.mmh-root .mm-b-hero {padding-top:22px}
.mmh-root .mm-b-hero h1 {font-size:clamp(31px,9.3cqw,44px);line-height:1.12;text-align:center;margin-bottom:22px}
.mmh-root .mm-b-grid {height:243px;margin-top:0}
.mmh-root .mm-b-card,
.mmh-root .mm-b-card[data-position=front] {left:50%;right:auto;top:0;width:56%;height:228px;--mm-spread:22cqw}
.mmh-root .mm-b-card .mm-b-photo,
.mmh-root .mm-b-card[data-position=front] .mm-b-photo {height:134px}
.mmh-root .mm-b-prices p {align-items:center;gap:4px}
.mmh-root .mm-b-prices p>span {font-size:11px;color:#111;line-height:1.3;font-weight:700;max-width:65px;white-space:normal;word-break:keep-all}
.mmh-root .mm-b-cardbody h2 {margin-bottom:7px}
.mmh-root .mm-b-next {padding-top:16px;padding-bottom:22px}
.mmh-root .mm-b-next>div>p {color:#111;font-size:14px;line-height:1.55}
.mmh-root .mm-b-next .mm-b-action {margin-top:14px}
.mmh-root .mm-b-action .mm-button {width:fit-content;justify-content:center;gap:11px;padding:12px 21px;margin-inline:auto;min-height:44px;font-size:14px}
.mmh-root .mm-b-action p {font-size:9px;color:#111;margin-top:6px}
}
@media(prefers-reduced-motion:reduce) {
.mmh-root .mm-b-card {transition:none;will-change:auto}
}
.mmh-root .mm-b-card[data-position=left],
.mmh-root .mm-b-card[data-position=right],
.mmh-root .mm-b-card[data-position=front] {left:50%;right:auto;top:0}
@container mmHero (max-width:700px) {
.mmh-root .mm-b-prices p>span {font-size:12px;max-width:70px}
}
.mmh-root .mm-b-card,
.mmh-root .mm-b-card[data-position=left],
.mmh-root .mm-b-card[data-position=right],
.mmh-root .mm-b-card[data-position=front] {--mm-orbit-radius:231px;transition:none;will-change:transform;backface-visibility:hidden}
@container mmHero (max-width:700px) {
.mmh-root .mm-b-card,
.mmh-root .mm-b-card[data-position=left],
.mmh-root .mm-b-card[data-position=right],
.mmh-root .mm-b-card[data-position=front] {--mm-orbit-radius:25.4cqw}
.mmh-root .mm-b-next {padding-top:10px}
}
@container mmHero (min-width:1200px) {
.mmh-root .mm-b-grid {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;width:100%;height:auto;margin:0 auto 16px;isolation:auto}
.mmh-root .mm-b-card,
.mmh-root .mm-b-card[data-position=left],
.mmh-root .mm-b-card[data-position=right],
.mmh-root .mm-b-card[data-position=front] {position:relative;left:auto;right:auto;top:auto;width:auto;height:auto;transform:none!important;z-index:auto!important;border-radius:14px;border:1px solid #e1e5ed;box-shadow:0 8px 20px #1720390a;cursor:default;will-change:auto;transition:none}
.mmh-root .mm-b-card .mm-b-photo,
.mmh-root .mm-b-card[data-position=front] .mm-b-photo {height:auto;aspect-ratio:1.65}
.mmh-root .mm-b-cardbody {padding:20px 22px}
.mmh-root .mm-b-cardbody h2 {font-size:20px;margin-bottom:14px}
.mmh-root .mm-b-cardbody h2>span {font-size:12px}
.mmh-root .mm-b-before {font-size:11px}
.mmh-root .mm-b-before s {font-size:14px}
.mmh-root .mm-b-prices strong {font-size:38px}
.mmh-root .mm-b-prices small {font-size:17px}
.mmh-root .mm-b-next {padding-top:20px}
}
@container mmHero (min-width:1200px) {
.mmh-root .mm-b-next {padding:48px 0 56px}
.mmh-root .mm-b-next h2 {font-size:clamp(38px,5cqw,64px);line-height:1.12;letter-spacing:-.055em;font-weight:850;margin:0 0 22px}
.mmh-root .mm-b-next>div>p {font-size:clamp(20px,1.8cqw,26px);line-height:1.6;color:#111}
.mmh-root .mm-b-next .mm-b-action {margin-top:30px}
.mmh-root .mm-b-action .mm-button {font-size:22px;line-height:1.4;min-height:66px;padding:20px 38px;gap:18px;border-radius:12px}
.mmh-root .mm-b-action .mm-button svg {width:25px;height:25px;flex-shrink:0}
.mmh-root .mm-b-action p {font-size:14px;line-height:1.6;margin-top:13px}
}
.mmh-root .mm-b-prices strong {display:inline-flex;align-items:baseline;gap:2px;text-decoration:none;white-space:nowrap}
.mmh-root .mm-b-prices strong .mm-b-price-ended {font-style:normal;font-size:12px;line-height:1.2;font-weight:700;letter-spacing:-.02em;color:#d73b35;background:#fff0ef;border:1px solid #f2c7c4;border-radius:4px;padding:3px 5px;margin-left:5px;align-self:center}
@container mmHero (max-width:700px) {
.mmh-root .mm-b-prices p {flex-wrap:wrap;gap:1px 4px}
.mmh-root .mm-b-prices p>span {flex-basis:100%;max-width:none;font-size:10px;line-height:1.2}
.mmh-root .mm-b-prices strong {font-size:26px;margin-left:auto;line-height:1}
.mmh-root .mm-b-prices strong .mm-b-price-ended {font-size:10px;padding:2px 4px;margin-left:3px}
.mmh-root .mm-b-card .mm-b-photo,
.mmh-root .mm-b-card[data-position=front] .mm-b-photo {height:130px}
}
.mmh-root .mm-b-before {justify-content:flex-end}
.mmh-root .mm-b-next {padding:32px 0 40px}
.mmh-root .mm-b-next h2 {font-size:clamp(16px,1.45cqw,21px);line-height:1.5;font-weight:500;letter-spacing:-.035em;margin:0 0 20px;color:#242b38}
.mmh-root .mm-b-next .mm-b-main-message {font-size:clamp(27px,3.2cqw,48px);font-weight:850;line-height:1.4;letter-spacing:-.055em;margin:0;color:#080b12;word-break:keep-all}
.mmh-root .mm-b-main-message>span {display:block}
.mmh-root .mm-b-main-message .mm-b-next-benefit {color:#2e55dc}
.mmh-root .mm-b-next .mm-b-action {margin-top:28px}
@container mmHero (max-width:700px) {
.mmh-root .mm-b-next {padding:15px 0 26px}
.mmh-root .mm-b-next h2 {font-size:14px;font-weight:500;line-height:1.4;margin:0 0 14px}
.mmh-root .mm-b-next .mm-b-main-message {font-size:clamp(17px,5.5cqw,25px);line-height:1.45;letter-spacing:-.055em;font-weight:850;white-space:nowrap}
.mmh-root .mm-b-next .mm-b-action {margin-top:20px}
}
`;
