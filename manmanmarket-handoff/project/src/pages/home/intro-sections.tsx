import React, { useEffect, useRef, useState } from "react";
import { pyeongchonCapture } from "./intro-image-1";
import { nokbeonCapture } from "./intro-image-2";
import { garakCapture } from "./intro-image-3";
import { marketPhoto } from "./intro-image-4";
import { freshnessPhoto } from "./intro-image-5";
import { deliveryPhoto } from "./intro-image-6";

// These are the supplied, redacted display images. Never substitute the originals.
const PARTICIPATION = [
  { store: "평촌 어바인퍼스트점", image: pyeongchonCapture, width: 558 },
  { store: "녹번 이편한세상캐슬점", image: nokbeonCapture, width: 561 },
  { store: "가락 쌍용1차아파트점", image: garakCapture, width: 564 },
];
const QUALITY = [
  { title: "새벽 가락시장 경매", lines: ["매일 새벽 4시에","가락시장 경매 현장에서","숙련된 전문가가 직접 눈으로","확인하고 선별합니다."], image: marketPhoto, alt: "가락시장 선별 기준을 소개하는 사진" },
  { title: "백화점 식품관 퀄리티", lines: ["마트나 타 업체가 취급하는","B급과일이 아닙니다.","백화점 식품관에 납품되는","\"특상급\" 상품만을 경매합니다."], image: freshnessPhoto, alt: "맛과 신선도 기준을 소개하는 사진" },
  { title: "신선도 직송 시스템", lines: ["산지 및 경매장에서 만만마켓까지","중간 유통없이 직송합니다.","타사가 흉내낼 수 없는","선도와 당도를 유지합니다."], image: deliveryPhoto, alt: "매장 직송을 소개하는 사진" },
];

// Content stays visible by default. Enter once when it reaches the viewport.
function useIntroReveal(ref: { readonly current: HTMLElement | null }, layoutKey = false) {
  React.useLayoutEffect(() => {
    const container = ref.current;
    const view = container?.ownerDocument.defaultView;
    if (!container || !view || typeof view.IntersectionObserver !== "function") return;
    const reduced = view.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    const targets = Array.from(container.querySelectorAll<HTMLElement>("[data-iq-motion]"));
    const observer = new view.IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.iqEnter = "true";
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -12px 0px" });
    targets.forEach((target) => observer.observe(target));
    const stopMotion = () => {
      if (!reduced.matches) return;
      observer.disconnect();
      targets.forEach((target) => { delete target.dataset.iqEnter; });
    };
    reduced.addEventListener?.("change", stopMotion);
    return () => {
      observer.disconnect();
      reduced.removeEventListener?.("change", stopMotion);
      targets.forEach((target) => { delete target.dataset.iqEnter; });
    };
  }, [ref, layoutKey]);
}

function ParticipationScreenshots() {
  const viewRef = useRef<HTMLDivElement>(null);
  useIntroReveal(viewRef);
  return <div ref={viewRef} className="mm-iq-participation-view">
    <div className="mm-iq-participation-layout" role="group" aria-label="우리 동네 카카오톡방 참여 화면">
      {PARTICIPATION.map((item) => <article className="mm-iq-participation-card" key={item.store} data-iq-motion="">
        <img className="mm-iq-capture-image" src={item.image} alt={`${item.store} 카카오톡방 화면. 고객 닉네임은 가려져 있습니다.`} width={item.width} height="1093" loading="lazy" draggable={false} />
      </article>)}
    </div>
  </div>;
}

// Explicit 2D projection keeps the initial front card correct on Safari too.
function qualityOrbitStyle(index: number, phase: number, radius: number): React.CSSProperties {
  const angle = (index - phase) * Math.PI * 2 / QUALITY.length;
  const depth = radius * (Math.cos(angle) - 1);
  const scale = 1000 / (1000 - depth);
  return {
    "--mm-iq-orbit-x": `${radius * Math.sin(angle) * scale}px`,
    "--mm-iq-orbit-scale": scale,
    "--mm-iq-orbit-layer": Math.round(1000 + depth),
  } as React.CSSProperties;
}

function QualityCards() {
  const viewRef = useRef<HTMLDivElement>(null);
  const [tablet, setTablet] = useState(false);
  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState(0);
  const [radius, setRadius] = useState(240);
  const phaseRef = useRef(0);
  const turnRef = useRef(0);
  const tabletRef = useRef(false);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);

  React.useLayoutEffect(() => {
    const root = viewRef.current?.closest<HTMLElement>(".mm-root");
    const view = root?.ownerDocument.defaultView;
    if (!root || !view) return;
    const update = () => {
      const isTablet = root.clientWidth > 600 && root.clientWidth <= 1100;
      setRadius(Math.max(180, Math.min(310, root.clientWidth * .32)));
      if (tabletRef.current !== isTablet) {
        tabletRef.current = isTablet;
        setTablet(isTablet);
        turnRef.current = 0;
        phaseRef.current = 0;
        setTurn(0);
        setPhase(0);
        pointerRef.current = null;
      }
    };
    update();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    observer?.observe(root);
    if (!observer) view.addEventListener("resize", update);
    return () => { observer?.disconnect(); if (!observer) view.removeEventListener("resize", update); };
  }, []);

  useEffect(() => {
    const view = viewRef.current?.ownerDocument.defaultView;
    if (!view) return;
    const reduced = view.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const finish = () => {
      view.cancelAnimationFrame(frame);
      phaseRef.current = turn;
      setPhase(turn);
    };
    if (!tablet || reduced.matches || phaseRef.current === turn) {
      finish();
      return;
    }
    const from = phaseRef.current;
    const started = view.performance.now();
    const animate = (now: number) => {
      const progress = Math.min(1, (now - started) / 780);
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      const nextPhase = from + (turn - from) * eased;
      phaseRef.current = nextPhase;
      setPhase(nextPhase);
      if (progress < 1) frame = view.requestAnimationFrame(animate);
    };
    frame = view.requestAnimationFrame(animate);
    const onMotionChange = () => { if (reduced.matches) finish(); };
    reduced.addEventListener?.("change", onMotionChange);
    return () => {
      view.cancelAnimationFrame(frame);
      reduced.removeEventListener?.("change", onMotionChange);
    };
  }, [turn, tablet]);

  useIntroReveal(viewRef);
  const active = ((turn % QUALITY.length) + QUALITY.length) % QUALITY.length;
  const rotateBy = (direction: number) => {
    if (!tabletRef.current) return;
    turnRef.current += direction;
    setTurn(turnRef.current);
  };
  const moveTo = (index: number) => {
    const current = ((turnRef.current % QUALITY.length) + QUALITY.length) % QUALITY.length;
    const forward = (index - current + QUALITY.length) % QUALITY.length;
    rotateBy(forward > QUALITY.length / 2 ? forward - QUALITY.length : forward);
  };
  const arrow = <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;

  return <div ref={viewRef} className="mm-iq-quality-view" role="region" aria-label="품질을 고르는 세 가지 기준" aria-roledescription={tablet ? "캐러셀" : undefined} onKeyDown={(event) => {
    if (!tablet || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault(); rotateBy(event.key === "ArrowRight" ? 1 : -1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault(); moveTo(event.key === "Home" ? 0 : QUALITY.length - 1);
    }
  }}>
    <div className="mm-iq-quality-stage">
      <div id="mm-iq-quality-track" className="mm-iq-quality-layout" tabIndex={tablet ? 0 : undefined} aria-label={tablet ? "좌우 방향키로 품질 카드 회전" : undefined}
        onPointerDown={(event) => { if (tablet && event.isPrimary && event.button === 0) pointerRef.current = { x: event.clientX, y: event.clientY }; }}
        onPointerUp={(event) => {
          const start = pointerRef.current;
          pointerRef.current = null;
          if (!start || !tablet) return;
          const dx = event.clientX - start.x, dy = event.clientY - start.y;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) rotateBy(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => { pointerRef.current = null; }} onPointerLeave={() => { pointerRef.current = null; }}>
        {QUALITY.map((item, index) => <article className={`mm-iq-quality-card${active === index ? " mm-iq-quality-active" : ""}`} key={item.title} data-iq-motion="" style={qualityOrbitStyle(index, phase, radius)}
          aria-hidden={tablet && active !== index ? true : undefined} aria-roledescription={tablet ? "슬라이드" : undefined} aria-label={tablet ? `${index + 1} / ${QUALITY.length} · ${item.title}` : undefined}>
          <img className="mm-iq-quality-photo" src={item.image} alt={item.alt} width="1536" height="1024" loading="lazy" draggable={false} />
          <div className="mm-iq-quality-copy"><span className="mm-iq-quality-number" aria-hidden="true">0{index + 1}</span><h3>{item.title}</h3><p>{item.lines.map((line) => <span className="mm-iq-quality-line" key={line}>{line}</span>)}</p></div>
        </article>)}
      </div>
    </div>
    <div className="mm-iq-quality-controls">
      <button type="button" className="mm-iq-quality-prev" aria-label="이전 품질 카드 보기" aria-controls="mm-iq-quality-track" onClick={() => rotateBy(-1)}>{arrow}</button>
      <div className="mm-iq-quality-status" role="status" aria-live="polite" aria-atomic="true"><strong>{QUALITY[active].title}</strong><span>{active + 1} / {QUALITY.length}</span></div>
      <button type="button" aria-label="다음 품질 카드 보기" aria-controls="mm-iq-quality-track" onClick={() => rotateBy(1)}>{arrow}</button>
    </div>
    <p className="mm-iq-quality-hint">좌우로 돌려 비교해 보세요.</p>
  </div>;
}

export function IntroQualitySections({ storeCta }: { storeCta: React.ReactNode }) {
  const introHeadingRef = useRef<HTMLDivElement>(null);
  const qualityHeadingRef = useRef<HTMLDivElement>(null);
  useIntroReveal(introHeadingRef);
  useIntroReveal(qualityHeadingRef);
  return <>
    <section id="mm-intro" className="mm-iq-section mm-iq-intro" tabIndex={-1} aria-labelledby="mm-iq-intro-title">
      <div ref={introHeadingRef} className="mm-iq-heading mm-iq-shell">
        <p className="mm-iq-eyebrow" data-iq-motion="">좋은 물건, 더 가볍게 사는 방법.</p>
        <h2 id="mm-iq-intro-title" className="mm-iq-title" data-iq-motion="" style={{ "--mm-iq-delay": "70ms" } as React.CSSProperties}>만만마켓, 아직 모르셨나요?</h2>
        <p className="mm-iq-lead" data-iq-motion="" style={{ "--mm-iq-delay": "140ms" } as React.CSSProperties}><strong>만만마켓이 저렴하고 퀄리티 있는 이유는</strong>고객의 주문을 먼저 모으고<br />함께 구매해 가격 부담을 낮추기 때문입니다.</p>
        <h3 className="mm-iq-participation-heading" data-iq-motion="">이미 우리 동네 이웃들이 함께하고 있어요.</h3>
      </div>
      <ParticipationScreenshots />
    </section>

    <section id="mm-quality" className="mm-iq-section mm-iq-quality" tabIndex={-1} aria-labelledby="mm-iq-quality-title">
      <div ref={qualityHeadingRef} className="mm-iq-heading mm-iq-shell">
        <h2 id="mm-iq-quality-title" className="mm-iq-title" data-iq-motion="">가격은 만만하게.<br /><span>고르는 기준은 꼼꼼하게.</span></h2>
        <p className="mm-iq-lead" data-iq-motion="" style={{ "--mm-iq-delay": "140ms" } as React.CSSProperties}>만만마켓은 가격뿐 아니라<br />상품을 고르고 전달하는 과정도 살핍니다.</p>
      </div>
      <QualityCards />
      <div className="mm-iq-cta mm-iq-shell">{storeCta}</div>
    </section>

  </>;
}

export const introQualityStyles = `
/* Intro and quality additions are scoped to avoid changing previous sections. */
.mm-iq-section{padding:92px 0;min-width:0;max-width:100%;overflow:clip}
.mm-iq-intro{background:#F5F8FF}
.mm-iq-quality{background:#FFFFFF}
.mm-iq-shell{width:calc(100% - 80px);max-width:1200px;margin-inline:auto}
.mm-iq-heading{text-align:center}
.mm-root .mm-iq-eyebrow{font-size:15px;line-height:1.6;font-weight:600;color:var(--mm-button);margin:0 0 14px}
.mm-root .mm-iq-title{font-size:42px;line-height:1.35;letter-spacing:-1.5px;font-weight:700;color:var(--mm-ink);margin:0;word-break:keep-all;text-wrap:balance}
.mm-iq-title>span{color:var(--mm-blue)}
.mm-iq-lead>strong{display:block;margin-bottom:8px;font-weight:700;color:var(--mm-ink)}
.mm-root .mm-iq-lead{font-size:19px;line-height:1.65;color:var(--mm-muted);margin:20px 0 0;word-break:keep-all}
.mm-root .mm-iq-intro .mm-iq-lead{color:var(--mm-ink)}
.mm-root .mm-iq-participation-heading{font-size:21px;line-height:1.6;font-weight:600;letter-spacing:-.5px;margin:38px 0 24px;color:var(--mm-ink);word-break:keep-all}
.mm-iq-participation-card{align-self:flex-start;width:100%;min-width:0;overflow:hidden;border:1px solid #E0E8F6;border-radius:18px;background:#FFFFFF;box-shadow:0 5px 18px #172A5708}
.mm-root .mm-iq-capture-image{display:block;width:100%;height:auto;max-width:100%}
.mm-iq-quality-card{display:flex;flex-direction:column;width:100%;min-width:0;height:100%;overflow:hidden;border:1px solid #E0E8F6;border-radius:18px;background:#FFFFFF;box-shadow:0 5px 18px #172A5708}
.mm-root .mm-iq-quality-photo{display:block;aspect-ratio:3/2;width:100%;height:auto;object-fit:cover;object-position:center center;flex-shrink:0}
.mm-iq-quality-copy{flex:1;padding:21px 24px 25px}
.mm-iq-quality-number{display:block;color:var(--mm-blue);font-size:12px;line-height:1.4;font-weight:700;margin-bottom:9px;letter-spacing:1px}
.mm-root .mm-iq-quality-copy h3{font-size:20px;line-height:1.5;letter-spacing:-.7px;font-weight:700;color:var(--mm-ink);margin:0;word-break:keep-all}
.mm-root .mm-iq-quality-copy p{font-size:16px;line-height:1.65;color:var(--mm-muted);margin:10px 0 0;word-break:keep-all}
.mm-iq-quality-line{display:block;word-break:keep-all;overflow-wrap:break-word}
.mm-iq-cta{text-align:center;margin-top:38px}
.mm-iq-cta .mm-button{min-height:48px}
@container mm (max-width:1000px){
  .mm-iq-section{padding-block:80px}
  .mm-iq-shell{width:calc(100% - 64px)}
  .mm-root .mm-iq-quality-copy h3{font-size:19px}
  .mm-iq-quality-copy{padding:20px 22px 24px}
  .mm-iq-cta{margin-top:36px}
}
@container mm (max-width:600px){
  .mm-iq-section{padding-block:60px}
  .mm-iq-shell{width:calc(100% - 40px)}
  .mm-root .mm-iq-eyebrow{font-size:13px;margin-bottom:12px}
  .mm-root .mm-iq-title{font-size:29px;letter-spacing:-1.1px;line-height:1.4}
  .mm-root .mm-iq-lead{font-size:16px;line-height:1.7;margin-top:20px}
  .mm-root .mm-iq-participation-heading{font-size:18px;line-height:1.6;letter-spacing:-.5px;margin:36px 0 24px}
  .mm-root .mm-iq-quality-copy p{font-size:15px;line-height:1.7}
  .mm-iq-cta .mm-button{max-width:100%;min-height:48px}
}

/* A stable three-photo group: desktop columns, tablet/mobile overlap, no controls. */
.mm-iq-participation-view{width:100%;min-width:0}
.mm-iq-participation-layout{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;width:calc(100% - 80px);max-width:948px;min-width:0;margin-inline:auto;isolation:isolate}
.mm-iq-participation-card:nth-child(2){--mm-iq-delay:100ms}
.mm-iq-participation-card:nth-child(3){--mm-iq-delay:200ms}
@container mm (max-width:1100px){
  .mm-iq-participation-layout{grid-template-columns:minmax(0,1fr);gap:0;width:calc(100% - 96px);max-width:720px;padding:4px 0 14px;touch-action:pan-y pinch-zoom}
  .mm-iq-participation-layout .mm-iq-participation-card{grid-area:1/1;position:relative;align-self:start;width:41%;border-radius:16px;box-shadow:0 5px 18px #172A5712;z-index:1;transform:translateY(28px)}
  .mm-iq-participation-layout .mm-iq-participation-card:nth-child(1){justify-self:start;--mm-iq-delay:90ms}
  .mm-iq-participation-layout .mm-iq-participation-card:nth-child(2){justify-self:center;width:46%;z-index:2;transform:none;border-color:#D7E2F4;box-shadow:0 10px 24px #172A5720;--mm-iq-delay:0ms}
  .mm-iq-participation-layout .mm-iq-participation-card:nth-child(3){justify-self:end;--mm-iq-delay:180ms}
}
@container mm (max-width:600px){
  .mm-iq-participation-layout{width:calc(100% - 40px);max-width:420px;padding:4px 0 10px}
  .mm-iq-participation-layout .mm-iq-participation-card{width:53%;border-radius:12px;box-shadow:0 5px 14px #172A5712;transform:translateY(22px)}
  .mm-iq-participation-layout .mm-iq-participation-card:nth-child(2){width:60%;transform:none;box-shadow:0 10px 24px #172A5720}
}

/* Stable card DOM: desktop columns, tablet orbit, mobile vertical reading. */
.mm-iq-quality-view{width:100%;min-width:0;margin-top:38px}
.mm-iq-quality-stage{width:calc(100% - 80px);max-width:1200px;margin-inline:auto}
.mm-iq-quality-layout{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;min-width:0}
.mm-iq-quality-card:nth-child(2){--mm-iq-delay:100ms}
.mm-iq-quality-card:nth-child(3){--mm-iq-delay:200ms}
.mm-iq-quality-controls,.mm-iq-quality-hint{display:none}
@container mm (min-width:601px) and (max-width:1100px){
  .mm-iq-quality-stage{width:calc(100% - 64px);max-width:1000px;padding:16px 0 28px;overflow:hidden}
  .mm-iq-quality-layout{grid-template-columns:minmax(0,1fr);gap:0;isolation:isolate;touch-action:pan-y pinch-zoom;outline-offset:-3px}
  .mm-iq-quality-layout .mm-iq-quality-card{grid-area:1/1;position:relative;justify-self:center;align-self:stretch;width:calc(100% - 128px);max-width:520px;height:auto;min-width:0;transform-origin:center;transform:translateX(var(--mm-iq-orbit-x,0px)) scale(var(--mm-iq-orbit-scale,1));z-index:var(--mm-iq-orbit-layer,1);pointer-events:none;box-shadow:0 5px 14px #1E355B0C;transition:box-shadow .78s ease}
  .mm-iq-quality-layout .mm-iq-quality-active{pointer-events:auto;border-color:#B8CAF2;box-shadow:0 12px 25px #1E355B18}
  .mm-iq-quality-copy{padding:22px 26px 26px}
  .mm-root .mm-iq-quality-copy h3{font-size:22px}
  .mm-root .mm-iq-quality-copy p{font-size:17px;line-height:1.7}
  .mm-iq-quality-controls{display:flex;align-items:center;justify-content:space-between;gap:16px;width:calc(100% - 96px);max-width:720px;margin:8px auto 0}
  .mm-iq-quality-controls>button{display:grid;place-items:center;width:48px;height:48px;flex:0 0 48px;padding:0;border:1px solid #C7D5F1;border-radius:50%;background:#FFFFFF;color:var(--mm-button);cursor:pointer}
  .mm-iq-quality-controls>button:hover{background:#EDF3FF}
  .mm-iq-quality-controls>button:focus-visible{outline:2px solid var(--mm-button);outline-offset:3px}
  .mm-iq-quality-prev>svg{transform:rotate(180deg)}
  .mm-iq-quality-status{text-align:center;min-width:0;line-height:1.5;color:#26344B}
  .mm-iq-quality-status>strong{display:block;font-size:15px;font-weight:600}
  .mm-iq-quality-status>span{display:block;margin-top:3px;font-size:13px;color:#43536E;font-variant-numeric:tabular-nums}
  .mm-root .mm-iq-quality-hint{display:block;text-align:center;font-size:13px;line-height:1.6;color:#43536E;margin:12px 0 0}
}
@container mm (max-width:600px){
  .mm-iq-quality-view{margin-top:30px}
  .mm-iq-quality-stage{width:calc(100% - 40px)}
  .mm-iq-quality-layout{grid-template-columns:minmax(0,1fr);gap:24px;touch-action:pan-y pinch-zoom}
  .mm-iq-quality-layout .mm-iq-quality-card{height:auto;--mm-iq-delay:0ms}
}
@media(prefers-reduced-motion:reduce){.mm-iq-quality-card{transition:none!important}}

/* Individual translate preserves the mobile stack's layout transforms. */
[data-iq-motion][data-iq-enter="true"]{animation:mm-iq-enter .65s cubic-bezier(.22,1,.36,1) var(--mm-iq-delay,0ms) backwards}
.mm-iq-participation-card[data-iq-enter="true"],.mm-iq-quality-card[data-iq-enter="true"]{animation-duration:.72s}
@keyframes mm-iq-enter{from{opacity:0;translate:0 12px}to{opacity:1;translate:0 0}}
@container mm (max-width:600px){
  [data-iq-motion][data-iq-enter="true"]{animation-duration:.6s}
}
@media(prefers-reduced-motion:reduce){
  [data-iq-motion][data-iq-enter="true"]{animation:none}
}

`;
